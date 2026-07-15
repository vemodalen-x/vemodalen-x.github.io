# Junxian Wu Personal Website

Source for [vemodalen-x.github.io](https://vemodalen-x.github.io), a concise personal site for Junxian Wu.

The public narrative is **From perception to production**: perception -> reasoning -> runtime -> evaluation -> handoff. The primary navigation is organized as About / Work / Agents / Notes / CV.

The evidence hierarchy is intentionally compact:

- **Production foundation:** Vision & Edge AI
- **Differentiated domain:** Computational Photography
- **Growth vector:** Agentic & Multimodal AI
- **Operating method:** Evaluation and Handoff

## Pages

- `index.html`: About page
- `work.html`: selected public case studies
- `agentic-systems.html`: public evidence for agentic and multimodal systems
- `technical-lines.html`: secondary five-stage technical reference
- `writing.html`: public engineering notes roadmap
- `resume.html`: CV page
- `interview-prep/learning-os.html`: adaptive interview-learning workspace with diagnostics, daily missions, spaced review, evidence capture, and local progress persistence
- `interview-prep/README.md`: source clusters, practice roadmap, study plan, and operating guide for the interview-learning system
- `business-tutor-agent.html`: secondary Chinese business tutor agent workbench with local RAG and structured learning workflows
- `personal-knowledge-hub.html`: local knowledge search, study paths, spaced review, and Markdown capture
- `local-knowledge-assistant.html`: local method assistant for learning, decisions, projects, and daily review
- `knowledge/yitang-business-kb.js`: local summary-level knowledge base used by the business tutor agent for lightweight RAG-style retrieval
- `knowledge/mao-method-kb.js`: method cards distilled from selected Mao texts, with modern application boundaries and source links
- `knowledge/waytoagi-method-kb.js`: reusable AI-learning, agent, creative, research, product, and governance cards distilled from the public WaytoAGI Wiki
- `knowledge/waytoagi-catalog.json`: rebuildable public WaytoAGI directory metadata and source links, without mirroring third-party full text
- `knowledge/README.md`: personal knowledge architecture, Windows startup, search, maintenance, and safety guide
- `notes/mao-selected-works-methodology.md`: methodology MOC covering investigation, practice loops, contradiction analysis, pilots, coordination, and stage strategy
- `notes/pkm-five-round-iteration-2026-07-11.md`: completed five-round iteration record for the local PKM assistant
- `notes/waytoagi/01-waytoagi-master-synthesis.md`: detailed WaytoAGI capability map, synthesis, boundaries, and application routes
- `notes/yitang-ai-coach-observation-2026-07-10.md`: method-level observations from the Yitang AI teaching officer flow, without raw paid transcripts or long copied answers
- `notes/yitang-ai-partner-capability-and-business-map-2026-07-11.md`: capability boundary, decision-flow, and cross-course business learning map distilled from two Yitang AI Partners
- `yitang-course-summary.html`: Chinese study page summarizing public Yitang course information
- `notes/yitang-299-ai-new-paradigm-notes.md`: structured personal notes from the logged-in Yitang 299 AI-new-paradigm document
- `notes/yitang-G0mU-ai-new-paradigm-candy-notes.md`: local index for the AI-new-paradigm lesson Candy resources
- `notes/yitang-fupan-effective-notes.md`: local effective notes from the Yitang replay camp page and science-decision course
- `notes/yitang-elective-complete-learning-notes.md`: complete local notes for all selected elective courses and Candy summaries
- `notes/yitang-elective-source-index.md`: section-by-section source, link, and image-count index for the Yitang elective audit
- `notes/yitang-candy-external-index.md`: external Candy document index with readable metadata and image counts
- `assets/styles.css`: shared styling
- `profile-readme.md`: draft content for the special GitHub profile README repository

## Editorial Principles

- Keep public content focused on reusable engineering judgment.
- Avoid confidential company, customer, partner, repository, benchmark, architecture, model artifact, internal path, private metric, raw log, or threshold details.
- Prefer clear role fit and technical signal over volume metrics.
- Do not use commit counts, file counts, customer line counts, or internal delivery counts as the primary proof point.

## Consolidated GitHub Evidence Repositories

- `vision-edge-systems`: model deployment, runtime integration, quantization, and device validation
- `computational-photography-notes`: perception-to-rendering methods and visual-quality evaluation
- `agentic-multimodal-systems`: local RAG, structured outputs, routing, failure handling, and evaluation

These repositories should use public-safe notes, checklists, and toy systems without exposing company code or internal metrics.

## Run the local knowledge assistant on Windows

This machine has Windows 11, Python 3.10, PowerShell 5.1, and Git. Obsidian is optional and is not required.

```powershell
Set-Location 'C:\Users\User\Documents\个人ip和主页'
powershell -ExecutionPolicy Bypass -File .\scripts\start-knowledge-assistant.ps1
```

Open `http://127.0.0.1:8765/personal-knowledge-hub.html`. The startup script rebuilds the browser index before serving. Durable review, workflow, and feedback state is stored in `%LOCALAPPDATA%\PersonalKnowledgeHub\state.sqlite3`. Press `Ctrl+C` in PowerShell to stop the local server.

Search both the current notes and the older PC knowledge base:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\search-personal-knowledge.ps1 -Query '主要矛盾'
```

The local assistant is intentionally not linked from the public portfolio navigation. Review the files before publishing them to GitHub Pages.

## Repository boundaries

The repository versions authored pages, interview-learning materials, curated notes, local knowledge-base data, required web assets, and the scripts needed to rebuild indexes or offline views. It intentionally excludes browser profiles, runtime state, Python caches, downloaded third-party repositories and media, import checkpoints, ZIP exports, and visual-regression screenshots.

To inspect the interview-learning workspace locally:

```powershell
python -m http.server 8000
```

Open `http://127.0.0.1:8000/interview-prep/learning-os.html`. Progress is stored in the browser's local storage and is not committed to Git.
