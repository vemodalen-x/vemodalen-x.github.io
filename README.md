# Business Learning Studio

Business Learning Studio is a privacy-first workspace for turning ambiguous business questions into evidence, experiments and decisions. It is designed for internet and AI product teams that need an executable learning loop instead of another content library.

## Product surfaces

- **Learning Studio**: creates a focused plan, runs four-mode practice and tracks evidence-backed mastery.
- **Knowledge OS**: 32 original cards across eight operating stages, with search and stage filters.
- **Local Coach**: a five-gate guided conversation covering goal, assumption, evidence, experiment and decision.
- **Offline use**: all runtime assets are bundled locally; a service worker caches the application when served over HTTP.
- **Data portability**: learning and coaching data stays in the browser and can be exported as JSON.

## Run locally

No build step is required for the application itself. Serve the repository root with any static server, then open `index.html`.

```powershell
npx serve .
```

For a file-only fallback, `index.html`, `knowledge.html` and `coach.html` also open directly. Service-worker installation requires HTTP or HTTPS.

## Verify a release

Node.js 20 or newer is required for verification.

```powershell
npm run verify
```

The command regenerates the public knowledge set, runs product contract tests, audits privacy and release boundaries, then writes an allowlisted package to `dist/` with SHA-256 hashes.

## Content boundary

The commercial public edition contains original, generic business-learning material. It does not include paid-course transcripts, copied long-form notes, private account data, browser caches, local file paths or third-party screenshots. See `PRIVACY.md` and `LICENSE.md`.
