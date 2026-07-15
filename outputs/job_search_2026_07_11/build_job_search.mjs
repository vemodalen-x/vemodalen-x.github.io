import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.dirname(fileURLToPath(import.meta.url));
const checkedDate = new Date("2026-07-11T00:00:00");

const jobs = [
  {
    rank: 1,
    company: "SGInnovate / Polybee",
    role: "Computer Vision Engineer",
    track: "Computer Vision / Edge",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "2 weeks ago",
    postedDate: "2026-06-27",
    scores: [25, 24, 20, 15, 8, 5],
    blocker: "None",
    fit: "Near-direct match for production CV, segmentation, Python/C++, TensorRT/ONNX, data loops, edge constraints, and customer feedback.",
    gaps: "Add explicit MLOps monitoring examples; 3D reconstruction and drone imagery are preferred, not core.",
    cvAngle: "Lead with model-to-runtime ownership, segmentation/matting, export validation, edge optimization, hard-case data, and field acceptance gates.",
    keywords: "Computer vision; segmentation; Python; C++; TensorRT; ONNX Runtime; MLOps; edge deployment; customer feedback",
    workMode: "Singapore; field/customer collaboration",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/computer-vision-engineer-at-sginnovate-4425072309",
    notes: "Best immediate CV role. Apply with the CV-focused version and mention the Automation in Construction paper briefly."
  },
  {
    rank: 2,
    company: "Razer",
    role: "Senior AI Engineer (Applied)",
    track: "Multimodal / Applied AI",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "1 month ago",
    postedDate: "2026-06-11",
    scores: [24, 24, 20, 15, 8, 5],
    blocker: "None",
    fit: "Strong overlap in AI evaluation, benchmarking, vision/GenAI, FastAPI services, Docker, reproducibility, and product trade-offs.",
    gaps: "Make cloud deployment and Kubernetes depth more explicit; current public evidence is stronger on Docker and native runtime.",
    cvAngle: "Lead with evaluation frameworks, visual failure analysis, structured multimodal workflows, reusable services, and latency/quality trade-offs.",
    keywords: "Applied AI; evaluation; benchmarking; computer vision; GenAI; RAG; agents; FastAPI; Docker; Kubernetes",
    workMode: "Singapore office",
    travel: "Occasional, up to 1 trip/year",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/senior-ai-engineer-applied-at-razer-4414641003",
    notes: "Very good bridge from CV deployment into broader Applied AI without abandoning your strongest evidence."
  },
  {
    rank: 3,
    company: "Resaro",
    role: "Forward Deployed Engineer",
    track: "FDE / Solutions",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "5 days ago",
    postedDate: "2026-07-06",
    scores: [24, 23, 19, 14, 9, 5],
    blocker: "None",
    fit: "Excellent overlap in CV assurance, test plans, acceptance gates, customer deployment, rapid prototypes, integrations, and field feedback.",
    gaps: "Air-gapped/on-prem operations and formal AI assurance language need careful, truthful translation from existing deployment work.",
    cvAngle: "Frame hard-case taxonomies, model comparison reports, acceptance gates, customer issue triage, and handoff documentation as AI assurance evidence.",
    keywords: "Forward deployed; AI assurance; computer vision; testing; evaluation; on-prem; integration; prototyping; customer deployment",
    workMode: "Embedded/on-site customer environments",
    travel: "Customer-site work expected",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/forward-deployed-engineer-at-resaro-4429678422",
    notes: "One of the cleanest narrative matches. Do not claim air-gapped delivery unless you can evidence it in interview."
  },
  {
    rank: 4,
    company: "Dyson",
    role: "Lead Vision Software Engineer",
    track: "Computer Vision / Edge",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "1 day ago",
    postedDate: "2026-07-10",
    scores: [25, 23, 20, 11, 9, 5],
    blocker: "None",
    fit: "Direct fit for edge vision, C++/Python, segmentation, embedded Linux, model optimization, data workflows, APIs, and technical ownership.",
    gaps: "Role asks for 5+ years and lead-level mentoring; make technical ownership and reusable platform work concrete.",
    cvAngle: "Use the CV/edge version: C++/Android runtime, TFLite/ONNX/TensorRT, segmentation, model compression, rendering, CI-style release checks.",
    keywords: "Vision software; edge AI; C++; Python; embedded Linux; segmentation; model optimization; MLOps; APIs; technical lead",
    workMode: "Singapore office",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/lead-embedded-software-engineer-at-dyson-4403195930",
    notes: "Apply despite the 5+ year line. Your 4+ years plus platform ownership can clear the screen if stated crisply."
  },
  {
    rank: 5,
    company: "Genesis MedTech",
    role: "Machine Learning Engineer, Computer Vision",
    track: "Computer Vision / Edge",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "3 weeks ago",
    postedDate: "2026-06-20",
    scores: [24, 23, 18, 15, 8, 4],
    blocker: "None",
    fit: "Strong match for segmentation, tracking, depth/3D-adjacent work, full ML lifecycle, real-world data, stakeholder discovery, and product delivery.",
    gaps: "No medical-device domain evidence; emphasize rigorous validation and avoid implying clinical experience.",
    cvAngle: "Lead with segmentation/matting, depth, full lifecycle, validation gates, reproducible data review, and cross-functional productization.",
    keywords: "Digital surgery; computer vision; segmentation; tracking; 3D reconstruction; model lifecycle; validation; Python",
    workMode: "Singapore office",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/machine-learning-engineer-computer-vision-at-genesis-medtech-group-4415996644",
    notes: "Master's degree requirement is met. Strong domain-adjacent role with good long-term CV depth."
  },
  {
    rank: 6,
    company: "ByteDance / BytePlus",
    role: "Forward Deployed Engineer - BytePlus",
    track: "FDE / Solutions",
    location: "Singapore",
    source: "Jobstreet",
    sourceStatus: "Apply visible",
    postedAge: "22 days ago",
    postedDate: "2026-06-19",
    scores: [23, 22, 19, 14, 9, 5],
    blocker: "None",
    fit: "Strong overlap in prototypes-to-production, agent systems, API integration, evaluation/observability, deployment, and customer engineering.",
    gaps: "Strengthen RAG, cloud architecture, and open-source agent framework evidence beyond provider orchestration.",
    cvAngle: "Emphasize VLM workflow state, retries/fallbacks, eval hooks, reproducible traces, API integration, and deployment handoff.",
    keywords: "Forward deployed; agents; RAG; cloud architecture; evaluation; observability; APIs; production deployment",
    workMode: "Customer environments; Singapore",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.jobstreet.com/job/92785033",
    notes: "High-value FDE target. Tailor the opening summary away from camera-only language toward AI application delivery."
  },
  {
    rank: 7,
    company: "Arize AI",
    role: "Forward Deployed Engineer, APJ",
    track: "FDE / Solutions",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "1 month ago",
    postedDate: "2026-06-11",
    scores: [23, 21, 19, 14, 9, 5],
    blocker: "None",
    fit: "Excellent alignment with evaluation, observability, failure analysis, reproducible traces, custom integrations, and concurrent customer delivery.",
    gaps: "Add public evidence for GenAI observability tooling, cloud platforms, Kubernetes, and enterprise stakeholder communication.",
    cvAngle: "Lead with visual-quality evaluation translated into measurable gates, plus VLM provider comparison, structured outputs, and reproducible traces.",
    keywords: "AI observability; evaluation; GenAI; integrations; MLOps; Python; Docker; Kubernetes; customer delivery",
    workMode: "Remote-first; Singapore-based",
    travel: "Customer engagements; amount not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/forward-deployed-engineer-apj-at-arize-ai-4413058587",
    notes: "Top FDE target because your evaluation discipline is more differentiated here than generic agent-building claims."
  },
  {
    rank: 8,
    company: "Cohere",
    role: "Forward Deployed Engineer, Agentic Platform",
    track: "FDE / Solutions",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Active page",
    postedAge: "2 days ago (relisted)",
    postedDate: "2026-07-09",
    scores: [23, 21, 18, 14, 10, 4],
    blocker: "None",
    fit: "Good match for Python, agent workflows, customer delivery, deployment, structured outputs, fast iteration, and production ownership.",
    gaps: "Need stronger RAG, private-cloud/on-prem, full-stack, and production agent evidence; listing detail URL may be a relisted legacy page.",
    cvAngle: "Use the FDE version with multimodal orchestration, provider comparison, deployment services, technical discovery, and reusable handoff patterns.",
    keywords: "Agentic platform; Python; RAG; private cloud; on-prem; customer engineering; deployment; production agents",
    workMode: "Remote-flexible; customer deployments",
    travel: "20-40%",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/forward-deployed-engineer-agentic-platform-at-cohere-4319226743",
    notes: "Apply early. Verify the refreshed listing in LinkedIn before spending time on a deep cover note."
  },
  {
    rank: 9,
    company: "Google Cloud",
    role: "Forward Deployed Engineer III, Applied AI",
    track: "FDE / Solutions",
    location: "Singapore",
    source: "Jobstreet",
    sourceStatus: "Apply visible",
    postedAge: "11 days ago",
    postedDate: "2026-06-30",
    scores: [24, 20, 18, 12, 10, 4],
    blocker: "None",
    fit: "Strong match for prototypes-to-production, agent evaluation, APIs, customer engineering, failure tracing, and reusable field patterns.",
    gaps: "Role asks for 5 years, full-stack enterprise delivery, cloud architecture, and Terraform. These must be addressed directly.",
    cvAngle: "Position 4+ years as end-to-end deployment ownership; foreground eval pipelines, API services, customer issue triage, and maintainable handoff.",
    keywords: "Applied AI; conversational AI; multi-agent; MCP; evaluation; observability; Terraform; cloud; enterprise integration",
    workMode: "Singapore / customer sites",
    travel: "Up to 50%",
    salary: "Not disclosed",
    url: "https://sg.jobstreet.com/job/93012543",
    notes: "High-upside stretch within reach. Add one public cloud/IaC project before interview if possible."
  },
  {
    rank: 10,
    company: "OpenAI",
    role: "Forward Deployed Engineer - Singapore",
    track: "FDE / Solutions",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "1 day ago",
    postedDate: "2026-07-10",
    scores: [24, 20, 19, 11, 10, 4],
    blocker: "None",
    fit: "Strong conceptual match for discovery, scoping, build, rollout, eval-driven feedback, reusable playbooks, and customer-side ownership.",
    gaps: "Role requests 5+ years, strong customer-facing delivery, and full-stack production systems. Competition is exceptionally high.",
    cvAngle: "Use a concise FDE narrative: customer problem -> prototype -> deployed workflow -> evaluation -> reusable handoff. Avoid leading with tool lists.",
    keywords: "Forward deployed; frontier models; production rollout; customer engineering; evals; full stack; adoption; playbooks",
    workMode: "Hybrid, 3 days/week office",
    travel: "50%",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/forward-deployed-engineer-singapore-at-openai-4417178064",
    notes: "Apply, but treat it as a high-upside stretch. A referral and one public end-to-end agent example materially improve odds."
  },
  {
    rank: 11,
    company: "FieldAI",
    role: "Forward Deployed Engineer - Singapore",
    track: "FDE / Physical AI",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "10 hours ago",
    postedDate: "2026-07-11",
    scores: [23, 20, 19, 13, 9, 4],
    blocker: "None",
    fit: "Good fit for field deployment, edge constraints, real-world debugging, integration, customer ownership, and camera/vision systems.",
    gaps: "Robotics integration, sensors, autonomy stacks, and field hardware operations are not yet explicit in the CV.",
    cvAngle: "Lead with on-device camera AI, device debugging, runtime integration, state machines, fallbacks, real-device validation, and customer issues.",
    keywords: "Physical AI; field deployment; robotics; edge systems; integration; reliability; customer operations; computer vision",
    workMode: "On-site, Singapore",
    travel: "Field/customer deployments expected",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/forward-deployed-engineer-singapore-at-fieldai-4368422077",
    notes: "Strong pivot into Physical AI if you want more field/robotics exposure."
  },
  {
    rank: 12,
    company: "Hiverlab",
    role: "Forward Deployed Engineer",
    track: "FDE / Physical AI",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Active page",
    postedAge: "3 weeks ago",
    postedDate: "2026-06-20",
    scores: [22, 20, 19, 14, 7, 4],
    blocker: "None",
    fit: "Good overlap in AI deployment, customer embedding, troubleshooting, APIs, data pipelines, model tuning, and real-world systems.",
    gaps: "Digital twin and IoT experience is not explicit; cloud platform evidence should be stronger.",
    cvAngle: "Emphasize production camera workflows, customer-found issues, cross-system integration, deployment debugging, and field-to-product feedback.",
    keywords: "Forward deployed; digital twin; AI deployment; APIs; data pipelines; cloud; IoT; customer troubleshooting",
    workMode: "Customer-embedded / Singapore",
    travel: "Customer-site work expected",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/forward-deployed-engineer-at-hiverlab-4399151236",
    notes: "Good practical transition role; verify active status before tailoring."
  },
  {
    rank: 13,
    company: "Databricks",
    role: "AI Engineer - FDE",
    track: "FDE / Solutions",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Active page",
    postedAge: "3 weeks ago",
    postedDate: "2026-06-20",
    scores: [22, 19, 18, 12, 10, 4],
    blocker: "None",
    fit: "Good match for production AI deployment, evaluation, PyTorch, customer advising, and communicating technical trade-offs.",
    gaps: "GenAI depth, RAG/multi-agent examples, public cloud, Spark, MLflow, and Databricks platform experience are weaker.",
    cvAngle: "Frame the reusable model-to-deployment foundation as platform thinking; add agent evaluation and service deployment evidence.",
    keywords: "AI FDE; GenAI; RAG; multi-agent; LLMOps; PyTorch; cloud; Spark; MLflow; customer advisor",
    workMode: "Singapore",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/ai-engineer-fde-forward-deployed-engineer-at-databricks-4401292515",
    notes: "Targeted application. Best improved by a small public RAG/agent evaluation repo and cloud deployment proof."
  },
  {
    rank: 14,
    company: "TikTok",
    role: "Machine Learning Engineer, Multimodal - Intelligent Integrity",
    track: "Multimodal / Applied AI",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "3 days ago",
    postedDate: "2026-07-08",
    scores: [22, 20, 17, 14, 10, 2],
    blocker: "None",
    fit: "Good overlap in CV/VLM workflows, Python/C++, inference deployment, structured reasoning traces, evaluation, and production implementation.",
    gaps: "Role favors multimodal model training/fine-tuning, content understanding, and top-tier publications; current paper is domain peer-reviewed, not a top CS venue.",
    cvAngle: "Lead with VLM composition workflows and deployment; include the Automation in Construction paper accurately and do not overstate publication tier.",
    keywords: "MLLM; VLM; multimodal fusion; agents; content understanding; PyTorch; Python; C++; inference deployment",
    workMode: "Singapore office",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/machine-learning-engineer-multimodal-intelligent-integrity-at-tiktok-4435790993",
    notes: "Worth a targeted application, but the interview will likely test modeling depth beyond orchestration."
  },
  {
    rank: 15,
    company: "LionsBot",
    role: "Perception Engineer",
    track: "Computer Vision / Robotics",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "6 days ago",
    postedDate: "2026-07-05",
    scores: [21, 20, 17, 15, 7, 5],
    blocker: "None",
    fit: "Good overlap in detection, tracking, segmentation, C++/Python/Linux, deployment, testing, and technical ownership.",
    gaps: "ROS, LiDAR/RGBD, point clouds, calibration, SLAM, and 3D perception need evidence or fast upskilling.",
    cvAngle: "Lead with detection plus optical-flow tracking, state machines, on-device C++, edge deployment, and robust failure handling.",
    keywords: "Perception; robotics; C++; Python; Linux; detection; tracking; segmentation; ROS; LiDAR; RGBD",
    workMode: "On-site, Changi",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/perception-engineer-at-lionsbot-international-4405211465",
    notes: "Good entry into robotics; prepare one ROS2 + RGBD mini-project before interview."
  },
  {
    rank: 16,
    company: "Rapsodo",
    role: "Senior Computer Vision Engineer",
    track: "Computer Vision / Edge",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "4 days ago",
    postedDate: "2026-07-07",
    scores: [24, 23, 19, 8, 8, 4],
    blocker: "None",
    fit: "Strong technical overlap in segmentation, deep learning, edge optimization, model compression, C/C++, Python, and real-time vision.",
    gaps: "Role asks for 6-8+ years, 3D vision, stereo calibration, and strong geometric CV. Seniority and 3D depth are real gaps.",
    cvAngle: "Lead with edge optimization and C++ runtime delivery; mention monocular depth but distinguish it from stereo/3D reconstruction.",
    keywords: "Computer vision; 3D vision; camera calibration; segmentation; embedded AI; C++; Python; quantization; model compression",
    workMode: "Singapore office",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/senior-computer-vision-engineer-at-rapsodo-4432206528",
    notes: "Technically attractive but seniority-heavy. Apply only with a concise note acknowledging the 3D learning path."
  },
  {
    rank: 17,
    company: "PERSOL APAC (client confidential)",
    role: "AI Inference & Compression Engineer",
    track: "ML Systems / Inference",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "3 weeks ago",
    postedDate: "2026-06-20",
    scores: [21, 22, 18, 11, 8, 4],
    blocker: "None",
    fit: "Good overlap in quantization, inference optimization, computational photography, optical flow, visual quality, Python/C++, and hardware-aware deployment.",
    gaps: "Advanced video codecs, vLLM/KV-cache optimization, CUDA/SIMD depth, and PhD-preferred research profile are weaker.",
    cvAngle: "Lead with QAT/PTQ, INT8/FP16 validation, TensorRT, optical flow, image quality evaluation, ISP-adjacent rendering, and C++ integration.",
    keywords: "Inference; compression; quantization; TensorRT; vLLM; optical flow; video coding; C++; Python; visual quality",
    workMode: "Singapore",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/ai-inference-compression-engineer-at-persol-apac-4419281500",
    notes: "Strong technical stretch. Apply if you want deeper ML systems and performance work."
  },
  {
    rank: 18,
    company: "Patsnap",
    role: "Forward Deployed Engineer (FDE)",
    track: "FDE / Solutions",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "2 days ago",
    postedDate: "2026-07-09",
    scores: [21, 18, 17, 15, 8, 5],
    blocker: "None",
    fit: "Good match for discovery, prototypes, AI agent workflows, customer delivery, product feedback, documentation, and measurable outcomes.",
    gaps: "IP/R&D intelligence and no-code/low-code product configuration are new domains; less use of your CV depth.",
    cvAngle: "Use the FDE version and lead with converting ambiguous feedback into deployable workflows, evaluation gates, and reusable capabilities.",
    keywords: "Forward deployed; AI agents; workflow orchestration; prototypes; customer delivery; product feedback; R&D intelligence",
    workMode: "Singapore",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/forward-deployed-engineer-fde-at-patsnap-4434222886",
    notes: "Good probability role, but assess whether the product-configuration balance is technically deep enough for your goals."
  },
  {
    rank: 19,
    company: "Accenture Southeast Asia",
    role: "Forward Deployed AI Engineer",
    track: "FDE / Solutions",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "1 day ago",
    postedDate: "2026-07-10",
    scores: [21, 19, 17, 14, 8, 5],
    blocker: "None",
    fit: "Good overlap in agentic systems, reusable patterns, guardrails, delivery ownership, and technical communication.",
    gaps: "Public-sector delivery, defense/security policy, vector databases, RAG, and enterprise governance need stronger evidence.",
    cvAngle: "Lead with structured multimodal agents, retry/fallback logic, evaluation hooks, production handoff, and acceptance criteria.",
    keywords: "Agentic AI; public sector; guardrails; governance; RAG; vector database; reusable patterns; client delivery",
    workMode: "Client-facing, Singapore",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/forward-deployed-ai-engineer-at-accenture-southeast-asia-4435063232",
    notes: "Good FDE title signal; likely process-heavy. Tailor for governance and reusable delivery patterns."
  },
  {
    rank: 20,
    company: "Partners Group",
    role: "Forward Deployed Engineer (AI Engineer)",
    track: "FDE / Solutions",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "1 week ago",
    postedDate: "2026-07-04",
    scores: [22, 19, 17, 12, 9, 4],
    blocker: "None",
    fit: "Good match for end-to-end AI product delivery, evaluation cycles, reusable components, Python, APIs, governance, and value gates.",
    gaps: "Financial industry, AWS certification, databases/data platforms, RAG, and 5+ years are notable requirements.",
    cvAngle: "Emphasize measurable acceptance gates, cross-functional delivery, reusable patterns, and sensitive customer issue handling.",
    keywords: "AI products; RAG; evaluation; governance; ROI; Python; APIs; AWS; databases; financial services",
    workMode: "Singapore",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/forward-deployed-engineer-ai-engineer-at-partners-group-4433597613",
    notes: "Targeted stretch. Do not spend time on AWS certification before applying; prepare a credible cloud learning plan."
  },
  {
    rank: 21,
    company: "PhysicsX",
    role: "Forward Deployed Software Engineer",
    track: "FDE / Physical AI",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "1 week ago",
    postedDate: "2026-07-04",
    scores: [20, 18, 18, 14, 9, 4],
    blocker: "None",
    fit: "Good fit for model-to-application delivery, customer problem solving, APIs, production deployment, high ownership, and advanced engineering domains.",
    gaps: "Physics simulation, full-stack applications, numerical engineering, and heavy international travel are new dimensions.",
    cvAngle: "Lead with converting ML outputs into controllable visual systems and customer-ready services; stress fast domain learning and production handoff.",
    keywords: "Forward deployed software; physics AI; simulation; APIs; production applications; customer delivery; full stack",
    workMode: "Singapore + customer sites",
    travel: "3-4 weeks per quarter",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/forward-deployed-software-engineer-at-physicsx-4410964392",
    notes: "Good role if you are comfortable with frequent travel and broad software work beyond ML."
  },
  {
    rank: 22,
    company: "Resaro",
    role: "Senior Solutions Architect - Computer Vision & Embodied AI",
    track: "Solutions Architecture",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "2 weeks ago",
    postedDate: "2026-06-27",
    scores: [22, 21, 17, 9, 9, 4],
    blocker: "None",
    fit: "Strong subject overlap in CV assurance, evaluation strategy, technical scoping, customer workshops, and delivery handoff.",
    gaps: "Role requests 5-10 years plus embodied AI/robotics, presales, autonomy validation, ROS/simulation, and defense/government exposure.",
    cvAngle: "Use technical leadership lines and evaluation gates; present as an architect-in-development, not an established robotics solutions architect.",
    keywords: "Solutions architect; computer vision; embodied AI; assurance; V&V; presales; robotics; customer workshops",
    workMode: "Embedded/on-site customer work",
    travel: "Customer engagements expected",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/solutions-architect-at-resaro-4425415433",
    notes: "Apply only if the FDE role is also considered; the FDE opening is the cleaner level fit."
  },
  {
    rank: 23,
    company: "Xinference",
    role: "AI Solutions Engineer (Forward Deployment Engineer)",
    track: "FDE / Solutions",
    location: "Singapore / Remote",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "2 weeks ago",
    postedDate: "2026-06-27",
    scores: [19, 18, 17, 15, 8, 4],
    blocker: "None",
    fit: "Relevant inference/deployment background, Python, product demos, technical evaluation plans, customer issues, and product feedback.",
    gaps: "Role is closer to sales engineering; direct presales, CRM, competitive positioning, and public presentation evidence is limited.",
    cvAngle: "Lead with inference stack breadth, model deployment trade-offs, reproducible demos, reference documentation, and customer technical debugging.",
    keywords: "Solutions engineering; model inference; customer evaluation; demos; DevOps; Python; technical sales; product feedback",
    workMode: "Fully remote; Singapore/SEA coverage",
    travel: "Up to 45%",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/ai-solutions-engineer-forward-deployment-engineer-at-xinference-4424515251",
    notes: "Good option if you want a more commercial/customer-facing path. Clarify quota and presales expectations."
  },
  {
    rank: 24,
    company: "UC Tech",
    role: "Forward Deployed Engineer (FDE)",
    track: "FDE / Solutions",
    location: "Lavender, Singapore",
    source: "Jobstreet",
    sourceStatus: "Apply visible",
    postedAge: "16 days ago",
    postedDate: "2026-06-25",
    scores: [20, 18, 17, 14, 6, 5],
    blocker: "None",
    fit: "Good match for client discovery, solution design, prototyping, cloud/on-prem integration, APIs, deployment, and handoff.",
    gaps: "Distributed systems, full-stack web/mobile, enterprise cloud, CI/CD, and Kubernetes need stronger evidence.",
    cvAngle: "Position the model-to-runtime path as full-cycle systems delivery, with API services, C++/Android integration, and reusable documentation.",
    keywords: "FDE; solution architecture; APIs; microservices; cloud; on-prem; CI/CD; Docker; Kubernetes; stakeholder management",
    workMode: "Singapore; client environments",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.jobstreet.com/job/92928070",
    notes: "Likely a practical interview opportunity. Validate project quality and engineering depth during screening."
  },
  {
    rank: 25,
    company: "Salesforce",
    role: "Forward Deployed Engineer - Singapore",
    track: "FDE / Solutions",
    location: "Singapore",
    source: "Company careers",
    sourceStatus: "Apply visible",
    postedAge: "3 days ago",
    postedDate: "2026-07-08",
    scores: [20, 17, 18, 11, 10, 3],
    blocker: "None",
    fit: "Good conceptual fit for end-to-end AI delivery, rapid prototypes, debugging, customer partnership, and agent workflows.",
    gaps: "Salesforce platform, Agentforce, Apex, Data Cloud, enterprise data platforms, and 60% travel are major gaps/constraints.",
    cvAngle: "Lead with agent workflow delivery and production troubleshooting; explicitly frame Salesforce skills as a rapid ramp area.",
    keywords: "Forward deployed; Agentforce; Salesforce; Apex; Data Cloud; LLM agents; enterprise integration; technical delivery",
    workMode: "Office-flexible, Singapore",
    travel: "Up to 60%",
    salary: "Not disclosed",
    url: "https://salesforce.wd12.myworkdayjobs.com/External_Career_Site/job/Singapore---Singapore/Forward-Deployed-Engineer---Singapore_JR349138",
    notes: "High brand upside but platform-specific. Apply only if the Salesforce ecosystem is acceptable to your long-term direction."
  },
  {
    rank: 26,
    company: "HappyRobot",
    role: "Forward Deployed Engineer",
    track: "FDE / Solutions",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "1 week ago",
    postedDate: "2026-07-04",
    scores: [19, 17, 16, 14, 9, 4],
    blocker: "None",
    fit: "Relevant customer ownership, Python, AI workflows, APIs, rapid iteration, and production problem solving.",
    gaps: "React, TypeScript, Node.js, voice/transcriber systems, and strong full-stack delivery are explicit must-haves.",
    cvAngle: "Use the FDE version and include FastAPI/services plus agent workflows; do not hide the front-end gap.",
    keywords: "Forward deployed; full stack; React; TypeScript; Node.js; Python; voice AI; APIs; customer onboarding",
    workMode: "Singapore",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/forward-deployed-engineer-at-happyrobot-4412677971",
    notes: "Apply as a stretch only if willing to ramp quickly on TypeScript/React."
  },
  {
    rank: 27,
    company: "Woh Hup Group",
    role: "AI Solutions Engineer",
    track: "Multimodal / Applied AI",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "2 weeks ago",
    postedDate: "2026-06-27",
    scores: [20, 17, 16, 15, 6, 5],
    blocker: "None",
    fit: "Good match for pragmatic LLM workflows, APIs, prototypes, stakeholder discovery, integration, evaluation, deployment, and handoff.",
    gaps: "Role may be less technically deep; Azure AI and construction operations are not current strengths.",
    cvAngle: "Lead with NUS construction CV research, stakeholder translation, structured LLM/VLM workflows, and maintainable handoff.",
    keywords: "AI solutions; LLM; prompt engineering; workflow automation; APIs; Azure AI; stakeholder discovery; construction",
    workMode: "Singapore",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/ai-solutions-engineer-at-woh-hup-group-4418951516",
    notes: "Good probability role and coherent with prior construction research; check compensation and technical ownership."
  },
  {
    rank: 28,
    company: "Chalk",
    role: "Forward Deployed Engineer",
    track: "FDE / ML Infrastructure",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "3 hours ago",
    postedDate: "2026-07-11",
    scores: [18, 17, 15, 14, 9, 4],
    blocker: "None",
    fit: "Relevant customer engineering, ML products, Python, requirements gathering, production debugging, and technical communication.",
    gaps: "Backend/data infrastructure, SQL, feature pipelines, recommendation/fraud domains, and 4+ years backend SWE are weak matches.",
    cvAngle: "Frame the reusable training-to-deployment foundation as ML platform work; add Python tooling and data/evaluation infrastructure.",
    keywords: "Forward deployed; ML infrastructure; feature pipelines; Python; SQL; backend; customer engineering; MLOps",
    workMode: "In-person, Singapore",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/forward-deployed-engineer-at-chalk-4406571080",
    notes: "Fresh listing but a weaker domain match. Apply only after higher-priority roles."
  },
  {
    rank: 29,
    company: "NVIDIA",
    role: "Solutions Architect, GenAI",
    track: "Solutions Architecture",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "1 week ago",
    postedDate: "2026-07-04",
    scores: [19, 17, 16, 5, 10, 3],
    blocker: "None",
    fit: "Relevant GPU inference, TensorRT, Docker, model deployment, technical trade-offs, and customer-facing architecture direction.",
    gaps: "Requires 8+ years, LLM training at scale, NeMo/Megatron, distributed GPU infrastructure, workshops, and Mandarin preference.",
    cvAngle: "Lead with TensorRT, quantization, GPU rendering/services, and deployment debugging; treat as a long-shot stretch.",
    keywords: "Solutions architect; GenAI; NVIDIA; NeMo; Megatron; GPU; distributed training; TensorRT; workshops",
    workMode: "Singapore / regional customers",
    travel: "Up to 30%",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/solutions-architect-genai-at-nvidia-4407657199",
    notes: "Apply only with referral or strong hiring-manager interest. Better used as a skills roadmap than a core funnel role."
  },
  {
    rank: 30,
    company: "Phridom AI",
    role: "Perception Engineer",
    track: "Computer Vision / Robotics",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Verify",
    postedAge: "4 months ago",
    postedDate: "2026-03-11",
    scores: [22, 21, 18, 14, 7, 4],
    blocker: "None",
    fit: "Strong match for robust CV pipelines, temporal consistency, segmentation/tracking, edge cases, production quality, and subsystem ownership.",
    gaps: "Robotics, multi-view perception, simulation, and embodied systems are not explicit; listing age requires verification.",
    cvAngle: "Lead with tracking, state machines, long-tail visual failures, runtime fallbacks, and downstream-consumable model outputs.",
    keywords: "Perception; temporal consistency; tracking; segmentation; multi-view; robotics; edge cases; production vision",
    workMode: "Singapore",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/perception-engineer-at-phridom-ai-4380682921",
    notes: "Excellent content fit but stale. Contact the company/recruiter before tailoring."
  },
  {
    rank: 31,
    company: "Unblink",
    role: "Forward Deployed Engineer (AI Vision)",
    track: "FDE / Physical AI",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Verify",
    postedAge: "3 months ago",
    postedDate: "2026-04-11",
    scores: [25, 24, 20, 15, 7, 4],
    blocker: "None",
    fit: "Almost exact domain match: customer sites, cameras, edge devices, Linux/networking, Docker, CV/VLM methods, deployment reliability, and field feedback.",
    gaps: "Networking, camera protocols, hardware provisioning, and TypeScript/Rust/Go are less evidenced; listing age requires verification.",
    cvAngle: "Use the strongest camera AI and edge deployment bullets, plus device debugging, Docker, model serving, failure analysis, and handoff.",
    keywords: "AI vision; forward deployed; cameras; edge devices; Linux; networking; Docker; VLM; field deployment",
    workMode: "On-site factories / field deployments",
    travel: "Required",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/forward-deployed-engineer-at-unblink-4388790693",
    notes: "Highest content fit in the list, but verify that hiring is still open before investing in tailoring."
  },
  {
    rank: 32,
    company: "Infinium Robotics",
    role: "Computer Vision Engineer",
    track: "Computer Vision / Robotics",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Verify",
    postedAge: "3 months ago",
    postedDate: "2026-04-11",
    scores: [20, 18, 15, 15, 6, 4],
    blocker: "None",
    fit: "Good baseline match in Python/C++, CV algorithms, robotics integration, experiments, and real-world systems.",
    gaps: "Role description is broad and likely less senior; robotics platform depth is not shown; listing age requires verification.",
    cvAngle: "Lead with production CV deployment and integration, not research-only work; ask about scope and seniority before applying.",
    keywords: "Computer vision; robotics; Python; C++; autonomous systems; integration; experiments; deployment",
    workMode: "On-site, Singapore",
    travel: "Not stated",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/computer-vision-engineer-at-infinium-robotics-4382846509",
    notes: "Use as a backup only after confirming current scope, level, and compensation."
  },
  {
    rank: 33,
    company: "Innowave Tech",
    role: "Forward Deployment Engineer - Industrial AI",
    track: "FDE / Physical AI",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "13 hours ago",
    postedDate: "2026-07-10",
    scores: [24, 22, 20, 15, 7, 2],
    blocker: "Confirm SG work authorization; role states no work pass or visa sponsorship",
    fit: "Strong match for industrial CV, edge/cloud deployment, customer integration, validation, optimization, issue diagnosis, and reusable deployment frameworks.",
    gaps: "Work authorization may block; semiconductor manufacturing domain and equipment data are not explicit.",
    cvAngle: "Lead with production camera AI, device-side deployment, customer issue triage, validation gates, and Mandarin cross-team communication if applicable.",
    keywords: "Industrial AI; semiconductor; forward deployment; edge/cloud; integration; validation; customer-facing; manufacturing",
    workMode: "Hybrid/on-site",
    travel: "Regional travel required",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/forward-deployment-engineer-industrial-ai-at-innowave-tech-pte-ltd-4431944809",
    notes: "Technically one of the best fits. Check work authorization before any tailoring."
  },
  {
    rank: 34,
    company: "Rebellions",
    role: "[Singapore] Forward Deployed Engineer",
    track: "FDE / ML Infrastructure",
    location: "Singapore",
    source: "LinkedIn",
    sourceStatus: "Apply visible",
    postedAge: "5 days ago",
    postedDate: "2026-07-06",
    scores: [22, 21, 19, 14, 9, 1],
    blocker: "Singapore Citizens only",
    fit: "Strong technical overlap in inference deployment, PyTorch, vision pipelines, quantization, benchmarking, customer troubleshooting, and documentation.",
    gaps: "Citizenship is a hard gate; Kubernetes-based LLM serving, vLLM/Dynamo, GPU networking, and presales demos need depth.",
    cvAngle: "If eligible, lead with inference optimization, model export/quantization, deployment debugging, visual workloads, and technical documentation.",
    keywords: "AI inference; NPU; PyTorch; vLLM; Kubernetes; benchmarking; quantization; solutions engineering; hardware acceleration",
    workMode: "Singapore / regional customers",
    travel: "Regional customer work expected",
    salary: "Not disclosed",
    url: "https://sg.linkedin.com/jobs/view/singapore-forward-deployed-engineer-at-rebellions-4433557332",
    notes: "Do not apply unless the citizenship requirement is met."
  }
];

