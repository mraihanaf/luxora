## Summary

Create a Product data model (Prisma + Postgres) for a fashion web app and add admin-only CRUD endpoints via oRPC, using Supabase Auth for identity and an `app_metadata.role = "admin"` claim for authorization. Products remain publicly readable.

## Current State Analysis

- Prisma is set up but has no models and the datasource is missing `url = env("DATABASE_URL")`: [schema.prisma](file:///home/rai/Documents/programming-stuff/hackathon/luxora/prisma/schema.prisma#L1-L8).
- Supabase Auth is integrated (SSR client + login/signup flows), and oRPC context already includes the Supabase user object: [server.ts](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/lib/orpc/server.ts#L18-L26).
- oRPC has an “authed” middleware that checks login only (no roles): [base.ts](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/routers/base.ts#L10-L21).
- No existing RBAC/admin checks, no product routes, and no SQL migrations in-repo.

## Proposed Changes

### 1) Prisma schema: Product model

**File:** [schema.prisma](file:///home/rai/Documents/programming-stuff/hackathon/luxora/prisma/schema.prisma)

- Add `url = env("DATABASE_URL")` to the datasource so Prisma can connect for generate/migrate.
- Add an enum for product type:
  - `TOP`, `BOTTOM`, `HEADWEAR`
- Add a `Product` model (IDR currency; integer rupiah amounts):
  - `id` (string ID, `cuid()` default)
  - `type` (enum)
  - `name` (string)
  - `description` (optional string)
  - `imageUrl` (string)
  - `videoUrl` (optional string)
  - `priceIdr` (int; rupiah)
  - `createdAt`, `updatedAt`
- Add a couple of helpful indexes (e.g., `type`, maybe `name`) if desired.

### 2) Authorization model: Supabase `app_metadata` role claim

**Goal:** Admin role is not user-editable, and is assigned by project admins only.

- Use `user.app_metadata.role === "admin"` for authorization decisions.
- Do not use `user_metadata` for authorization.

**Admin assignment (“set in Supabase admin directly”):**
- Yes, this is possible, but the secure approach is to set `app_metadata` via the Supabase Admin API (requires service role key) or by updating `auth.users.raw_app_meta_data` as a database owner.
- Plan uses the Admin API path (your selected option): `supabase.auth.admin.updateUserById(userId, { app_metadata: { role: "admin" } })`.

### 3) oRPC: add admin middleware + Product CRUD routes

**Files:**
- [base.ts](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/routers/base.ts)
- `src/routers/product.ts` (new)
- [index.ts](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/routers/index.ts)

**base.ts**
- Add an `adminMiddleware` that:
  - Reuses `authedMiddleware` (must be logged in first)
  - Checks `context.user.app_metadata?.role === "admin"`
  - Throws an oRPC error (e.g. `FORBIDDEN`) if not admin

**product.ts (new)**
- Implement procedures with Zod validation:
  - `listProducts` (public): returns basic product list (optionally allow simple pagination later)
  - `getProduct` (public): fetch by `id`
  - `createProduct` (admin): insert product
  - `updateProduct` (admin): update allowed fields by `id`
  - `deleteProduct` (admin): delete by `id`
- Use Prisma for all DB operations via `@/lib/prisma` (per workspace rule).
- Represent money as `priceIdr` integer.

**index.ts**
- Export product procedures on the main `router` object (either by spreading the imported product router entries or by namespacing them consistently).

### 4) Supabase admin client helper (server-only)

**File:** `src/lib/supabase/admin.ts` (new)

- Create a Supabase server-side “admin” client using:
  - `process.env.NEXT_PUBLIC_SUPABASE_URL`
  - `process.env.SUPABASE_SERVICE_ROLE_KEY` (new env var; never exposed to client)
- This helper is used for one-off admin role assignment scripts or internal admin-only server actions (not exposed to the browser).

### 5) Optional: one-off script to promote a user to admin

**File:** `scripts/set-admin.ts` (new, optional but recommended for DX)

- Reads a `USER_ID` from CLI args or env, calls `supabase.auth.admin.updateUserById(...)`.
- This is the “Supabase admin directly” workflow without building UI.

## Assumptions & Decisions

- Currency is fixed to IDR (rupiah) and stored as integer `priceIdr`.
- Product media fields are stored as public URL strings (`imageUrl`, `videoUrl?`).
- Product read access is public; only admins can create/update/delete.
- RBAC is enforced at the oRPC layer (application server) because Prisma connections typically use a privileged DB role and do not carry per-user JWT claims into Postgres.

## Verification Steps (Execution Phase)

- Run `prisma generate` and ensure generated client updates without errors.
- Apply a Prisma migration (dev/local or against your target database) and confirm the `Product` table + enum exist.
- Seed a test product via the admin endpoint and verify:
  - Public `listProducts/getProduct` return data without auth
  - Non-admin authenticated users cannot call create/update/delete
  - Admin users (with `app_metadata.role=admin`) can CRUD successfully
- Confirm no secrets are exposed to the browser (service role key must remain server-only).

## Answer: “Can the admin role be set in Supabase admin directly?”

Yes. The recommended approach is to set a non-user-editable role in `app_metadata` using the Supabase Admin API (requires the service role key and should only run server-side). The Supabase Dashboard may not expose `app_metadata` editing in all setups, so a small server-side script is usually the most reliable “admin-set” workflow.

## How to assign admin role to an existing user (Admin API)

- Get the user ID (UUID) from Supabase Dashboard → Authentication → Users → select the user → copy the `id`.
- Ensure you have a server-only env var `SUPABASE_SERVICE_ROLE_KEY` (never `NEXT_PUBLIC_`).
- Run a one-off script (Node/tsx) using the service role key to set `app_metadata.role`.

Example script shape (exact file will be added during execution as `scripts/set-admin.ts`):

```ts
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const userId = process.argv[2]
if (!userId) throw new Error('Usage: tsx scripts/set-admin.ts <userId>')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceRoleKey) throw new Error('Missing Supabase env vars')

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } })

const { data, error } = await supabase.auth.admin.updateUserById(userId, {
  app_metadata: { role: 'admin' },
})

if (error) throw error
console.log('Updated user:', data.user.id, data.user.app_metadata)
```

- After updating, the user should sign out and sign back in (or refresh their session) so their JWT contains the latest `app_metadata` claims.
