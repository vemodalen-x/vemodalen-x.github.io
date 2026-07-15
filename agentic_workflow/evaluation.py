from __future__ import annotations

from dataclasses import dataclass

from .contracts import WorkflowRequest
from .workflow import Provider, ReliableWorkflow, WorkflowFailed


@dataclass(frozen=True)
class EvaluationCase:
    name: str
    request: WorkflowRequest
    providers: tuple[Provider, ...]
    expected_provider: str | None
    expect_human_review: bool = False


@dataclass(frozen=True)
class EvaluationRecord:
    name: str
    passed: bool
    detail: str


@dataclass(frozen=True)
class EvaluationReport:
    records: tuple[EvaluationRecord, ...]

    @property
    def passed(self) -> int:
        return sum(record.passed for record in self.records)

    @property
    def total(self) -> int:
        return len(self.records)


def evaluate_cases(cases: tuple[EvaluationCase, ...]) -> EvaluationReport:
    records: list[EvaluationRecord] = []
    for case in cases:
        workflow = ReliableWorkflow(case.providers)
        try:
            run = workflow.run(case.request)
            provider_ok = run.selected_provider == case.expected_provider
            review_ok = run.output.needs_human_review == case.expect_human_review
            passed = provider_ok and review_ok
            detail = (
                f"provider={run.selected_provider}; human_review={run.output.needs_human_review}; "
                f"trace_events={len(run.trace)}"
            )
        except WorkflowFailed as error:
            passed = case.expected_provider is None
            detail = f"workflow_failed; trace_events={len(error.trace)}"
        records.append(EvaluationRecord(case.name, passed, detail))
    return EvaluationReport(tuple(records))