const workbook = Workbook.create();
const dashboard = workbook.worksheets.add("Dashboard");
const pipeline = workbook.worksheets.add("Job Pipeline");
const guide = workbook.worksheets.add("Scoring Guide");

const colors = {
  ink: "#17212B",
  text: "#26323D",
  muted: "#5F6B76",
  line: "#D7DEE5",
  panel: "#F4F6F8",
  white: "#FFFFFF",
  green: "#0F766E",
  greenSoft: "#DDF3EF",
  blue: "#2563EB",
  blueSoft: "#E7EEFF",
  amber: "#B45309",
  amberSoft: "#FEF1D6",
  red: "#B42318",
  redSoft: "#FDE7E4",
  graySoft: "#ECEFF2"
};

const baseFont = { name: "Aptos", size: 10, color: colors.text };
const headerFont = { name: "Aptos", size: 10, bold: true, color: colors.white };

dashboard.showGridLines = false;
pipeline.showGridLines = false;
guide.showGridLines = false;

// Job pipeline
const headers = [
  "Practical Rank", "Company", "Role", "Track", "Location", "Source", "Source Status", "Posted Age",
  "Estimated Posted Date", "Role Alignment /25", "Evidence Match /25", "Deployment Overlap /20",
  "Seniority Fit /15", "Market Upside /10", "Access /5", "Match Score", "Recommendation",
  "Hard Blocker", "Why It Fits", "Main Gaps", "CV Angle", "ATS Keywords", "Work Mode", "Travel",
  "Salary (SGD/month)", "Job URL", "Checked Date", "Application Status", "Applied Date",
  "Next Action Date", "Contact / Referral", "Notes"
];

