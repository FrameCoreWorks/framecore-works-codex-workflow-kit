# Image Prompt Contract

- model_policy: Static raster graphics with visible text must use the native Codex/ChatGPT image generator powered by GPT Image 2 in one pass.
- exact_visible_text:
  - "Compact setup, clearer focus"
  - "Learn more"
- final_prompt: Create a clean product-neutral static graphic with the exact visible text included directly in the generated image, clear hierarchy, safe margins, no extra words, and no duplicate text.
- negative_constraints:
  - no text overlays after generation
  - no invented logos
  - no unsupported feature claims
  - no extra visible text
- QA_checks:
  - exact text appears once
  - spelling is correct
  - text does not overlap the product
  - output follows the one-pass text-bearing image policy
