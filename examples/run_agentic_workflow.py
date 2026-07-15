from __future__ import annotations

import json
from dataclasses import asdict

from agentic_workflow import ReliableWorkflow, ScriptedProvider, TransientProviderError, WorkflowRequest


def main() -> None:
    request = WorkflowRequest(
        request_id="composition-review-001",
        goal="Turn visual observations into a short, reviewable shooting plan.",
        evidence=("subject is centered", "background edge intersects the face"),
        constraints=("return no more than three actions",),
    )
    primary = ScriptedProvider("primary", [TransientProviderError("temporary timeout")])
    fallback = ScriptedProvider(
        "fallback",
        [
            {
                "summary": "The frame needs stronger subject-background separation.",
                "actions": ["Move the camera left", "Lower the viewpoint", "Recheck the face edge"],
                "confidence": 0.78,
                "needs_human_review": False,
                "evidence": list(request.evidence),
            }
        ],
    )
    run = ReliableWorkflow((primary, fallback), max_attempts_per_provider=1).run(request)
    print(json.dumps(asdict(run), indent=2, ensure_ascii=True))


if __name__ == "__main__":
    main()