const rows = jobs.map((job) => [
  job.rank,
  job.company,
  job.role,
  job.track,
  job.location,
  job.source,
  job.sourceStatus,
  job.postedAge,
  new Date(`${job.postedDate}T00:00:00`),
  ...job.scores,
  null,
  null,
  job.blocker,
  job.fit,
  job.gaps,
  job.cvAngle,
  job.keywords,
  job.workMode,
  job.travel,
  job.salary,
  job.url,
  checkedDate,
  job.blocker === "None" ? "Not started" : "Hold",
  null,
  null,
  "",
  job.notes
]);

pipeline.getRange(`A1:AF${jobs.length + 1}`).values = [headers, ...rows];
pipeline.getRange("P2").formulas = [["=SUM(J2:O2)"]];
pipeline.getRange(`P2:P${jobs.length + 1}`).fillDown();
pipeline.getRange("Q2").formulas = [[
  '=IF(G2="Closed","Closed",IF(G2="Verify","Watchlist",IF(R2<>"None","Blocked / verify",IF(P2>=88,"Apply now",IF(P2>=80,"Targeted",IF(P2>=70,"Stretch","Skip"))))))'
]];
pipeline.getRange(`Q2:Q${jobs.length + 1}`).fillDown();

const pipelineTable = pipeline.tables.add(`A1:AF${jobs.length + 1}`, true, "JobPipelineTable");
pipelineTable.style = "TableStyleMedium2";
pipelineTable.showBandedRows = true;
pipelineTable.showFilterButton = true;

