## Summary

Replace the Admin Products page “Image URL” / “Video URL” text inputs with direct file uploads. Uploads go to a public Supabase Storage bucket, store the resulting public URLs in `Product.imageUrl` / `Product.videoUrl`, and delete old files on update/delete.

## Current State Analysis

- Admin UI currently expects direct URL entry for media: [admin-products.tsx](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/components/admin-products.tsx#L202-L224).
- Product schema stores media as strings: [schema.prisma](file:///home/rai/Documents/programming-stuff/hackathon/luxora/prisma/schema.prisma#L11-L30) (`imageUrl`, `videoUrl?`).
- Product CRUD is implemented via oRPC + Prisma: [product.ts](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/routers/product.ts).
- Supabase Auth is already wired (SSR + browser client). No Storage usage yet.

## Proposed Changes

### 1) Supabase Storage bucket + RLS policies

**Goal:** Public reads (so product pages can load media), admin-only write/update/delete (based on `app_metadata.role = 'admin'`).

- Create a bucket (recommended name): `product-media` (public).
- Ensure RLS policies exist on `storage.objects`:
  - Public read for bucket `product-media`
  - Insert/update/delete only for authenticated users whose JWT has `app_metadata.role = 'admin'`

**SQL (run in Supabase SQL editor or via your migration workflow):**

```sql
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

alter table storage.objects enable row level security;

drop policy if exists "Public read product media" on storage.objects;
create policy "Public read product media"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-media');

drop policy if exists "Admin insert product media" on storage.objects;
create policy "Admin insert product media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-media'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admin update product media" on storage.objects;
create policy "Admin update product media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-media'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  bucket_id = 'product-media'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admin delete product media" on storage.objects;
create policy "Admin delete product media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-media'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
```

### 2) Admin page: replace URL inputs with file upload controls

**File:** [admin-products.tsx](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/components/admin-products.tsx)

- Replace:
  - `imageUrl` text input with an `input type="file"` (accept images)
  - `videoUrl` text input with an `input type="file"` (accept videos; optional)
- Use the browser Supabase client [client.ts](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/lib/supabase/client.ts) to upload:
  - `supabase.storage.from('product-media').upload(path, file, { upsert: true, contentType: file.type })`
  - `getPublicUrl(path)` to produce the stored URL
- Upload path scheme (deterministic + safe):
  - `products/<productId-or-temp>/<kind>-<timestamp>.<ext>`
  - For create (no productId yet): use `crypto.randomUUID()` as `<productId-or-temp>`
- UI behavior:
  - Show upload progress state (“Uploading…”), disable submit while uploading
  - Show preview (image tag for image; link for video) using the returned public URL
  - Keep `imageUrl` required (block submit until uploaded), keep `videoUrl` optional

### 3) Delete old media files on update/delete

Because you want cleanup, implement deletion when:
- Updating a product and image/video is replaced
- Deleting a product

**Implementation location (recommended):** server-side in oRPC procedures so it applies even if another admin client calls the endpoint later.

**File:** [product.ts](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/routers/product.ts)

- Add a small helper to map a generated Supabase public URL back to an object path so we can delete it:
  - Extract `/storage/v1/object/public/product-media/<objectPath>` from `new URL(imageUrl).pathname`
  - Only attempt deletion if the URL matches our project base + bucket pattern
- In `updateProduct`:
  - Fetch existing product first (select `imageUrl`, `videoUrl`)
  - Update via Prisma
  - If `imageUrl` changed, delete old object
  - If `videoUrl` changed, delete old object
- In `deleteProduct`:
  - Fetch existing product first
  - Delete via Prisma
  - Delete old image/video objects (best-effort; don’t fail the whole request if delete fails)
- Use the Supabase server client [server.ts](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/lib/supabase/server.ts) to call Storage with the user’s session (no service role key needed):
  - `const supabase = await createClient()`
  - `await supabase.storage.from('product-media').remove([objectPath])`

### 4) Keep DB schema unchanged

- Keep `Product.imageUrl` and `Product.videoUrl` as strings holding public URLs.
- No Prisma migration needed for this change.

## Assumptions & Decisions

- Storage provider: Supabase Storage (you said either is fine; this is simplest given current auth setup).
- Bucket is public and named `product-media`.
- Cleanup is required, implemented server-side in oRPC for consistency.

## Verification Steps (Execution Phase)

- Confirm bucket exists and policies work:
  - Anonymous user can access a public object URL
  - Non-admin authenticated user cannot upload/delete
  - Admin authenticated user can upload/delete
- In the admin page:
  - Upload image + create product succeeds
  - Upload new image and update product deletes old image object
  - Delete product deletes its image/video objects
- Run `npm run lint` and `npx tsc --noEmit`.

