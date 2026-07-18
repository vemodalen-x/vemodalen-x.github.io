# Photography Mentor Agent v1.2.0

Release date: 2026-07-18

Photography Mentor is a browser-local learning application for image diagnostics, retrieval, deliberate practice, review state and evidence-aware coaching. The public release is deterministic and inspectable; it is not presented as a server-side LLM or multimodal vision agent.

## Public Product Scope

- 62 source-linked photography knowledge cards across computational photography, aesthetics, capture, post-processing, genres and learning methods.
- 7 learning stages and 22 consolidated knowledge nodes.
- Focus, Map, Studio and Library task spaces with URL-restorable state.
- Active recall, layered hints, practice evidence, review, mastery state and spaced repetition.
- Browser-local Before/After comparison and explainable image statistics.
- SYBJ official login handoff plus local import of summaries written by the user.
- Complete learner-data export, validated restore and local deletion controls.
- A local-asset PWA shell with route-scoped offline support.

## Public Boundary

Private book inventories, local file paths, restricted-source material, credentials, access-controlled content, screenshots and historical workspace commits are intentionally excluded. Knowledge cards contain summaries and links, not republished source articles or books.

Image pixels stay in the active browser session. Profile and review data use browser-local storage. This static release has no account server, cross-device sync, payment system, team collaboration or cloud vector database.

## Validation

```powershell
npm run manifest
npm test
```

The validator checks release files, local references, JavaScript syntax, DOM identifiers, knowledge-card integrity, taxonomy coverage, the manifest and offline cache. The public audit enforces the release allowlist and rejects screenshots, raster media, secrets, private paths and checksum drift.

## Release Contents

- `photography-mentor-agent.html`: product interface and browser workflow.
- `knowledge/photography-mentor-kb.js`: public summarized knowledge cards and sources.
- `knowledge/photography-mentor-taxonomy.js`: 7 stages and 22 consolidated nodes.
- `notes/`: public research, knowledge coverage and product reviews.
- `scripts/`: integrity, checksum and public-boundary checks.
- `manifest.webmanifest` and `sw.js`: installation and offline configuration.
- Commercial policies, license, notices, changelog and release notes.