pipeline.getRange(`A1:AF${jobs.length + 1}`).format.font = baseFont;
pipeline.getRange("A1:AF1").format = {
  fill: colors.ink,
  font: headerFont,
  wrapText: true,
  verticalAlignment: "center",
  borders: { bottom: { style: "medium", color: colors.green } }
};
pipeline.getRange("A1:AF1").format.rowHeight = 34;
pipeline.getRange(`A2:AF${jobs.length + 1}`).format.verticalAlignment = "top";
pipeline.getRange(`A2:AF${jobs.length + 1}`).format.borders = {
  insideHorizontal: { style: "thin", color: colors.line }
};
pipeline.getRange(`I2:I${jobs.length + 1}`).format.numberFormat = "yyyy-mm-dd";
pipeline.getRange(`AA2:AA${jobs.length + 1}`).format.numberFormat = "yyyy-mm-dd";
pipeline.getRange(`AC2:AD${jobs.length + 1}`).format.numberFormat = "yyyy-mm-dd";
pipeline.getRange(`J2:P${jobs.length + 1}`).format.numberFormat = "0";
pipeline.getRange(`A2:A${jobs.length + 1}`).format.horizontalAlignment = "center";
pipeline.getRange(`F2:Q${jobs.length + 1}`).format.horizontalAlignment = "center";
pipeline.getRange(`S2:V${jobs.length + 1}`).format.wrapText = true;
pipeline.getRange(`W2:Y${jobs.length + 1}`).format.wrapText = true;
pipeline.getRange(`Z2:Z${jobs.length + 1}`).format = {
  font: { name: "Aptos", size: 9, color: colors.blue, underline: true },
  wrapText: true
};
pipeline.getRange(`AF2:AF${jobs.length + 1}`).format.wrapText = true;
pipeline.getRange(`A2:AF${jobs.length + 1}`).format.rowHeight = 54;

