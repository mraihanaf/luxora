# Prompt-Only Omni Top Garment Fix Plan

## Summary

Tune the product-video generation prompt so the selected top garment is described more explicitly and consistently, reducing cases where the output keeps the avatar's cardigan instead of reflecting the chosen top.

This plan stays strictly within prompt engineering:

- Keep the current PixVerse fusion flow in `src/trigger/generate-product-video.ts`
- Keep the current outfit reference image composition logic
- Do not change layout weighting, image ordering emphasis, or non-prompt generation parameters unless already exposed by the existing prompt builder path

## Current State Analysis

### Current prompt construction

- `src/trigger/generate-product-video.ts`
  - Uses a single generic string:
    - `const prompt = \`@model wearing @outfit ${lookbookPrompt}\``
  - The prompt does not mention:
    - which top was selected
    - garment names
    - garment descriptions
    - slot-specific constraints
    - explicit instruction to replace the avatar's existing cardigan/top layer

- `lookbookPrompt` is currently scene-focused only:
  - studio background
  - camera motions
  - lighting
  - no garment-preservation guidance

### Current reference flow

- `buildOutfitReferenceImage()` in `src/trigger/generate-product-video.ts`
  - combines all selected product images into one stacked PNG
  - treats all pieces uniformly

- `pixverse.generateFusionVideo()` in `src/lib/pixverse.ts`
  - accepts:
    - `imageReferences`
    - `prompt`
    - `model`
    - `duration`
    - `quality`
    - `aspectRatio`
    - `seed`
  - does not currently expose a separate negative-prompt field in the local wrapper

### Why the top may be sticking as a cardigan

- The avatar reference is stable and visually strong.
- The prompt only says `@model wearing @outfit`, which is too weak to force a visible upper-body garment swap.
- The top slot is not explicitly singled out in the instruction, so the model can preserve the avatar's original upper-body silhouette or layering.

## Assumptions & Decisions

- The user chose `Prompt only`, so the plan does not modify reference-image layout or weighting.
- The most likely high-value fix is to make the prompt slot-aware and explicitly instruct replacement of the avatar's upper-body garment.
- Because the local PixVerse wrapper does not expose a dedicated negative prompt, the implementation should stay within the existing `prompt` field.
- The fix should be generated from selected product data already available in `productVideo.products`:
  - `type`
  - `name`
  - `description`
- The prompt builder should remain deterministic for the same selected products to preserve reproducibility as much as possible.

## Proposed Changes

### 1. Replace the generic prompt with a structured prompt builder

#### `src/trigger/generate-product-video.ts`

Add a helper that builds a richer garment-aware prompt from the selected products instead of hardcoding:

- `@model wearing @outfit ${lookbookPrompt}`

New prompt builder responsibilities:

- Separate scene direction from garment direction
- Detect selected slots:
  - `TOP`
  - `BOTTOM`
  - `HEADWEAR`
- Build explicit garment lines using product `name` and `description`
- Emphasize that the generated look must match the selected top exactly enough in silhouette/category

Implementation shape:

- Add helper(s) such as:
  - `describeGarment(product)`
  - `buildGarmentInstructions(products)`
  - `buildFusionPrompt(products)`

Why:

- This keeps prompt logic composable and easier to iterate later if more garment-specific issues appear.

### 2. Add explicit top-replacement instructions

#### `src/trigger/generate-product-video.ts`

When a `TOP` product is present, the prompt should explicitly state all of the following ideas in clean natural language:

- the model must wear the selected top from the reference outfit
- the upper-body garment must be replaced to match the chosen top
- do not preserve the avatar's original cardigan, jacket, or default upper-body garment if it conflicts with the selected top
- preserve the selected top's visible silhouette, neckline, sleeve profile, layering intent, and overall garment category

Prompt content should be slot-aware:

- If `TOP` exists, it gets the strongest wording
- If `BOTTOM` exists, describe it clearly but with less emphasis than the top
- If `HEADWEAR` exists, include it as an accessory/head styling instruction

Why:

- The user-reported failure is specifically the top not changing, so the prompt must prioritize the upper-body swap.

### 3. Use product metadata, not only slot labels

#### `src/trigger/generate-product-video.ts`

Derive prompt copy from each selected product's:

- `name`
- `description` when present
- `type`

Recommended prompt style:

- concise garment identity
- one short descriptive phrase from `description` if useful
- avoid long marketing prose

Example planning direction:

- top:
  - "Use the selected top as the exact upper-body garment reference"
  - include name/category cues from the selected product
- bottom:
  - "Match the selected bottom silhouette and styling"
- headwear:
  - "Include the selected headwear if present"

Why:

- Product-specific wording gives the model more semantic anchors than `@outfit` alone.

### 4. Split scene prompt from garment constraints

#### `src/trigger/generate-product-video.ts`

Refactor the current `lookbookPrompt` into clearer sections:

- scene / cinematography
- garment preservation / replacement rules
- styling realism rules

Recommended structure:

- lead with garment constraints first
- follow with scene direction second
- keep the overall prompt compact enough to avoid diluting the clothing instructions

Why:

- Right now the scene language is stronger than the garment language.
- Putting garment instructions first increases the chance the model prioritizes the outfit swap.

### 5. Keep the current reference composition unchanged

#### `src/trigger/generate-product-video.ts`

Do not modify:

- `buildOutfitReferenceImage()`
- product stacking order
- image sizing balance
- avatar upload/reference logic

Why:

- The user explicitly chose prompt-only tuning for this iteration.

### 6. Add lightweight logging for prompt inspection

#### `src/trigger/generate-product-video.ts`

Add a small debug log before `pixverse.generateFusionVideo()` to print the final constructed prompt in a controlled way.

Keep it limited to:

- selected product names/types
- final prompt string

Do not log sensitive secrets or signed URLs.

Why:

- Prompt tuning is hard to verify without seeing the exact prompt sent to PixVerse.
- This makes future iterations easier if the top still fails sometimes.

### 7. Keep the PixVerse wrapper unchanged for this task

#### `src/lib/pixverse.ts`

No functional changes planned here unless implementation reveals a prompt-field formatting need only.

Why:

- The local wrapper already forwards the existing `prompt` field.
- No evidence from the repo shows a supported negative-prompt parameter in the current integration.

## Verification Steps

### Functional

- Generate videos in `/playground` using at least:
  - one top-only selection
  - one top + bottom selection
  - one top + bottom + headwear selection

- Confirm the resulting video no longer keeps the avatar's cardigan when a different top is selected.

- Specifically compare cases where the selected top is visually distinct from a cardigan:
  - different sleeve shape
  - different neckline
  - different layering intent

### Prompt inspection

- Check server/task logs to confirm the generated prompt now includes:
  - explicit top replacement language
  - selected product names/descriptions
  - wording that tells the model not to preserve a conflicting original upper-body garment

### Regression checks

- Confirm generation still succeeds with:
  - only one selected product
  - missing product descriptions
  - no headwear selected

- Confirm the existing progress tracking and final video flow remain unchanged.

### Acceptance criteria

- The selected top is reflected more reliably in generated output.
- The common "still cardigan" failure is materially reduced.
- The implementation changes only prompt construction and related prompt logging, not reference-image layout or router/schema behavior.
