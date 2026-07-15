# Personal IP and CV Consolidation Review

## Executive Finding

The underlying experience is coherent, but the public presentation was fragmented. The same work appeared under different labels - Forward-Deployed AI, Edge AI, computational photography, technical leadership lines, multimodal agents, tooling, and knowledge systems - without one stable hierarchy.

The correct organizing principle is:

**From perception to production: Perception -> Reasoning -> Runtime -> Evaluation -> Handoff.**

Production computer vision and edge deployment are the foundation. Computational photography is the differentiated domain. Agentic and multimodal AI are the growth vector. Evaluation and handoff are the operating method that connects them.

## Findings by Severity

### Critical - Role identity conflict

The previous PDF CV and GitHub profile described the candidate as a `Forward-Deployed AI Engineer`, while the verified employment title is `Senior AI Engineer`. This creates an avoidable credibility question. All first-screen surfaces should use the actual title and describe forward-deployed work as a capability or target role.

### High - Duplicate evidence pages

`work.html` and `technical-lines.html` both described the same vision, runtime, rendering, evaluation, and agentic work. Recruiters should not have to compare two taxonomies. `work.html` should own the narrative and case studies; `technical-lines.html` should remain a compact reference map.

### High - Project inventory replacing value

Internal Summary pages contain valid file, commit, project, and documentation counts, but these are handoff evidence rather than hiring value. Public surfaces should emphasize systems owned, constraints handled, and reusable delivery patterns. Counts should remain private unless they directly prove approved impact.

### High - Production and personal-agent evidence mixed together

The portfolio sometimes presented local RAG tools and multimodal agent prototypes inside professional experience without a clear boundary. The revised architecture separates employer experience from public personal systems while using both to support the broader Agentic AI direction.

### Medium - Knowledge products dilute recruiter navigation

Business Tutor, Photography Mentor, personal knowledge tools, course notes, and study reports are useful personal IP, but they should sit below a single `Agents` evidence page. They should not compete with Work and CV in the primary navigation.

### Medium - CV density

The previous two-page PDF repeated a profile, five core-strength paragraphs, detailed experience, technical leadership lines, and a long keyword block. It was technically rich but forced the reader to reconstruct the same story several times. The replacement CV should use one summary, one five-stage systems line, concise experience, three selected-system proofs, and a compact stack.

## Consolidation Decisions

| Existing material | Decision | Canonical destination |
| --- | --- | --- |
| Summary executive brief, journey, career strategy and value pages | Extract narrative and evidence; keep private | `master-narrative.md` plus private Summary |
| Work and Technical Lines | Merge narrative into Work; keep Technical Lines as compact map | `work.html`, `technical-lines.html` |
| Multimodal composition, Photography Mentor, Business Tutor and Knowledge Assistant | Group as agent-system evidence | `agentic-systems.html` |
| LinkedIn About, GitHub profile intro, homepage intro and CV profile | Use one shared positioning statement | `master-narrative.md` |
| Commit counts, file counts, report counts and internal asset names | Remove from public hiring story | Private Summary only |
| Learning reports and course summaries | Keep as secondary personal knowledge output | Notes or unlinked utility pages |
| PDF CV and HTML CV | Share the same title, summary, experience and technical spine | `resume.html`, `assets/junxian-wu-cv.pdf` |

## Final Content Architecture

### Tier 1 - Five-second identity

- LinkedIn introduction card
- Homepage first screen
- GitHub profile README opening
- CV header and summary

Message: **Senior AI Engineer building reliable vision and agentic AI systems from perception to production.**

### Tier 2 - Recruiter and Tech Lead evidence

- Selected Systems
- Agentic and Multimodal Systems
- CV
- Publication

Message: three evidence pillars connected by one delivery spine.

### Tier 3 - Interactive personal IP

- Photography Mentor
- Business Tutor
- Local Knowledge Assistant
- Personal Knowledge Hub

Message: public demonstrations of workflow design, retrieval, evaluation, and product thinking.

### Tier 4 - Private evidence and handoff

- Detailed Summary
- Internal reports, code snapshots, metrics, customer context and handoff material

Message: private substantiation, never a public portfolio attachment.

## Remaining Gaps

1. Approved business or performance metrics for production systems.
2. A deployed public agent using a real backend, persisted state, observability, and an evaluation dataset.
3. A standard RAG project with embeddings, retrieval metrics, citations, and failure analysis.
4. Two public recommendations confirming ownership and cross-functional delivery.
5. A small set of English technical articles that convert internal expertise into external authority.

## Implementation Result

- Homepage, Work, Agentic Systems, Notes, HTML CV, and GitHub profile copy now use one narrative.
- Work owns the detailed evidence; Technical Map is a compact secondary reference.
- Agent tools are grouped under one Agentic Systems proof path.
- The current title is consistently `Senior AI Engineer`; Forward Deployed Engineer is presented as role fit, not employment history.
- A new sanitized DOCX/PDF CV shares the same summary, experience, evidence pillars, technical stack, education, and publication as the site.
- `artifact-map.md` defines the canonical asset for every audience need and marks older material as supporting, private, or archived.