const widths = [
  ["A1:A35", 12], ["B1:B35", 22], ["C1:C35", 32], ["D1:D35", 22], ["E1:E35", 18],
  ["F1:F35", 14], ["G1:G35", 16], ["H1:H35", 18], ["I1:I35", 17], ["J1:O35", 15],
  ["P1:P35", 12], ["Q1:Q35", 17], ["R1:R35", 26], ["S1:S35", 46], ["T1:T35", 44],
  ["U1:U35", 46], ["V1:V35", 48], ["W1:W35", 24], ["X1:X35", 20], ["Y1:Y35", 20],
  ["Z1:Z35", 50], ["AA1:AA35", 14], ["AB1:AB35", 18], ["AC1:AD35", 16], ["AE1:AE35", 22],
  ["AF1:AF35", 40]
];
for (const [range, width] of widths) pipeline.getRange(range).format.columnWidth = width;

pipeline.freezePanes.freezeRows(1);
pipeline.freezePanes.freezeColumns(3);

pipeline.getRange(`AB2:AB${jobs.length + 1}`).dataValidation = {
  rule: {
    type: "list",
    values: ["Not started", "Tailoring", "Applied", "Recruiter screen", "Interview", "Offer", "Rejected", "Withdrawn", "Hold"]
  }
};

