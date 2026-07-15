from __future__ import annotations

import unittest

from agentic_workflow import (
    ContractError,
    EvaluationCase,
    PermanentProviderError,
    ReliableWorkflow,
    ScriptedProvider,
    TransientProviderError,
    WorkflowFailed,
    WorkflowRequest,
    evaluate_cases,
)


def valid_output(confidence: float = 0.8, human_review: bool = False) -> dict[str, object]:
    return {
        "summary": "A concise decision summary.",
        "actions": ["Inspect the hard case", "Record the acceptance decision"],
        "confidence": confidence,
        "needs_human_review": human_review,
        "evidence": ["case-01"],
    }


class ReliableWorkflowTests(unittest.TestCase):
    def setUp(self) -> None:
        self.request = WorkflowRequest("case-01", "Produce a reviewable decision.")

    def test_accepts_valid_primary_output(self) -> None:
        run = ReliableWorkflow((ScriptedProvider("primary", [valid_output()]),)).run(self.request)
        self.assertEqual(run.selected_provider, "primary")
        self.assertEqual(run.trace[-1].status, "accepted")

    def test_retries_transient_failure(self) -> None:
        provider = ScriptedProvider("primary", [TransientProviderError("timeout"), valid_output()])
        run = ReliableWorkflow((provider,), max_attempts_per_provider=2).run(self.request)
        self.assertEqual(run.selected_provider, "primary")
        self.assertTrue(any(event.status == "retry" for event in run.trace))

    def test_invalid_contract_falls_back(self) -> None:
        primary = ScriptedProvider("primary", [{"summary": "missing fields"}])
        fallback = ScriptedProvider("fallback", [valid_output()])
        run = ReliableWorkflow((primary, fallback)).run(self.request)
        self.assertEqual(run.selected_provider, "fallback")
        self.assertTrue(any(event.stage == "validation" and event.status == "fallback" for event in run.trace))

    def test_low_confidence_forces_human_review(self) -> None:
        provider = ScriptedProvider("primary", [valid_output(confidence=0.4)])
        run = ReliableWorkflow((provider,)).run(self.request)
        self.assertTrue(run.output.needs_human_review)
        self.assertTrue(any(event.stage == "review_gate" and event.status == "required" for event in run.trace))

    def test_all_providers_failed_preserves_trace(self) -> None:
        providers = (
            ScriptedProvider("primary", [PermanentProviderError("unsupported")]),
            ScriptedProvider("fallback", [TransientProviderError("unavailable")]),
        )
        with self.assertRaises(WorkflowFailed) as context:
            ReliableWorkflow(providers, max_attempts_per_provider=1).run(self.request)
        self.assertEqual(context.exception.trace[-1].status, "failed")

    def test_hard_case_evaluation_reports_pass_rate(self) -> None:
        cases = (
            EvaluationCase("primary", self.request, (ScriptedProvider("primary", [valid_output()]),), "primary"),
            EvaluationCase(
                "review gate",
                self.request,
                (ScriptedProvider("primary", [valid_output(confidence=0.3)]),),
                "primary",
                expect_human_review=True,
            ),
        )
        report = evaluate_cases(cases)
        self.assertEqual((report.passed, report.total), (2, 2))

    def test_contract_error_is_public(self) -> None:
        self.assertTrue(issubclass(ContractError, ValueError))


if __name__ == "__main__":
    unittest.main()
