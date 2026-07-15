# Photography Mentor Agent v1.1.0

Release date: 2026-07-15

Photography Mentor is a browser-local learning application for image diagnostics, retrieval, deliberate practice, review state, and evidence-aware coaching. The public release is deterministic and inspectable; it is not presented as an LLM-backed agent.

## v1.1 interaction update

- Four task-oriented workspaces replace the previous long-document navigation: Focus, Map, Studio, and Library.
- Workspace state is reflected in the URL and retained locally, so a learning context can be revisited directly.
- The 22-node knowledge atlas now supports live search and mastery-state filters.
- Selecting a node opens an in-context inspector with mastery, review timing, principles, practice, sources, and a direct Session action.
- Desktop and mobile layouts progressively collapse the atlas and inspector without horizontal page overflow.

## Public scope

- 62 source-linked photography knowledge cards across computational photography, aesthetics, capture, post-processing, genres, and learning methods.
- 7 learning stages and 22 consolidated knowledge nodes.
- Active recall, layered hints, practice evidence, review, mastery state, and spaced repetition.
- Before/after image comparison with explainable brightness, contrast, saturation, sharpness, highlight, and shadow metrics.
- Browser-local profile and review state. Image pixels are not written to `localStorage`.
- A PWA shell with local assets and offline support limited to the Photography Mentor route.

Private book inventories, local file paths, restricted-source material, credentials, and access-controlled content are intentionally excluded from the public repository.

## Run locally

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/photography-mentor-agent.html`. Service Worker and install behavior require an HTTP context, so opening the HTML file directly is not supported.

## Validate

```powershell
node scripts/validate-photography-mentor.mjs
```

The validator checks release files, local references, JavaScript syntax, DOM identifiers, knowledge-card integrity, taxonomy coverage, the manifest, and offline cache coverage.

## Public files

- `photography-mentor-agent.html`: product interface and browser-side workflow.
- `knowledge/photography-mentor-kb.js`: 62 summarized knowledge cards and source references.
- `knowledge/photography-mentor-taxonomy.js`: 7 stages and 22 consolidated nodes.
- `notes/photography-mentor-research-2026-07-11.md`: research and source boundaries.
- `notes/photography-knowledge-review-2026-07-14.md`: knowledge coverage review.
- `notes/photography-mentor-product-review-2026-07-15.md`: product and learning-experience review.
- `scripts/validate-photography-mentor.mjs`: release integrity checks.
- `manifest.webmanifest` and `sw.js`: install and offline configuration.

## Boundaries

- Knowledge cards contain summaries and links, not republished source articles or books.
- Image diagnostics use explainable browser-side statistics; they do not provide semantic understanding or aesthetic judgment from a multimodal model.
- The static release has no server account, cross-device sync, team collaboration, or cloud vector database.
- External links can change. The knowledge base preserves source metadata so future releases can audit stale references.
