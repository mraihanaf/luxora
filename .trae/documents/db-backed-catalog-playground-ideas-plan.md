# Summary

Integrate Prisma/oRPC-backed product data into the public collection flow, replace the mock playground recorder with the real Trigger.dev `generate-product-video` workflow, gate video generation behind auth, and turn `/ideas` into a gallery of completed `ProductVideo` records.

# Current State Analysis

- `prisma/schema.prisma` defines real `Product` and `ProductVideo` models. `Product` only supports `TOP | BOTTOM | HEADWEAR`, with `priceIdr`, `imageKey`, and optional `videoKey`.
- `src/routers/product.ts` already exposes `listProducts` and `getProduct`, but the list payload is minimal and optimized for admin/test usage rather than public storefront pages.
- `src/routers/productVideo.ts` already supports `generateProductVideo` and `getProductVideo`, and correctly triggers `src/trigger/generate-product-video.ts` through Trigger.dev.
- `src/components/video-test.tsx` already demonstrates the desired workflow shape for the playground: choose products, call `generateProductVideo`, then poll `getProductVideo` by `productsHash`.
- Public storefront pages still rely on hardcoded mock data in `src/lib/products.ts` and `src/lib/types.ts`. This affects:
  - `src/app/catalog/page.tsx`
  - `src/app/cart/page.tsx`
  - `src/components/cart/CartLineItem.tsx`
  - `src/components/playground/OutfitBuilder.tsx`
  - `src/components/playground/OutfitStage.tsx`
  - `src/components/playground/VideoRecorder.tsx`
- The current storefront model is mismatched with the database:
  - UI uses categories like `outerwear`, `shoes`, and `accessory`
  - DB only supports `TOP`, `BOTTOM`, and `HEADWEAR`
  - UI prices are mock USD numbers, while DB uses `priceIdr`
  - catalog tags/search/filtering are based on fields that do not exist in Prisma
- `/ideas` is currently a static image gallery in `src/app/ideas/page.tsx`; it does not read from Prisma/oRPC.
- Auth already exists via Supabase (`src/lib/supabase/*`, `src/app/auth/*`, `src/app/rpc/[...path]/route.ts`), and `generateProductVideo` is already protected by `authedMiddleware`. What is missing is public-UI handling for unauthenticated users.

# Proposed Changes

## 1. Add storefront-focused oRPC outputs for products and product videos

### `src/routers/product.ts`

- Expand the public product list/detail outputs so storefront pages receive all fields they need from oRPC:
  - `id`
  - `type`
  - `name`
  - `description`
  - `imageUrl`
  - `videoUrl`
  - `priceIdr`
- Keep signed URL generation in the router, following the existing pattern.
- Preserve admin mutations as-is; only enrich shared read payloads for public consumers.

### `src/routers/productVideo.ts`

- Add a new read endpoint for ideas/gallery usage, e.g. `listProductVideos`.
- Return a gallery-friendly payload:
  - `id`
  - `productsHash`
  - `videoKey`
  - `videoUrl`
  - `videoId`
  - `createdAt`
  - `updatedAt`
  - `products` with signed `imageUrl`, `type`, `name`, and `priceIdr`
- Make the endpoint support the `ideas` requirement directly by filtering to completed records (`videoKey IS NOT NULL`) at the router level rather than fetching all records and filtering in the client.
- Keep the endpoint public unless implementation reveals a clear privacy constraint; the current user requirement only gates generation, not viewing.

### `src/routers/index.ts`

- Export the new `listProductVideos` procedure from the main router so it is available to the client.

## 2. Introduce a DB-backed storefront product shape for public UI

### `src/lib/types.ts`

- Replace or extend the current mock-only product typing with a DB-backed storefront type, for example:
  - `ProductType = "TOP" | "BOTTOM" | "HEADWEAR"`
  - `StorefrontProduct`
  - `StorefrontProductVideo`
- Update `OutfitSlotId` to align with the real DB model:
  - `top`
  - `bottom`
  - `headwear`
- Remove dependency on mock-only categories/tags for the pages being migrated in this task.

### `src/lib/outfit/outfitSlots.ts`

- Refactor the slot definitions from five mock slots to the three real DB-backed slots.
- Map UI labels directly from Prisma product types:
  - `TOP` -> `Top`
  - `BOTTOM` -> `Bottom`
  - `HEADWEAR` -> `Headwear`

### `src/lib/products.ts`

- Stop using this mock dataset in the pages/components touched by this task.
- Leave the file in place unless it becomes fully unused after the refactor; executor can decide whether to delete it only after confirming no remaining references beyond this scope.

## 3. Make `/catalog` use oRPC/Prisma instead of mock data

### `src/app/catalog/page.tsx`

- Convert the page to fetch products from `orpc.listProducts`.
- Replace tag-based filtering with filters derived from actual DB fields:
  - type filter (`All`, `Top`, `Bottom`, `Headwear`)
  - text search by product name
  - sort by newest / price ascending / price descending
- Update copy/counts so they reflect the real dataset.
- Show loading, empty, and error states consistent with existing UI style.

### `src/components/product/ProductCard.tsx`

- Update the component to accept the new DB-backed product shape:
  - use `imageUrl`
  - display `priceIdr` in a readable format
- Keep the add-to-cart behavior by still storing `product.id` in the cart context.

## 4. Make cart rendering DB-backed so selected collection items remain visible everywhere

### `src/app/cart/page.tsx`

