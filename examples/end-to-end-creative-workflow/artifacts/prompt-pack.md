# Prompt Pack

## Hero Image Prompt

- prompts:
  - "Create a clean ecommerce hero image of a compact modular desk lamp on a neutral desk surface. Show the full lamp clearly in a three-quarter view, with an adjustable head, visible modular joint, small footprint, matte neutral body, and soft warm-white light cone. Use realistic product photography lighting, gentle ambient fill, crisp product edges, and subtle desk texture. No brand marks, no visible text, no badges, no unsupported feature labels."
- constraints:
  - no external provider execution
  - no visible text
  - product must remain fully visible
- expected_observables:
  - compact scale
  - adjustable lamp head
  - readable light cone
  - clean ecommerce composition
- acceptance_criteria:
  - no hallucinated logo
  - no extra product parts
  - no clutter blocking the silhouette

## Lifestyle Prompt

- prompts:
  - "Create a realistic lifestyle ecommerce image of a compact modular desk lamp on a small apartment desk. The lamp is switched on, casting a soft warm light over a notebook and laptop corner. Keep the scene calm, organized, and practical. The product must be the visual anchor, fully visible, with a clear adjustable head and compact base. No brand marks, no visible text, no posters, no fake UI, no unsupported claims."
- constraints:
  - no text overlays
  - no messy private-looking workspace
  - no branded devices
- expected_observables:
  - small-space context
  - lamp as main subject
  - warm useful lighting
- acceptance_criteria:
  - scene supports the brief audience
  - product is not lost in decor

## Product Reveal Storyboard Idea

- prompts:
  - "Beat 1: close view of a compact desk surface with the lamp folded down, showing small footprint. Beat 2: hand adjusts the lamp head upward, revealing the modular joint. Beat 3: lamp turns on and creates a warm focused light cone over a notebook. Keep product geometry consistent, environment neutral, no visible text, no brand marks."
- constraints:
  - planning only
  - no video generation
  - continuity must preserve lamp shape
- expected_observables:
  - footprint
  - adjustability
  - warm light benefit
- acceptance_criteria:
  - three clear beats
  - product continuity maintained
  - no unsupported feature claims
