# Realtime Render Progress And Wardrobe Toast Plan

## Summary

Add live render progress to the playground by combining Trigger.dev realtime subscriptions with persisted workflow progress on `ProductVideo`, then add a lightweight toast confirmation when a user clicks `Add to Wardrobe`.

This plan keeps the current oRPC + Prisma + Trigger architecture intact:

- `ProductVideo` remains the source of truth for workflow state and final asset URLs.
- Trigger.dev realtime is used for immediate in-session progress updates.
- Polling via `getProductVideo` stays as the fallback/resume path.
- Wardrobe feedback stays client-side because cart state is client-only today.

## Current State Analysis

### Playground render flow

- `src/app/playground/page.tsx`
  - Starts the workflow with `orpc.generateProductVideo`.
  - Stores only `productsHash` locally.
  - Polls `orpc.getProductVideo` every 3 seconds until `videoUrl` exists.
  - Has no realtime subscription, no run identifier, and no progress model.

- `src/components/playground/VideoRecorder.tsx`
  - Renders coarse status labels only: `Starting`, `Rendering`, `Ready`, `Error`, etc.
  - Has no progress bar, percent, stage copy, elapsed state, or retry guidance.

- `src/routers/productVideo.ts`
  - Already returns `workflowStatus` and `errorMessage`.
  - Does not expose Trigger run metadata or any progress fields.

- `src/trigger/generate-product-video.ts`
  - Already has real workflow milestones:
    - load existing record
    - download avatar
    - compose outfit image
    - upload image references
    - request PixVerse render
    - poll PixVerse result
    - upload final video to storage
  - Does not currently emit realtime metadata or persist stage/percent updates back to Prisma.

### Wardrobe add flow

- `src/lib/cart/CartProvider.tsx`
  - Cart state is local React state only.
  - `add(productId, qty)` is synchronous and returns no status signal.

- `src/components/product/ProductCard.tsx`
  - Clicking `Add to Wardrobe` updates cart state silently.
  - No toast, temporary confirmation, disabled state, or next-step affordance.

- `src/app/layout.tsx`
  - No global toaster/notification mount exists today.

- `package.json`
  - Includes `@trigger.dev/sdk`.
  - Does not include `@trigger.dev/react-hooks`.
  - No existing toast library is present in the app.

## Assumptions & Decisions

- Use Trigger.dev realtime because the user explicitly chose it.
- Do not rely on realtime alone; persist progress fields in Prisma so the UI can recover after refresh and polling can remain the fallback.
- Keep the current `getProductVideo` query and its polling path instead of replacing it completely.
- Add a new read-only realtime session endpoint rather than embedding public Trigger tokens into the regular `getProductVideo` response.
- Use a toast-only wardrobe confirmation because the user explicitly chose it.
- Keep the cart client-only for this task; no server persistence, auth coupling, or wardrobe schema changes are in scope.
- Use the Trigger SDK entrypoints compatible with the installed package export surface. The local package exposes v3 APIs through `@trigger.dev/sdk` and `@trigger.dev/sdk/v3`, so implementation should stay consistent with that surface.

## Proposed Changes

### 1. Persist render progress and run identity

#### `prisma/schema.prisma`

Add fields to `ProductVideo`:

- `triggerRunId String?`
- `progressPercent Int @default(0)`
- `progressLabel String?`

Why:

- `triggerRunId` is required to reconnect a realtime subscription after page refresh or if the initial mutation response is lost.
- `progressPercent` and `progressLabel` give the UI a durable progress source when realtime is unavailable or reconnecting.

Implementation notes:

- Keep `workflowStatus` as the coarse source of truth for `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`.
- Use `progressPercent = 100` and a final label when the video is ready.
- On failure, preserve the last meaningful stage label and set `errorMessage`.

### 2. Extend shared types for progress-aware UI

#### `src/lib/types.ts`

Extend `StorefrontProductVideo` with:

- `triggerRunId: string | null`
- `progressPercent: number`
- `progressLabel: string | null`

Why:

- The playground UI and any internal testing components should consume a single typed payload for both polling and realtime fallback.

### 3. Expand the product video router for realtime sessions

#### `src/routers/productVideo.ts`

