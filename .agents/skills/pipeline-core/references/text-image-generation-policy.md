# Static Raster And Text Image Generation Policy

Generated static raster graphics should use the built-in Codex/ChatGPT image generation capability powered by GPT Image 2 by default when available.

Static raster graphics with visible text must use the same built-in path in one pass.

This is a native chat-window generation path, not an external provider integration, API key requirement, CLI, or paid media-provider workflow.

If the current Codex environment does not expose built-in image generation, stop and ask the user how to proceed. Do not silently replace this path with Python-generated artwork, coded SVG, HTML/canvas, Sharp/composited PNG, or text overlays unless the user explicitly asks for coded or vector artwork.

The prompt must include:

- exact visible copy
- layout hierarchy
- placement and safe margins
- typography direction
- no extra words and no duplicate text constraints

Do not generate a text-free background first and add text later.
