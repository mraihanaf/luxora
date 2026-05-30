# Summary

Make the public product video workflow reliably work end-to-end from `/playground` through Trigger.dev task execution to `/ideas`, with explicit failure handling, clearer workflow states, and environment/config hardening for the task runtime.

# Current State Analysis

- The public generation path already exists:
  - `/playground` loads wardrobe products and selected outfit state in `src/app/playground/page.tsx`
  - it calls `orpc.generateProductVideo` from `src/routers/productVideo.ts`
  - the router creates or reuses a `ProductVideo` record and triggers `tasks.trigger("generate-product-video", ...)`
  - the UI polls `orpc.getProductVideo` until `videoUrl` appears
- The Trigger task is implemented in `src/trigger/generate-product-video.ts` and performs:
  - product/video lookup from Prisma
  - avatar file read from `PRODUCT_VIDEO_AVATAR_PATH`
  - product image signing via Supabase storage admin client
  - outfit image composition via `sharp`
  - PixVerse generation and polling
  - S3-compatible upload of the final mp4
  - Prisma update with `videoKey` and `videoId`
- Trigger.dev is configured in `trigger.config.ts` with:
  - `runtime: "node"`
  - `dirs: ["./src/trigger"]`
  - retries enabled in dev
- There is still a protected internal harness at `src/app/protected/video-test/page.tsx` with UI in `src/components/video-test.tsx`, but the requested focus is the public flow, not that page.
- The public ideas/gallery page already consumes completed videos through `listProductVideos` in `src/app/ideas/page.tsx`.
- Main reliability gaps discovered from the current implementation:
  - `src/components/playground/VideoRecorder.tsx` only understands `idle/starting/rendering/ready/error` from client query state, but there is no persisted workflow status on the `ProductVideo` model; if the Trigger task fails, the user-facing flow has no durable failure state and can fall back to generic query errors or indefinite “rendering” semantics.
  - `src/routers/productVideo.ts` returns only `videoKey/videoUrl/videoId`; it does not expose a first-class workflow lifecycle or error payload for the public UI.
  - `src/trigger/generate-product-video.ts` depends on `PRODUCT_VIDEO_AVATAR_PATH`, but `.env.example` documents Trigger/PixVerse/storage variables and does not document this required task input.
  - Task/runtime prerequisite validation is spread across runtime throws (`PIXVERSE_API_KEY`, `STORAGE_BUCKET`, `STORAGE_REGION`, `PRODUCT_VIDEO_AVATAR_PATH`) rather than surfaced early or documented as a single workflow checklist.
  - The public playground resets local workflow state on outfit changes, but there is no resume/revisit experience for an already-created `ProductVideo` beyond the current page session.

# Proposed Changes

## 1. Add durable workflow status and error fields for `ProductVideo`

### `prisma/schema.prisma`

- Extend `ProductVideo` with fields needed for reliable public workflow state:
  - workflow status enum such as `PENDING | PROCESSING | COMPLETED | FAILED`
  - optional human-readable error message field
  - optional timestamps if needed for tracking status transitions
- Keep existing `videoKey`, `videoId`, and `productsHash` intact.
- Reason: the public UI needs a persisted source of truth for queued/running/failed/completed states instead of inferring progress from `videoUrl` alone.

### Prisma migration / generated client

- Add a migration for the new `ProductVideo` fields.
- Regenerate Prisma client/types after the schema update.

## 2. Make the Trigger task explicitly manage lifecycle state

### `src/trigger/generate-product-video.ts`

- Update the task to mark the record as processing before external work begins.
- On success:
  - store `videoKey` and `videoId`
  - mark the workflow as completed
  - clear any previous error message
- On failure:
  - mark the workflow as failed
  - persist an actionable error message suitable for UI display
- Preserve the current retry/checkpoint behavior and `wait.for()` polling pattern.
- Keep the task idempotent for already-generated videos:
  - if `videoKey` already exists and status is completed, return early
- Consider wrapping the main generation body in a `try/catch` so task failures update the database before rethrowing.

## 3. Expose workflow status through oRPC

### `src/routers/productVideo.ts`

- Extend `productVideoSchema` and conversion helpers to include the new persisted fields:
  - workflow status
  - error message
  - created/updated timestamps already present
