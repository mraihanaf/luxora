## Summary

Switch the admin product media workflow from Supabase Storage uploads to S3 (AWS SDK v3), using the existing `@aws-sdk/client-s3` dependency and the repo’s S3 helper. Uploads will be performed server-side (so S3 credentials are never exposed to the browser) and the resulting public URL will be stored in `Product.imageUrl` / `Product.videoUrl`. Old objects will be deleted on product update/delete.

## Current State Analysis

- Admin product page currently uploads to Supabase Storage from the browser: [admin-products.tsx](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/components/admin-products.tsx).
- Product cleanup on update/delete currently assumes Supabase public URL patterns and calls Supabase Storage remove: [product.ts](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/routers/product.ts).
- There is an existing S3 helper that uploads objects using AWS SDK v3, but it reads `AWS_*` env vars that do not match the current `.env` (`STORAGE_*`): [s3.ts](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/lib/s3.ts), [.env](file:///home/rai/Documents/programming-stuff/hackathon/luxora/.env).

## Proposed Changes

### 1) Normalize S3 environment variables (server-only)

**File:** [s3.ts](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/lib/s3.ts)

- Update the helper to read from the existing `.env` names:
  - `STORAGE_BUCKET` (bucket name)
  - `STORAGE_REGION`
  - `STORAGE_ACCESS_KEY_ID`
  - `STORAGE_SECRET_ACCESS_KEY`
  - `STORAGE_ENDPOINT` (S3-compatible endpoint; currently Supabase S3 compatibility URL)
- Configure `S3Client` with:
  - `region`
  - `endpoint` (if provided)
  - `credentials` (access key + secret)
  - `forcePathStyle: true` when using an S3-compatible endpoint (typical requirement)
- Add `deleteObject` support:
  - `s3.deleteObject({ key })` implemented via `DeleteObjectCommand`

**Public URL generation**
- Replace the current AWS-only URL generation with logic that supports Supabase S3-compatible endpoints:
  - If `STORAGE_PUBLIC_BASE_URL` exists, use it (recommended escape hatch).
  - Else, if `STORAGE_ENDPOINT` matches `.../storage/v1/s3`, compute:
    - `https://<project>.supabase.co/storage/v1/object/public/<bucket>`
  - Else, fall back to standard AWS-style public URL rules.

This keeps product images/videos accessible publicly without signed URLs.

### 2) Add a server upload endpoint (admin-only)

**Files (new):**
- `src/app/api/admin/upload/route.ts`

**Behavior**
- Accept `multipart/form-data` with one file field:
  - `file`
- Query string inputs:
  - `kind=image|video` (used to determine folder + basic MIME allowlist)
  - `namespace=<uuid|productId>` (used as folder; passed from UI)
- AuthZ:
  - Use Supabase SSR server client to get user
  - Require `user.app_metadata.role === "admin"`; otherwise return 403
- Upload:
  - Generate an object key: `products/<namespace>/<kind>-<timestamp>.<ext>`
  - Upload via `s3.uploadPublicObject({ key, body, contentType })`
  - Return JSON: `{ publicUrl, key }`

**Why route handler (instead of oRPC)**
- oRPC calls are JSON-focused; file streaming / multipart handling is significantly simpler and more robust in a dedicated route handler.
- Admin-only authorization is still enforced server-side using Supabase Auth.

### 3) Update Admin Products UI to use the upload endpoint

**File:** [admin-products.tsx](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/components/admin-products.tsx)

- Replace Supabase Storage client uploads with:
  - `fetch("/api/admin/upload?kind=image&namespace=...")` with `FormData`
- On success:
  - Set `form.imageUrl` / `form.videoUrl` to returned `publicUrl`
  - Also store returned `key` locally in component state so we can delete old objects reliably when replacing (optional but recommended)
- Continue to block submit while uploads are in-flight.

### 4) Update product cleanup to delete S3 objects on update/delete

**File:** [product.ts](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/routers/product.ts)

- Replace Supabase Storage delete logic with S3 deletes:
  - Add helper to map stored public URL back to object key.
    - Primary approach: parse the URL path and strip the known public base prefix computed in `s3.ts`.
    - If mapping fails, skip deletion (best-effort, never block the mutation).
- In `updateProduct`:
  - Fetch existing product `imageUrl` + `videoUrl` first.
  - Update product.
  - If `imageUrl` changed, delete old object.
  - If `videoUrl` changed (including set to null/empty), delete old object.
- In `deleteProduct`:
  - Fetch existing product URLs.
  - Delete product.
  - Delete both old objects (best-effort).

### 5) Remove Supabase Storage bucket RLS requirement for this feature

- Since uploads are no longer going to Supabase Storage via the Storage API, the previous bucket RLS configuration is not required for product-media.
- If you keep using Supabase Storage as an S3-compatible backend, access control is managed by your server-side credentials (and whatever bucket/object permissions exist in that S3-compatible backend).

## Assumptions & Decisions

- Product images/videos are intended to be publicly accessible (public URLs stored in DB).
- S3 credentials remain server-only; the browser never receives access keys.
- The bucket name comes from `.env` (`STORAGE_BUCKET`), and the endpoint may be S3-compatible (Supabase storage S3 endpoint).

## Verification Steps (Execution Phase)

- Upload flow:
  - Admin can upload image/video from `/admin/products` and receives a public URL.
  - Non-admin receives 403 from `/api/admin/upload`.
- CRUD cleanup:
  - Updating product media deletes the old object.
  - Deleting a product deletes its media objects (best-effort).
- Code checks:
  - `npx tsc --noEmit`
  - `npm run lint`

