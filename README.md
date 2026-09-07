# Junxian Wu - Public Portfolio

Source for [vemodalen-x.github.io](https://vemodalen-x.github.io), a public-safe portfolio for a Senior AI Engineer working across production computer vision, computational photography, edge deployment, and reliable agent workflows.

The narrative is **from perception to production**:

`perception -> reasoning -> runtime -> evaluation -> handoff`

## Public Evidence

- `index.html` - concise positioning and selected evidence.
- `work.html` - public-safe system case studies.
- `agentic-systems.html` - evidence and boundaries for reliable agent and multimodal workflows.
- `photography-mentor-agent.html` - browser-local image diagnostics, retrieval, practice planning, and review state.
- `business-learning-studio/` - privacy-first commercial learning workspace with 32 original knowledge cards, four practice modes, a five-gate local coach, and offline support.
- `resume.html` - text-based web CV with standard experience and education headings.
- `assets/junxian-wu-cv.pdf` - downloadable one-page CV.
- `agentic_workflow/` - provider-neutral orchestration reference with validated output contracts, retry, fallback, human-review gates, and deterministic traces.
- `tests/` - executable hard cases and release-safety checks.

## Run Locally

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`.

Run the public reference example and tests:

```powershell
python -m examples.run_agentic_workflow
python -m unittest discover -s tests -v
```

Run the Business Learning Studio release checks:

```powershell
Set-Location business-learning-studio
npm run verify
```

## Release Safety

This is a GitHub Pages repository, not a general local workspace. Generated exports, private knowledge indexes, authenticated course material, browser state, local paths, and downloaded third-party media are excluded from publication.

Audit the complete Git index (the exact staged contents, not working-tree copies):

```powershell
python scripts/check_public_release.py
```

Audit only the staged release candidate before committing:

```powershell
python scripts/check_public_release.py --staged
```

The audit rejects private paths, common secret patterns, oversized files, unresolved
merges, symlinks and submodules. It is a guardrail, not a guarantee of confidentiality:
review text, PDFs and images before staging. The portfolio workflow also runs Python
regression tests, local link and asset checks, and both application release suites.

## Rebuild the CV

The public PDF is generated from the editable DOCX source builder. Install the optional
document dependencies in a virtual environment, then run:

```powershell
python -m pip install python-docx reportlab
python scripts/build_master_cv.py
python scripts/render_cv_pdf.py outputs/cv/Junxian_Wu_AI_Systems_CV_2026.docx assets/junxian-wu-cv.pdf
```

Inspect the rendered PDF before publishing. Keep employer names, dates and responsibilities
consistent with `resume.html`. DOCX exports remain under ignored `outputs/cv/`.

## Editorial Boundary

- Production experience is described without customer names, private metrics, internal paths, repositories, artifacts, logs, or thresholds.
- Public agent evidence distinguishes tested orchestration code from deterministic browser applications.
- The portfolio does not claim a live commercial-provider integration, foundation-model training, or hyperscale LLM infrastructure.
- Role fit is stated separately from current job title.

## Photography Mentor v1.2

The commercial, browser-local Photography Mentor release includes 62 public-source knowledge cards, 7 stages, 22 learning nodes, image diagnostics, spaced review, user-controlled SYBJ note import, offline support, and complete local-data portability.

- [Product documentation](docs/photography-mentor/README.md)
- [Privacy](docs/photography-mentor/PRIVACY.md)
- [Terms](docs/photography-mentor/TERMS.md)
- [Release notes](docs/photography-mentor/RELEASE_NOTES.md)

Run `npm test` to validate the product boundary and deterministic release manifest.