const recommendationRange = pipeline.getRange(`Q2:Q${jobs.length + 1}`);
recommendationRange.conditionalFormats.add("containsText", { text: "Apply now", format: { fill: colors.greenSoft, font: { bold: true, color: colors.green } } });
recommendationRange.conditionalFormats.add("containsText", { text: "Targeted", format: { fill: colors.blueSoft, font: { bold: true, color: colors.blue } } });
recommendationRange.conditionalFormats.add("containsText", { text: "Stretch", format: { fill: colors.amberSoft, font: { bold: true, color: colors.amber } } });
recommendationRange.conditionalFormats.add("containsText", { text: "Watchlist", format: { fill: colors.graySoft, font: { bold: true, color: colors.muted } } });
recommendationRange.conditionalFormats.add("containsText", { text: "Blocked", format: { fill: colors.redSoft, font: { bold: true, color: colors.red } } });
pipeline.getRange(`P2:P${jobs.length + 1}`).conditionalFormats.add("dataBar", { color: colors.green, gradient: true });
pipeline.getRange(`G2:G${jobs.length + 1}`).conditionalFormats.add("containsText", { text: "Verify", format: { fill: colors.amberSoft, font: { bold: true, color: colors.amber } } });
pipeline.getRange(`R2:R${jobs.length + 1}`).conditionalFormats.add("notContainsText", { text: "None", format: { fill: colors.redSoft, font: { bold: true, color: colors.red } } });

// Dashboard
dashboard.getRange("A1:P2").merge();
dashboard.getRange("A1").values = [["Singapore AI Job Search - Junxian Wu"]];
dashboard.getRange("A1:P2").format = {
  fill: colors.ink,
  font: { name: "Aptos Display", size: 20, bold: true, color: colors.white },
  verticalAlignment: "center",
  horizontalAlignment: "left"
};
dashboard.getRange("A3:P3").merge();
dashboard.getRange("A3").values = [["Target: Forward-Deployed AI, Computer Vision / Edge, Multimodal AI, and ML Systems | Checked 2026-07-11"]];
dashboard.getRange("A3:P3").format = {
  fill: colors.green,
  font: { name: "Aptos", size: 10, bold: true, color: colors.white },
  verticalAlignment: "center"
};

const cards = [
  { labelRange: "A5:C5", valueRange: "A6:C7", label: "ROLES REVIEWED", formula: `=COUNTA('Job Pipeline'!$B$2:$B$${jobs.length + 1})`, fill: colors.panel, valueColor: colors.ink },
  { labelRange: "E5:G5", valueRange: "E6:G7", label: "APPLY NOW", formula: `=COUNTIF('Job Pipeline'!$Q$2:$Q$${jobs.length + 1},"Apply now")`, fill: colors.greenSoft, valueColor: colors.green },
  { labelRange: "I5:K5", valueRange: "I6:K7", label: "TARGETED", formula: `=COUNTIF('Job Pipeline'!$Q$2:$Q$${jobs.length + 1},"Targeted")`, fill: colors.blueSoft, valueColor: colors.blue },
  { labelRange: "M5:O5", valueRange: "M6:O7", label: "VERIFY / BLOCKED", formula: `=COUNTIF('Job Pipeline'!$Q$2:$Q$${jobs.length + 1},"Watchlist")+COUNTIF('Job Pipeline'!$Q$2:$Q$${jobs.length + 1},"Blocked / verify")`, fill: colors.amberSoft, valueColor: colors.amber }
];
for (const card of cards) {
  dashboard.getRange(card.labelRange).merge();
  dashboard.getRange(card.valueRange).merge();
  dashboard.getRange(card.labelRange).values = [[card.label]];
  dashboard.getRange(card.valueRange.split(":")[0]).formulas = [[card.formula]];
  dashboard.getRange(card.labelRange).format = {
    fill: card.fill,
    font: { name: "Aptos", size: 9, bold: true, color: colors.muted },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    borders: { top: { style: "thin", color: colors.line }, left: { style: "thin", color: colors.line }, right: { style: "thin", color: colors.line } }
  };
  dashboard.getRange(card.valueRange).format = {
    fill: card.fill,
    font: { name: "Aptos Display", size: 22, bold: true, color: card.valueColor },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    borders: { bottom: { style: "thin", color: colors.line }, left: { style: "thin", color: colors.line }, right: { style: "thin", color: colors.line } }
  };
}