- Keep `generateProductVideo` behavior of creating/reusing by `productsHash`, but make reuse logic status-aware:
  - completed records should return immediately
  - failed records should be visible as failed instead of pretending they are still generating
  - if the chosen approach is to allow retriggering failed records, define that behavior explicitly in the router contract
- Update `getProductVideo` and `listProductVideos` to return the new fields.
- Ensure the public ideas page still filters to completed videos only.

## 4. Harden the public playground workflow UX

### `src/app/playground/page.tsx`

- Keep the existing public/auth-gated page structure, but make the page consume the richer `ProductVideo` state from oRPC.
- Preserve the current selection flow and auth gating.
- Ensure the polling logic stops not only when `videoUrl` exists, but also when the workflow reaches a terminal failed state.
- Consider whether `productsHash` should be retained in URL state or component state only; for this plan, component state is acceptable unless resume-by-refresh is explicitly added.

### `src/components/playground/OutfitBuilder.tsx`

- Keep current slot-based selection, but make the generate CTA and helper text reflect richer workflow states:
  - ready to start
  - starting
  - processing
  - failed
  - completed
- If a failed record is returned, show a clear “try again” or “adjust selection and retry” path, depending on router behavior chosen above.

### `src/components/playground/VideoRecorder.tsx`

- Repurpose this component further from a generic status panel into a true workflow status view backed by persisted data.
- Display:
  - queued/starting state
  - processing state
  - failed state with detailed message
  - completed state with playable video
- Avoid ambiguous “Rendering” forever behavior when the task has actually failed or cannot proceed.
- Keep the panel suitable for public users, but actionable enough that a failure indicates whether the issue is likely auth, config, media generation, or storage related.

## 5. Keep `/ideas` aligned with completed workflow output

### `src/app/ideas/page.tsx`

- Confirm the page continues to consume only completed `ProductVideo` records after the new workflow-status fields land.
- If needed, switch filtering to workflow status rather than `videoKey != null` so the page semantics match the new durable lifecycle model.

## 6. Add workflow prerequisite documentation and startup validation

### `.env.example`

- Add the missing `PRODUCT_VIDEO_AVATAR_PATH` entry with a clear explanation of what file it should point to.
- Keep the existing Trigger/PixVerse/storage variable examples and group all video-workflow prerequisites together.

### Relevant docs / comments

- Update or add a short developer-facing note covering the minimum prerequisites for the workflow to succeed:
  - Trigger secret key
  - PixVerse API key
  - storage bucket/region/credentials/endpoint
  - avatar image path
  - at least one valid product image in storage

### Optional validation surface

- Add a focused server-side guard/helper for workflow prerequisites if implementation remains proportional.
- Goal: fail early with explicit messages instead of surfacing opaque runtime failures from deep inside the task.

## 7. Preserve the internal debug path without making it the primary UX

### `src/components/video-test.tsx` and `src/app/protected/video-test/page.tsx`

- Keep the protected debug/test page available as an internal harness.
- Update it only if necessary to stay compatible with the new workflow-status contract.
- Do not make this the main user-facing solution; the public flow remains the priority.

# Assumptions & Decisions

- “Make sure video workflow working” means the public flow should work end-to-end from `/playground` to completed videos visible in `/ideas`.
- Detailed failure visibility is required; generic loading/polling states are not sufficient.
- Environment/config hardening is in scope, including missing env documentation and prerequisite clarity.
- The plan should prioritize persisted workflow state in Prisma over ephemeral client-only status inference.
- The existing protected `video-test` route is secondary and should remain a compatibility/debug aid, not the primary product experience.

# Verification Steps

1. Apply the Prisma migration and regenerate Prisma client.
2. Start the workflow from `/playground` with an authenticated user and verify the record moves through the expected persisted states.
3. Confirm success path:
   - mutation returns/creates the `ProductVideo`
   - task runs via Trigger.dev
   - `videoKey`/`videoId` are saved
   - UI switches to completed and shows the playable video
4. Confirm failure path by simulating or using a missing prerequisite and verify:
   - task marks the record failed
   - public UI stops polling
   - detailed error text is shown to the user
5. Confirm `/ideas` shows only completed videos after the status-model update.
6. Confirm `.env.example` and any related workflow docs include all required variables, especially `PRODUCT_VIDEO_AVATAR_PATH`.
7. Run diagnostics and targeted lint/tests for all touched Prisma, router, trigger, and public UI files.
