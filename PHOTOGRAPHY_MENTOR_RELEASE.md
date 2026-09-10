# Photography Mentor Agent v1.4.0

Release date: 2026-09-10

Photography Mentor is a browser-local learning application for image diagnostics, retrieval, deliberate practice, review state, and evidence-aware coaching. The public release is deterministic and inspectable; it is not presented as an LLM-backed agent.

## v1.4 commercial delivery workflow

- Added a local multi-file and folder selector for reviewing a personal photo archive without sending images to the app.
- Added explainable commercial pre-screening for dimensions, megapixels, file size, sharpness, exposure and highlight clipping.
- Added explicit manual checks for recognizable people, model/property release risk, brands/IP, copyright status and AI editing; the app does not claim semantic rights detection.
- Added candidate, manual-review and hold states with per-file selection, platform fit and source-linked official rules.
- Added CSV/JSON delivery kits containing filenames, user-entered metadata and derived metrics only; no pixels or absolute local paths are exported.
- Added official-platform handoff buttons for Adobe Stock, Shutterstock, Alamy, Wirestock and 500px; EyeEm is marked as requiring current-status confirmation.
- The handoff opens the official site only. Login, original-file upload, release attachment, current terms and final submission remain user-controlled.

## v1.3 first-principles integration

- A single browser-side Mentor Core now powers general advice, photo critique, knowledge search, and Session questions.
- Every response follows an inspectable contract: facts, assumptions, unknowns, one bottleneck, cited knowledge, one-variable action, success criteria, and failure signals.
- 12 topic-level summaries from the local photography library are merged with the 62 canonical cards after a strict sanitization pass.
- Hybrid retrieval combines lexical matching, task routing, learning stages, capability clusters, domains, genres, source diversity, and source-type quotas.
- Local summaries cannot monopolize retrieval; relevant primary or official sources remain represented.
- SYBJ user-authorized note imports rebuild the same Mentor Core index instead of using a separate answer path.
- Bottleneck selection now scores multiple task signals instead of accepting the first keyword match; confidence is derived from evidence strength, missing information, diagnostics, and citation quality.
- A 14-case evaluation set covers exposure, lighting, color, sharpness, composition, computation, post-production, learning, ethics, print, and commercial delivery.
- Users can locally mark advice as accepted, rejected, or verified with result evidence; these records are included in explicit learning-data exports.

## v1.1 interaction update

- Four task-oriented workspaces replace the previous long-document navigation: Focus, Map, Studio, and Library.
- Workspace state is reflected in the URL and retained locally, so a learning context can be revisited directly.
- The 22-node knowledge atlas now supports live search and mastery-state filters.
- Selecting a node opens an in-context inspector with mastery, review timing, principles, practice, sources, and a direct Session action.
- Desktop and mobile layouts progressively collapse the atlas and inspector without horizontal page overflow.

## Public scope

- 74 source-linked knowledge cards: 62 canonical web/research cards plus 12 sanitized local-library topic summaries.
- 41 packaged evidence sources with explicit provenance classes and 100% card-to-source citation coverage, plus one browser-local SYBJ user-note channel.
- 7 learning stages and 22 consolidated knowledge nodes.
- Active recall, layered hints, practice evidence, review, mastery state, and spaced repetition.
- Before/after image comparison with explainable brightness, contrast, saturation, sharpness, highlight, and shadow metrics.
- Browser-local profile and review state. Image pixels are not written to `localStorage`.
- Browser-local decision feedback records adoption, rejection, and verification evidence without a network request.
- Local commercial delivery pre-screening and metadata-kit export for selected photos; no automatic third-party upload.
- A PWA shell with local assets and offline support limited to the Photography Mentor route.

Private book inventories, local file paths, filenames, restricted-source material, credentials, and access-controlled content are intentionally excluded from the public repository. Only category-level local-library synthesis is shipped.

## Run locally

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/photography-mentor-agent.html`. Service Worker and install behavior require an HTTP context, so opening the HTML file directly is not supported.

## Validate

```powershell
node scripts/validate-photography-mentor.mjs
node scripts/evaluate-photography-mentor.mjs
node --test tests/photography-mentor-core.test.mjs
```

The validator checks release files, local references, JavaScript syntax, DOM identifiers, knowledge-card integrity, taxonomy coverage, the manifest, and offline cache coverage. The evaluation suite checks 14 representative tasks against bottleneck, stage, relevant-card, citation, and source-balance expectations. The unit suite verifies the evidence contract, source balance, graph merge, and privacy boundary.

After installing Playwright and starting the local server, run the desktop/mobile browser regression:

```powershell
node tests/photography-mentor-e2e.cjs
```

Set `PHOTOGRAPHY_MENTOR_URL` to test another local URL. Set `PHOTOGRAPHY_MENTOR_QA_OUTPUT` only when local QA screenshots are needed; screenshot output is not part of the public release.

## Public files

- `photography-mentor-agent.html`: product interface and browser-side workflow.
- `knowledge/photography-mentor-kb.js`: 62 summarized knowledge cards and source references.
- `knowledge/photography-local-summaries.js`: 12 sanitized local-library topic summaries with no paths or file inventory.
- `knowledge/photography-mentor-taxonomy.js`: 7 stages and 22 consolidated nodes.
- `knowledge/photography-mentor-core.js`: deterministic routing, retrieval, evidence ledger, decision, and verification engine.
- `knowledge/photography-commercial-engine.js`: deterministic commercial pre-screening, platform-fit and metadata-kit engine.
- `notes/photography-mentor-first-principles-integration-2026-08-02.md`: architecture and privacy model.
- `scripts/build-photography-local-summaries.mjs`: private-to-public summary sanitizer.
- `scripts/evaluate-photography-mentor.mjs`: deterministic retrieval and decision evaluation runner.
- `tests/fixtures/photography-mentor-eval.json`: representative task and relevance expectations.
- `notes/photography-mentor-research-2026-07-11.md`: research and source boundaries.
- `notes/photography-knowledge-review-2026-07-14.md`: knowledge coverage review.
- `notes/photography-mentor-product-review-2026-07-15.md`: product and learning-experience review.
- `notes/photography-mentor-commercial-research-2026-09-10.md`: official platform rules and commercial delivery boundaries.
- `scripts/validate-photography-mentor.mjs`: release integrity checks.
- `tests/photography-mentor-core.test.mjs`: deterministic Mentor Core and privacy tests.
- `tests/photography-mentor-commercial.test.mjs`: commercial scoring, platform-fit and export privacy tests.
- `tests/photography-mentor-e2e.cjs`: desktop/mobile browser regression without committed screenshots.
- `manifest.webmanifest` and `sw.js`: install and offline configuration.

## Boundaries

- Knowledge cards contain summaries and links, not republished source articles or books.
- Local-library synthesis contains no filenames, paths, source archives, or book text.
- Image diagnostics use explainable browser-side statistics; they do not provide semantic understanding or aesthetic judgment from a multimodal model.
- Commercial pre-screening is a technical and workflow aid, not a rights determination, acceptance guarantee or earnings forecast. Platform rules and availability must be rechecked before every submission.
- Decision feedback remains in browser storage until the user exports or clears browser data; it is not a cloud analytics pipeline.
- The static release has no server account, cross-device sync, team collaboration, or cloud vector database.
- External links can change. The knowledge base preserves source metadata so future releases can audit stale references.
