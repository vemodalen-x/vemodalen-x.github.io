# Computational Photography Banner Generation

## Mode

Image generation followed by one reference-image edit, then deterministic crop and typography in Pillow.

No external image assets were used. The visual source was generated with OpenAI image generation.

## Initial Prompt

Create a premium LinkedIn profile cover background for a senior computational photography and computer vision engineer.

Use case: professional personal brand / recruitment banner.
Final composition must work at a 4:1 aspect ratio (1584 x 396 after crop).
Visual story, left to right: a physically believable camera lens and image sensor capture; a clean segmentation matte with precise hair-edge detail; layered monocular depth planes and a depth map; optical aperture and realistic bokeh formation; GPU-assisted image rendering resolving into a crisp final photograph preview. Make the pipeline visually understandable without diagrams or generated labels.

Composition:
- Keep the left 34% quiet, low-detail, and visually calm because LinkedIn's circular profile photo will cover it.
- Concentrate the computational photography pipeline in the center and lower-right.
- Leave clean negative space in the upper-right for deterministic typography to be added later.
- All essential elements must stay inside the central horizontal band so a 4:1 crop preserves them.
- No people, faces, logos, watermarks, numbers, glyphs, pseudo-text, interface chrome, or code.
- Avoid sci-fi HUD styling, neon cyberpunk, generic circuit-board imagery, purple-blue gradients, decorative blobs, or stock-photo aesthetics.

Art direction:
- Sophisticated editorial technical illustration with subtle photorealistic optical materials.
- Warm white to light neutral background, graphite details, muted teal signal color, restrained amber lens highlights, tiny spectral color accents only where physically meaningful.
- Clear, calm, precise, senior-engineer tone.
- High contrast only around the optical and image-processing stages; generous whitespace.
- Polished enough for a Silicon Valley technical leader's LinkedIn profile.

## Final Edit Prompt

Edit this computational photography LinkedIn banner concept while preserving its premium warm-white editorial style and the clear optical pipeline.

Critical composition correction:
- The final image will be center-cropped to a 4:1 LinkedIn banner.
- Scale the entire lens/sensor/matte/depth/aperture/rendering/final-image sequence down and move it into the RIGHT 58% of the canvas.
- Leave the LEFT 38% genuinely empty and calm: warm-white background with only an extremely subtle teal optical ray near the vertical center. No lens, device, panels, or detailed object may enter that left safe zone.
- Leave the UPPER-RIGHT area relatively calm as well so typography can be overlaid later.
- Keep all important pipeline objects inside the middle horizontal 44% of canvas height so they survive a tight 4:1 crop.
- The final-image panel should end before the right edge with clear breathing room.

Content remains: camera lens and sensor capture, precise segmentation/matte, layered monocular depth, optical aperture and physically plausible bokeh, GPU/image-signal processing, crisp final image.
No people, faces, logos, words, letters, numbers, watermarks, pseudo-text, HUD interface, generic circuits, neon, purple-blue gradients, or decorative blobs.
Senior engineering brand: precise, understated, visually intelligent, and technically credible.
