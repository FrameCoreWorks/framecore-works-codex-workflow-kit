# Static Raster And Text-Bearing Image Policy

## Purpose

This policy protects quality for posters, banners, social graphics, infographic frames, storyboard boards, thumbnails, ecommerce graphics, and other static raster graphics. The workflow must treat a requested generated graphic as an image generation task by default, not as a Python, SVG, HTML/canvas, Sharp, or compositing task unless the user explicitly asks for a coded or vector artifact.

For graphics with visible text, the workflow must also produce the final graphic in a way that treats the text as part of the image generation task, not as a late overlay.

## Built-In Generation Path

Static raster graphics should use the built-in Codex/ChatGPT image generation capability powered by GPT Image 2 by default when that capability is available. In short: static raster graphics should use native image generation first, not coded substitutes.

Static raster graphics with visible text must use the same built-in generation path in one pass, with all visible text included directly in the generated image.

This is a native chat-window generation path. It is not an external provider integration, API key requirement, CLI, or paid media-provider workflow.

## One-Pass Rule

The one-pass rule means the final prompt must include the full graphic and the exact final copy before generation starts. Codex must not generate a text-free background first, then add typography later through overlays, compositing, utility scripts, design tools, or manual editing.

Forbidden:

- replacing a requested static raster generation with Python-generated artwork
- replacing a requested static raster generation with SVG, HTML/canvas, Sharp/composited PNG, or coded artwork by default
- generating a text-free background first
- adding typography later through overlays
- compositing text after generation
- using coded artwork as a substitute for the final generated raster unless the user explicitly asks for a coded or vector artifact

## Prompt Requirements

Prompts must include:

- exact final copy
- hierarchy
- placement
- typography direction
- safe margins
- no extra words
- no duplicate text
- output format and aspect ratio
- audience or campaign context when relevant

If the copy is too long for a clean generated raster, shorten or rewrite the copy before generation instead of planning a later overlay.

## Allowed Exceptions

Coded or vector artifacts are allowed only when the user explicitly asks for a coded or vector artifact, template, SVG, HTML/canvas composition, or editable layout source. In that case, Codex should clearly treat the deliverable as coded artwork, not as a substitute for a generated static raster.

HyperFrames and other coded-video paths can include captions and overlays because they produce video compositions, not static raster graphics. The static text-bearing image rule still applies to final posters, thumbnails, boards, and standalone graphics.

## Failure Handling

If the current Codex environment does not expose built-in image generation, stop and ask the user how to proceed. Do not silently replace this path with Python-generated artwork, coded SVG, HTML/canvas, Sharp/composited PNG, or text overlays.

If generation returns unreadable, duplicated, cropped, or incorrect text, treat it as a QA failure and iterate with a cleaner prompt, shorter copy, stronger safe margins, or simpler layout.

## Validation

The release gate checks that the policy keeps GPT Image 2, built-in Codex/ChatGPT image generation, default static raster graphic generation, one pass, exact final copy, safe margins, no extra words, Python-generated artwork prohibition, coded or vector artifact exceptions, and Do not silently replace visible in the documentation and config.