dashboard.getRange("A10:H10").merge();
dashboard.getRange("A10").values = [["Top 10 practical application order"]];
dashboard.getRange("A10:H10").format = {
  fill: colors.ink,
  font: { name: "Aptos", size: 11, bold: true, color: colors.white },
  verticalAlignment: "center"
};
dashboard.getRange("A11:H11").values = [["Rank", "Company", "Role", "Track", "Score", "Recommendation", "Posted", "Status"]];
dashboard.getRange("A11:H11").format = {
  fill: colors.green,
  font: headerFont,
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true
};
const topFormulas = [];
for (let i = 0; i < 10; i += 1) {
  const sourceRow = i + 2;
  topFormulas.push([
    `='Job Pipeline'!A${sourceRow}`,
    `='Job Pipeline'!B${sourceRow}`,
    `='Job Pipeline'!C${sourceRow}`,
    `='Job Pipeline'!D${sourceRow}`,
    `='Job Pipeline'!P${sourceRow}`,
    `='Job Pipeline'!Q${sourceRow}`,
    `='Job Pipeline'!H${sourceRow}`,
    `='Job Pipeline'!G${sourceRow}`
  ]);
}
dashboard.getRange("A12:H21").formulas = topFormulas;
dashboard.getRange("A12:H21").format = {
  font: baseFont,
  verticalAlignment: "top",
  wrapText: true,
  borders: { insideHorizontal: { style: "thin", color: colors.line } }
};
dashboard.getRange("A12:A21").format.horizontalAlignment = "center";
dashboard.getRange("E12:F21").format.horizontalAlignment = "center";
dashboard.getRange("A12:H21").format.rowHeight = 34;
dashboard.getRange("E12:E21").conditionalFormats.add("dataBar", { color: colors.green, gradient: true });
dashboard.getRange("F12:F21").conditionalFormats.add("containsText", { text: "Apply now", format: { fill: colors.greenSoft, font: { bold: true, color: colors.green } } });
dashboard.getRange("F12:F21").conditionalFormats.add("containsText", { text: "Targeted", format: { fill: colors.blueSoft, font: { bold: true, color: colors.blue } } });

dashboard.getRange("J10:K10").values = [["Recommendation", "Count"]];
dashboard.getRange("J10:K10").format = { fill: colors.ink, font: headerFont };
const categories = ["Apply now", "Targeted", "Stretch", "Watchlist", "Blocked / verify"];
dashboard.getRange("J11:J15").values = categories.map((value) => [value]);
dashboard.getRange("K11").formulas = [[`=COUNTIF('Job Pipeline'!$Q$2:$Q$${jobs.length + 1},J11)`]];
dashboard.getRange("K11:K15").fillDown();
dashboard.getRange("J11:K15").format = {
  font: baseFont,
  borders: { insideHorizontal: { style: "thin", color: colors.line } }
};

const chart = dashboard.charts.add("bar", dashboard.getRange("J10:K15"));
chart.title = "Current application funnel";
chart.hasLegend = false;
chart.xAxis = { axisType: "textAxis", textStyle: { fontSize: 9 } };
chart.yAxis = { numberFormatCode: "0", min: 0 };
chart.setPosition("L10", "P22");

dashboard.getRange("A24:H24").merge();
dashboard.getRange("A24").values = [["Recommended application sequence"]];
dashboard.getRange("A24:H24").format = { fill: colors.ink, font: { name: "Aptos", size: 11, bold: true, color: colors.white } };
const actions = [
  "Week 1: Apply to ranks 1-10 with two CV variants: CV/Edge for Polybee, Dyson, Genesis; FDE/Applied AI for the rest.",
  "Week 2: Apply to ranks 11-21 after adding one public cloud-deployed agent/evaluation example and requesting referrals.",
  "For every application, replace the opening summary with the role's CV Angle and reuse the ATS Keywords naturally.",
  "Do not spend tailoring time on Watchlist or Blocked roles until status or eligibility is confirmed.",
  "Track the next action date after every application; follow up once after 5-7 business days when a recruiter/contact is known."
];
for (let i = 0; i < actions.length; i += 1) {
  const row = 25 + i;
  dashboard.getRange(`A${row}:H${row}`).merge();
  dashboard.getRange(`A${row}`).values = [[actions[i]]];
  dashboard.getRange(`A${row}:H${row}`).format = {
    fill: i % 2 === 0 ? colors.panel : colors.white,
    font: baseFont,
    wrapText: true,
    verticalAlignment: "center",
    borders: { bottom: { style: "thin", color: colors.line } }
  };
  dashboard.getRange(`A${row}:H${row}`).format.rowHeight = 36;
}

dashboard.getRange("J24:P24").merge();
dashboard.getRange("J24").values = [["Evidence gaps that affect screening"]];
dashboard.getRange("J24:P24").format = { fill: colors.ink, font: { name: "Aptos", size: 11, bold: true, color: colors.white } };
dashboard.getRange("J25:M25").values = [["Gap", "Priority", "Why", "Next evidence"]];
dashboard.getRange("J25:M25").format = { fill: colors.green, font: headerFont, wrapText: true };
dashboard.getRange("J26:M30").values = [
  ["Cloud + IaC", "High", "Google/OpenAI/Databricks expect production cloud architecture.", "Deploy one agent/eval service on AWS/GCP with Terraform and observability."],
  ["Customer-facing proof", "High", "FDE screening needs discovery, scoping, and stakeholder evidence.", "Write one public-safe case study as problem -> scope -> build -> acceptance -> handoff."],
  ["Agent/RAG depth", "High", "Many FDE roles require RAG, tool use, and production evals.", "Publish a small RAG/agent repo with traces, retries, eval set, and cost/latency notes."],
  ["3D/robotics", "Medium", "Needed for Rapsodo, LionsBot, FieldAI, and Phridom.", "Build a ROS2 + RGBD demo only if robotics becomes a committed track."],
  ["Quantified outcomes", "High", "Current sanitized CV is credible but light on measurable impact.", "Add public-safe ranges or before/after acceptance improvements where permitted."]
];
dashboard.getRange("J26:M30").format = {
  font: baseFont,
  wrapText: true,
  verticalAlignment: "top",
  borders: { insideHorizontal: { style: "thin", color: colors.line } }
};
dashboard.getRange("J26:M30").format.rowHeight = 44;
dashboard.getRange("K26:K30").conditionalFormats.add("containsText", { text: "High", format: { fill: colors.redSoft, font: { bold: true, color: colors.red } } });
dashboard.getRange("K26:K30").conditionalFormats.add("containsText", { text: "Medium", format: { fill: colors.amberSoft, font: { bold: true, color: colors.amber } } });

const dashboardWidths = [
  ["A1:A30", 7], ["B1:B30", 20], ["C1:C30", 31], ["D1:D30", 21], ["E1:E30", 10], ["F1:F30", 16],
  ["G1:G30", 16], ["H1:H30", 16], ["I1:I30", 4], ["J1:J30", 20], ["K1:K30", 12], ["L1:L30", 30],
  ["M1:M30", 38], ["N1:P30", 12]
];
for (const [range, width] of dashboardWidths) dashboard.getRange(range).format.columnWidth = width;
dashboard.getRange("A1:P2").format.font = { name: "Aptos Display", size: 20, bold: true, color: colors.white };
dashboard.freezePanes.freezeRows(3);

// Scoring guide
guide.getRange("A1:H2").merge();
guide.getRange("A1").values = [["Scoring and CV Tailoring Guide"]];
guide.getRange("A1:H2").format = {
  fill: colors.ink,
  font: { name: "Aptos Display", size: 18, bold: true, color: colors.white },
  verticalAlignment: "center"
};
guide.getRange("A3:H3").merge();
guide.getRange("A3").values = [["Scores use the sanitized CV: 4+ years, NUS MTech, CV/edge deployment, C++/Android, computational photography, evaluation loops, and multimodal workflows."]];
guide.getRange("A3:H3").format = { fill: colors.greenSoft, font: { name: "Aptos", size: 10, color: colors.green }, wrapText: true };