- Replace `productById` usage with an oRPC-backed product list query and resolve cart lines against that query result.
- Calculate subtotals from real `priceIdr` values.
- Continue to tolerate stale cart IDs by ignoring lines whose products no longer exist, while keeping the page functional.

### `src/components/cart/CartLineItem.tsx`

- Stop depending on `productById`.
- Accept a resolved product object as a prop, or receive a lookup map from the parent; prefer prop-based rendering to keep the component simple and avoid duplicate queries.
- Display the real product type label instead of legacy mock categories.

## 5. Replace the mock playground export with the real Trigger workflow

### `src/app/playground/page.tsx`

- Keep the page public, but wire it to real DB-backed product data instead of the mock product map.
- Use cart item IDs as the starting wardrobe source, but resolve those IDs from `listProducts`.
- Track the selected outfit in the new three-slot shape (`top`, `bottom`, `headwear`).

### `src/components/playground/OutfitBuilder.tsx`

- Refactor the builder to accept actual product records, not IDs-only + `productById`.
- Group/select products by real `ProductType`.
- Change the primary CTA from the current mock `Generate Preview` state into the real generation trigger entry point.
- If the user is not authenticated:
  - do not call the mutation
  - show clear sign-in/sign-up actions linking to existing auth pages
- If the user is authenticated:
  - call `orpc.generateProductVideo`
  - save the returned `productsHash`
  - let the page start polling `orpc.getProductVideo`

### `src/components/playground/OutfitStage.tsx`

- Update the preview prompt generation to use the DB-backed selected products.
- Remove dependency on legacy mock product/category types.
- Keep it as a visual stage/preview only; it should no longer imply that the exported video comes from the canvas recorder.

### `src/components/playground/VideoRecorder.tsx`

- Repurpose or replace this component so it becomes the real workflow status/result panel instead of a local `MediaRecorder`.
- Use the interaction model already validated in `src/components/video-test.tsx`:
  - idle state
  - mutation pending state
  - polling state
  - ready state with playable video
  - error state
- Show the generated video when `videoUrl` becomes available.
- Remove the local WebM recording/download behavior from the public workflow path.

### `src/components/video-test.tsx`

- Use this as the implementation reference only.
- Do not route users through `/protected/video-test`; keep the real public experience in `/playground`.
- If practical during execution, extract small shared helpers from this component rather than duplicating hash polling logic.

## 6. Gate generation behind existing auth flows

### `src/app/playground/page.tsx` and/or relevant client components

- Use the existing authenticated surface to detect whether the user is signed in.
- Preferred approach:
  - query `orpc.getMe`
  - treat auth errors as “guest”
  - only enable the generate mutation for authenticated users
- For guests, keep the page usable for outfit building, but show explicit sign-in/sign-up CTAs when they attempt or reach the generate step.
- Reuse the existing routes:
  - `/auth/login`
  - `/auth/sign-up`

## 7. Turn `/ideas` into a completed `ProductVideo` gallery

### `src/app/ideas/page.tsx`

- Replace the static `IDEAS` array with a real oRPC query to `listProductVideos`.
- Show only completed records, using the server-filtered endpoint described above.
- Render each card with:
  - playable video preview when `videoUrl` exists
  - related product names/types
  - optional created date / hash metadata if useful for scanability
- Keep the page visually gallery-oriented rather than admin-like.
- Provide loading, empty, and error states.

## 8. Clean up all remaining mock-data dependencies within the requested scope

### Files that must stop importing `src/lib/products.ts`

- `src/app/catalog/page.tsx`
- `src/app/cart/page.tsx`
- `src/components/cart/CartLineItem.tsx`
- `src/components/playground/OutfitBuilder.tsx`
- `src/components/playground/OutfitStage.tsx`
- `src/components/playground/VideoRecorder.tsx`

### Additional consistency tasks

- Update price formatting across catalog/cart/playground to use `priceIdr`.
- Update labels/copy that still imply unsupported mock categories.
- Ensure the public pages no longer assume five-slot outfits when only three DB product types exist.

# Assumptions & Decisions

- `collection` in the request maps to the public `/catalog` experience.
- This task covers `catalog + cart + playground`, because those pages currently share the same mock product source and would otherwise diverge.
- The real Trigger.dev flow replaces the mock recorder in `/playground`.
- `/ideas` should only show completed `ProductVideo` records.
- Video generation is auth-gated at the action level, not by protecting the whole page.
- Public browsing of products and completed videos remains allowed.
- No Prisma schema change is required for this task; the current schema already supports the requested workflow.
- No Supabase PostgREST data access should be introduced; all data reads/mutations remain Prisma-backed through oRPC.

# Verification Steps

1. Confirm `catalog` loads products from oRPC and shows correct loading/error/empty states.
2. Confirm filters/sort/search work against DB-backed product fields and no longer depend on mock tags/categories.
3. Add a product from `catalog`, open `cart`, and verify image/name/type/price/totals resolve from oRPC data.
4. Open `/playground` as a guest and verify outfit building works but generation shows sign-in/sign-up CTAs instead of calling the mutation.
5. Sign in, open `/playground`, select products, trigger generation, and verify:
   - `generateProductVideo` starts successfully
   - polling continues via `getProductVideo`
   - the final video renders when `videoUrl` is ready
6. Confirm `/ideas` loads completed `ProductVideo` records and displays real generated videos with related products.
7. Confirm no requested-scope component still depends on `src/lib/products.ts`.
8. Run diagnostics/tests appropriate to touched files and fix any introduced TypeScript or lint errors.