Update the existing schemas, selects, and serializers so `generateProductVideo`, `getProductVideo`, and `listProductVideos` include the new progress fields where relevant.

Specific work:

- Extend `productVideoSchema`.
- Extend `SelectedProductVideo` and `toProductVideo`.
- Include `triggerRunId`, `progressPercent`, and `progressLabel` in all `select` blocks used by:
  - existing record lookup
  - creation result
  - race recovery lookup
  - `getProductVideo`
  - `listProductVideos`

Add a new authed oRPC query, for example `getProductVideoRealtimeSession`, that accepts `productsHash` and returns:

- `runId: string`
- `accessToken: string`
- `expiresAt: string`

Behavior:

- Return data only when a matching `ProductVideo` exists and `triggerRunId` is present.
- Mint a short-lived read-only token scoped to that single run via Trigger auth.
- Return `null` or a typed `NOT_FOUND`/`BAD_REQUEST` path when the video is already terminal and realtime is unnecessary.

Why:

- The frontend needs a secure way to subscribe to the active Trigger run without exposing broad Trigger credentials.

### 4. Capture run ID and seed progress when starting the workflow

#### `src/routers/productVideo.ts`

Change the `generateProductVideo` mutation flow:

- When creating a new `ProductVideo`, initialize:
  - `workflowStatus: "PENDING"`
  - `progressPercent: 5`
  - `progressLabel: "Queued render"`
- After `tasks.trigger(...)`, persist the returned run handle ID into `triggerRunId`.
- Return the updated record payload to the client.

Behavior for existing pending records:

- If a `ProductVideo` already exists, return its stored progress fields and `triggerRunId` instead of creating a duplicate job.
- Do not trigger a second run for the same `productsHash`.

Why:

- This keeps idempotency intact while making realtime subscription and progress rendering possible immediately after mutation success.

### 5. Emit realtime metadata and persist stage updates from the Trigger task

#### `src/trigger/generate-product-video.ts`

Add a small internal helper inside the task to update Prisma and Trigger metadata together at each stage, using a fixed milestone map.

Milestone contract:

- `5` — `Queued render`
- `15` — `Preparing model assets`
- `30` — `Composing outfit reference`
- `45` — `Uploading references`
- `60` — `Starting video render`
- `75` — `Waiting for PixVerse result`
- `90` — `Uploading final video`
- `100` — `Render complete`

Failure contract:

- On thrown errors, update:
  - `workflowStatus: "FAILED"`
  - `errorMessage`
  - `progressLabel` to the last active stage or `Render failed`

Success contract:

- When final upload succeeds, update:
  - `workflowStatus: "COMPLETED"`
  - `progressPercent: 100`
  - `progressLabel: "Render complete"`
  - `videoKey`
  - `videoId`

Realtime contract:

- Update Trigger run metadata at the same milestones so `useRealtimeRun` can render progress before the next poll cycle.
- Metadata should contain stable keys the client can read directly, e.g.:
  - `progressPercent`
  - `progressLabel`
  - `workflowStatus`

Why:

- The task already knows the real backend milestones, so it is the correct place to publish accurate progress.

### 6. Add Trigger realtime hooks dependency

#### `package.json`

Add `@trigger.dev/react-hooks`.

Why:

- The playground needs `useRealtimeRun` for client subscriptions.

### 7. Build a hybrid realtime + polling playground state model

#### `src/app/playground/page.tsx`

Refactor page state so it consumes both:

- polled `getProductVideo` data as the durable source of truth
- realtime run updates when a `triggerRunId` is available

Specific behavior:

- Keep `productsHash` state as the query key anchor.
- After `generateProductVideo` succeeds, request the realtime session for the active `productsHash`.
- Start a `useRealtimeRun` subscription when `runId` and `accessToken` exist.
- Derive display progress from:
  1. realtime metadata when connected
  2. persisted `progressPercent` / `progressLabel` from `getProductVideo`
  3. coarse fallback derived from `workflowStatus`
- Keep `getProductVideo` polling enabled until the video reaches a terminal state.
- Stop realtime and polling when:
  - `videoUrl` exists, or
  - `workflowStatus === "FAILED"`
- Reset local run/session state whenever outfit selection changes or the workflow is cleared.

Why:

