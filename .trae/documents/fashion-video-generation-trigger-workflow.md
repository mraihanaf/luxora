# Plan: Trigger.dev Fashion Video Generation (PixVerse + S3 + Prisma)

## Summary

Create an async Trigger.dev workflow that:

1. Accepts user-selected Product IDs (TOP/BOTTOM/HEADWEAR; minimum 1).
2. Computes a deterministic `productsHash` and reuses an existing `ProductVideo` if present.
3. If missing, generates a lookbook-style video via PixVerse Fusion (reference-to-video) using a predefined local avatar plus selected product images as references.
4. Uploads the final video to an S3 bucket and stores the public URL in the DB.

## Current State Analysis (Repo Facts)

- Prisma schema only contains `Product` in [schema.prisma](file:///home/rai/Documents/programming-stuff/hackathon/luxora/prisma/schema.prisma).
- Trigger.dev is configured to load tasks from `./src/trigger` in [trigger.config.ts](file:///home/rai/Documents/programming-stuff/hackathon/luxora/trigger.config.ts), but `src/trigger/` currently contains only `.gitkeep`.
- API layer uses oRPC routers in `src/routers/` (flat exported procedures) with Prisma access via `@/lib/prisma` (e.g. [product.ts](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/routers/product.ts)).
- No existing S3/AWS SDK integration in the codebase (no S3 client usage found).

## Proposed Changes

### 1) Database: Add `ProductVideo` + relations

**Files**
- Update: [schema.prisma](file:///home/rai/Documents/programming-stuff/hackathon/luxora/prisma/schema.prisma)
- Add: `prisma/migrations/*` (generated migration)

**Schema**
- Add model `ProductVideo` with:
  - `id` (cuid)
  - `productsHash` (unique)
  - `videoUrl` (nullable until uploaded)
  - `videoId` (nullable; PixVerse `video_id` as string)
  - `products` relation to `Product[]` (many-to-many)
  - `createdAt`, `updatedAt`
- Update `Product` to include backrelation `productVideos ProductVideo[]`.

**Why**
- Needed to dedupe generations by `productsHash` and persist the uploaded S3 video URL.

**Decision**
- Use `videoUrl === null` as “not finished yet” to keep schema minimal per requirement. (Optional follow-up: add `status` and `errorMessage` if you want explicit failure states.)

### 2) PixVerse client helpers (upload + fusion video gen + polling)

**Files**
- Add: `src/lib/pixverse.ts`

**Responsibilities**
- `uploadImage({ filename, bytes, contentType }) -> { imgId }` via `POST /openapi/v2/image/upload` (multipart form-data).
- `generateFusionVideo({ imageReferences, prompt, duration, aspectRatio, quality, model }) -> { videoId }` via `POST /openapi/v2/video/fusion/generate`.
- `pollVideoResult({ videoId }) -> { url }` via `GET /openapi/v2/video/result/{videoId}` polling until `status=1`.

**Why**
- Keeps Trigger tasks small/clean and centralizes API auth (`API-KEY`, unique `Ai-trace-id`) and polling behavior.

**Prompt**
- Use the exact prompt you provided, with additional reference tags inserted:
  - Always include `@model` (avatar reference)
  - Optionally include `@top`, `@bottom`, `@headwear` if those product types were selected

**Video settings**
- `duration=10`, `aspect_ratio="9:16"`, `quality="1080p"`, `model="v6"` (v6 supports 1–15 seconds per PixVerse docs).

**Assumptions**
- PixVerse Fusion will be used instead of a separate image-generation step (no `template_id` required).

### 3) S3 upload helper

**Files**
- Add: `src/lib/s3.ts`

**Responsibilities**
- Download the PixVerse video URL to a `Buffer` (or stream) on the server side.
- Upload to S3 with `Content-Type: video/mp4`.
- Return a public object URL to store in `ProductVideo.videoUrl`.

**Dependencies**
- Add runtime deps: `@aws-sdk/client-s3` (and optionally `@aws-sdk/lib-storage` if multipart uploads are needed).

**Why**
- Current codebase has no storage layer for generated assets; S3 is required by your spec.

### 4) Trigger.dev task: end-to-end generation + idempotency

**Files**
- Add: `src/trigger/generate-product-video.ts`

**Task contract**
- `id: "generate-product-video"`
- Payload (validated with zod):
  - `productVideoId: string`

**Task steps**
1. Load `ProductVideo` and related `Product` rows from Prisma.
2. If `videoUrl` already exists: return early (dedupe).
3. Load the predefined avatar image from a local asset path (see “Environment & Config”).
4. Upload avatar image to PixVerse (`/image/upload`) as a `subject` reference named `model`.
5. For each selected product, upload its `imageUrl` to PixVerse (`/image/upload` supports `image_url`) and add it as a `subject` reference named by type: `top`, `bottom`, `headwear`.
6. Call PixVerse Fusion generation (`/video/fusion/generate`) with:
   - `image_references`: `@model` + selected product refs
   - `prompt`: your lookbook prompt plus an extra first sentence instructing “the model is wearing @top/@bottom/@headwear”
7. Poll video result until PixVerse returns a final `url`.
8. Upload the resulting video to S3; compute `videoUrl`.
9. Update `ProductVideo` with `{ videoUrl, videoId }`.

**Idempotency**
- Trigger the task with an idempotency key derived from `productsHash` (so repeated requests don’t enqueue multiple generations).
- DB level: `productsHash` is unique; creation uses `upsert`/transaction to avoid races.

**Rate limiting / concurrency**
- Use a Trigger queue with low concurrency (e.g. 1–3) to respect PixVerse concurrency limits.
- Use `wait.for({ seconds: 3 })` between poll attempts (checkpointed waits).

### 5) oRPC API: create/find `ProductVideo` and trigger workflow

**Files**
- Add: `src/routers/productVideo.ts`
- Update: [routers/index.ts](file:///home/rai/Documents/programming-stuff/hackathon/luxora/src/routers/index.ts)

**Procedures**
- `generateProductVideo`
  - Middleware: `authedMiddleware`
  - Input: `{ productIds: string[] }` (min 1, max 3; de-dupe)
  - Behavior:
    1. Canonicalize IDs (unique + sort).
    2. Compute `productsHash = sha256(ids.join(":"))`.
    3. `findUnique({ where: { productsHash } })`; if found return it.
    4. Else create `ProductVideo` + connect selected products in a single transaction.
    5. Trigger `generate-product-video` with payload `{ productVideoId }` and idempotency key based on `productsHash`.
    6. Return the `ProductVideo` (with `videoUrl` null initially).
- `getProductVideo`
  - Middleware: `authedMiddleware`
  - Input: `{ productsHash: string }` or `{ id: string }` (pick one; recommended: `productsHash`)
  - Output: `ProductVideo` with `videoUrl` and selected `products`.

**Why**
- Provides a stable “async job” API for the frontend (create-or-get, then poll).

## Environment & Config

### Required environment variables

- PixVerse
  - `PIXVERSE_API_KEY`
- Avatar asset
  - `PRODUCT_VIDEO_AVATAR_PATH` (absolute or repo-relative path to the default avatar image file)
- S3
  - `AWS_REGION`
  - `AWS_S3_BUCKET`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - Optional: `AWS_S3_PUBLIC_BASE_URL` (if using a custom domain/CloudFront; otherwise derive from bucket+region)

### Local avatar asset placement

You selected “single default avatar” as a local asset. The plan assumes you will add the file (or already have it) at the path configured by `PRODUCT_VIDEO_AVATAR_PATH`.

## Verification Steps

1. Prisma
  - Generate migration and apply to local DB.
  - Run Prisma client generation.
2. Typecheck/build
  - Run Next.js build to ensure TS types are valid.
3. Trigger.dev
  - Start Trigger.dev dev runner and trigger `generateProductVideo` with a known set of product IDs.
  - Confirm:
    - Second request with same products returns the same `ProductVideo` (no duplicate rows).
    - PixVerse calls succeed with unique `Ai-trace-id` per request.
    - S3 upload succeeds and `videoUrl` is publicly accessible.
4. API
  - Call `generateProductVideo` then poll `getProductVideo` until `videoUrl` is present.

## Open Items (Need Your Values Before Implementation)

- The default avatar file path (or the file itself placed in the repo) referenced by `PRODUCT_VIDEO_AVATAR_PATH`.
- S3 bucket/region and whether you want a custom public base URL (CloudFront) for `videoUrl`.