guide.getRange("A5:C5").values = [["Dimension", "Max", "What is being tested"]];
guide.getRange("A5:C5").format = { fill: colors.ink, font: headerFont };
guide.getRange("A6:C11").values = [
  ["Role alignment", 25, "Direction match: FDE, production CV/edge, multimodal, or ML systems."],
  ["Evidence match", 25, "How directly the CV proves the role's core technical requirements."],
  ["Deployment overlap", 20, "Prototype-to-production, runtime, evaluation, integration, reliability, and handoff."],
  ["Seniority fit", 15, "Years, degree, ownership, leadership, and expected scope."],
  ["Market upside", 10, "Role quality, career option value, company/platform signal, and learning leverage."],
  ["Access / friction", 5, "Freshness, work authorization, travel, domain gates, and application feasibility."]
];
guide.getRange("A6:C11").format = { font: baseFont, wrapText: true, verticalAlignment: "top", borders: { insideHorizontal: { style: "thin", color: colors.line } } };

guide.getRange("E5:G5").values = [["Recommendation", "Rule", "Action"]];
guide.getRange("E5:G5").format = { fill: colors.ink, font: headerFont };
guide.getRange("E6:G10").values = [
  ["Apply now", "Score >= 88; active; no blocker", "Tailor and apply within 7 days."],
  ["Targeted", "Score 80-87; active; no blocker", "Apply after high-priority roles with targeted edits."],
  ["Stretch", "Score 70-79; active; no blocker", "Apply selectively or after closing one evidence gap."],
  ["Watchlist", "Listing status requires verification", "Confirm with company/recruiter before tailoring."],
  ["Blocked / verify", "Citizenship or sponsorship gate", "Confirm eligibility before any application work."]
];
guide.getRange("E6:G10").format = { font: baseFont, wrapText: true, verticalAlignment: "top", borders: { insideHorizontal: { style: "thin", color: colors.line } } };
guide.getRange("E6:E10").conditionalFormats.add("containsText", { text: "Apply now", format: { fill: colors.greenSoft, font: { bold: true, color: colors.green } } });
guide.getRange("E6:E10").conditionalFormats.add("containsText", { text: "Targeted", format: { fill: colors.blueSoft, font: { bold: true, color: colors.blue } } });
guide.getRange("E6:E10").conditionalFormats.add("containsText", { text: "Stretch", format: { fill: colors.amberSoft, font: { bold: true, color: colors.amber } } });
guide.getRange("E6:E10").conditionalFormats.add("containsText", { text: "Blocked", format: { fill: colors.redSoft, font: { bold: true, color: colors.red } } });

guide.getRange("A14:H14").merge();
guide.getRange("A14").values = [["Use three CV narratives, not one generic CV"]];
guide.getRange("A14:H14").format = { fill: colors.green, font: { name: "Aptos", size: 11, bold: true, color: colors.white } };
guide.getRange("A15:E15").values = [["Variant", "Use for", "Headline", "Must include", "Do not lead with"]];
guide.getRange("A15:E15").format = { fill: colors.ink, font: headerFont, wrapText: true };
guide.getRange("A16:E18").values = [
  ["FDE / Solutions", "OpenAI, Google, Arize, Cohere, BytePlus, Resaro", "Forward-Deployed AI Engineer", "Discovery; scoping; prototype-to-production; evals; integration; customer issues; handoff", "Long lists of CV algorithms without customer or business context"],
  ["CV / Edge", "Polybee, Dyson, Genesis, Rapsodo, LionsBot", "Computer Vision / Edge ML Engineer", "Segmentation; matting; depth; C++/Android; TFLite/ONNX/TensorRT; hard cases; runtime", "Generic LLM claims or agent tooling that displaces core CV evidence"],
  ["Applied / Multimodal", "Razer, TikTok, PERSOL, Woh Hup", "Applied AI Engineer - Vision & Multimodal Systems", "VLM workflows; structured outputs; evaluation; services; deployment; quality/latency trade-offs", "Prompt-engineering-only language without systems and evaluation proof"]
];
guide.getRange("A16:E18").format = { font: baseFont, wrapText: true, verticalAlignment: "top", borders: { insideHorizontal: { style: "thin", color: colors.line } } };
guide.getRange("A16:E18").format.rowHeight = 60;

guide.getRange("A21:H21").merge();
guide.getRange("A21").values = [["Important assumptions and limits"]];
guide.getRange("A21:H21").format = { fill: colors.green, font: { name: "Aptos", size: 11, bold: true, color: colors.white } };
const limits = [
  "Job availability changes quickly. Source Status and Checked Date are included so every listing can be revalidated before applying.",
  "Estimated Posted Date is calculated from the relative age shown by the source and may differ by one or more days.",
  "Work authorization was not provided. Roles stating Singapore-citizen-only or no sponsorship are marked Blocked / verify.",
  "Salary is left as Not disclosed unless the listing explicitly publishes it. No market salary estimates were invented.",
  "Match scores are a prioritization tool, not a probability of offer. Referral quality and role-specific evidence can change outcomes materially."
];
for (let i = 0; i < limits.length; i += 1) {
  const row = 22 + i;
  guide.getRange(`A${row}:H${row}`).merge();
  guide.getRange(`A${row}`).values = [[limits[i]]];
  guide.getRange(`A${row}:H${row}`).format = {
    fill: i % 2 === 0 ? colors.panel : colors.white,
    font: baseFont,
    wrapText: true,
    verticalAlignment: "center",
    borders: { bottom: { style: "thin", color: colors.line } }
  };
  guide.getRange(`A${row}:H${row}`).format.rowHeight = 32;
}

const guideWidths = [
  ["A1:A26", 24], ["B1:B26", 12], ["C1:C26", 52], ["D1:D26", 30], ["E1:E26", 28],
  ["F1:F26", 24], ["G1:G26", 38], ["H1:H26", 12]
];
for (const [range, width] of guideWidths) guide.getRange(range).format.columnWidth = width;
guide.getRange("A1:H2").format.font = { name: "Aptos Display", size: 18, bold: true, color: colors.white };
guide.freezePanes.freezeRows(3);

// Compact verification and visual previews.
const dashboardCheck = await workbook.inspect({
  kind: "table",
  range: "Dashboard!A1:P30",
  include: "values,formulas",
  tableMaxRows: 30,
  tableMaxCols: 16,
  maxChars: 12000
});
console.log(dashboardCheck.ndjson);

const pipelineCheck = await workbook.inspect({
  kind: "table",
  range: `Job Pipeline!A1:Q${jobs.length + 1}`,
  include: "values,formulas",
  tableMaxRows: 8,
  tableMaxCols: 17,
  maxChars: 8000
});
console.log(pipelineCheck.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan"
});
console.log(errors.ndjson);

const drawingCheck = await workbook.inspect({
  kind: "drawing",
  sheetId: "Dashboard",
  maxChars: 3000
});
console.log(drawingCheck.ndjson);

const previews = [
  ["Dashboard", "A1:P30", "preview-dashboard.png", 1.0],
  ["Job Pipeline", `A1:AF${jobs.length + 1}`, "preview-job-pipeline.png", 0.55],
  ["Scoring Guide", "A1:H26", "preview-scoring-guide.png", 0.9]
];
for (const [sheetName, range, fileName, scale] of previews) {
  const preview = await workbook.render({ sheetName, range, scale, format: "png" });
  await fs.writeFile(path.join(outputDir, fileName), new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
const outputPath = path.join(outputDir, "Junxian_Wu_Singapore_AI_Job_Search_2026-07-11.xlsx");
await output.save(outputPath);
console.log(`Saved ${outputPath}`);