- Realtime gives immediate progress.
- Polling preserves resilience on refresh, token expiry, or transient websocket failure.

### 8. Upgrade the `VideoRecorder` UI from status badge to progress panel

#### `src/components/playground/VideoRecorder.tsx`

Expand props so the component can render:

- `workflowStatus`
- `progressPercent`
- `progressLabel`
- optional realtime connection state
- existing `error`

UI changes:

- Add a horizontal progress bar under the workflow header.
- Show numeric percent and current stage label.
- Replace the plain "Render in progress" placeholder with stage-aware copy.
- Preserve current final video preview behavior.
- Preserve current error block, but add clearer failure copy telling the user they can retry with the same outfit selection.

Status mapping:

- No selection: neutral empty state
- Pending/processing with progress: show bar + stage label
- Completed with `videoUrl`: show `Ready`
- Failed: show error state with last known stage

Why:

- This is the main visible UX improvement requested by the user.

### 9. Add a global toast system for wardrobe feedback

#### `src/app/layout.tsx`
#### `src/components/...` new toast files
#### `src/lib/cart/...` as needed

Add a lightweight global toast solution mounted once in the app shell.

Decision:

- Use a toast implementation compatible with the current app stack and Shadcn patterns.
- Mount the toaster in `src/app/layout.tsx` so product cards can trigger feedback from anywhere.

Recommended implementation shape:

- Add a small global toast provider and toaster component.
- Keep the API minimal:
  - `pushToast({ title, description, actionLabel?, href? })`

Why:

- There is no existing toast system in the repo, and the user chose toast-only confirmation.

### 10. Trigger wardrobe success toasts from product cards

#### `src/components/product/ProductCard.tsx`

On `Add to Wardrobe`:

- Continue calling `add(product.id, 1)`.
- Immediately trigger a success toast.

Toast content:

- Title: `Added to wardrobe`
- Description: product name plus the updated quantity summary if available
- Action:
  - primary link to `/cart`
  - optional secondary wording toward `/playground` is out of scope for this request because the user selected toast-only feedback

Button behavior:

- Keep the existing hover-reveal button interaction.
- Do not add permanent in-card controls.
- Optionally add a very short disabled window only if needed to prevent accidental double-click spam during the same frame; otherwise keep the click path immediate.

### 11. Expose enough cart info for good toast copy

#### `src/lib/cart/CartProvider.tsx`

Keep the cart model local, but slightly enrich the API so UI callers can create better feedback.

Recommended API change:

- Make `add()` return the resulting quantity for that product, or expose a helper that can synchronously compute it after the state update request.

Why:

- The toast should be able to say whether the piece was added for the first time or incremented.

Constraint:

- Do not redesign the whole cart provider; keep this limited to what the toast needs.

### 12. Keep internal test surfaces aligned

#### `src/components/video-test.tsx`

If this internal workflow test surface is still used, update it to compile against the expanded `StorefrontProductVideo` shape and avoid drift with the production playground flow.

Why:

- This file already exercises the same mutation/query pair and will otherwise become an easy place for type regressions.

## Verification Steps

### Functional

- Start a render from `/playground` with 1 to 3 products and confirm:
  - the status panel moves from queued to active stages without waiting for the next poll tick
  - the bar advances through milestone percentages
  - the final video preview appears and autoplay behavior remains unchanged

- Refresh `/playground` during an active render and confirm:
  - persisted progress still renders immediately from `getProductVideo`
  - realtime reconnects when `triggerRunId` and a fresh token are available

- Force a task failure and confirm:
  - `workflowStatus` becomes `FAILED`
  - the error block renders meaningful copy
  - polling stops

- Click `Add to Wardrobe` from a product card and confirm:
  - cart count in the nav updates
  - a toast appears
  - the toast links to `/cart`

### Type / integration

- Regenerate Prisma client after schema changes.
- Run TypeScript/build checks after router and shared type changes.
- Verify the new realtime session query is protected by auth and returns a narrowly scoped token.

### Regression checks

- Confirm `/ideas` still renders completed videos correctly after the `StorefrontProductVideo` shape expands.
- Confirm existing product video reuse by `productsHash` still prevents duplicate runs.
- Confirm signed video/image URL generation paths remain unchanged outside the added progress metadata.
