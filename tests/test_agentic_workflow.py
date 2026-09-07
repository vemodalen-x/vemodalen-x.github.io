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

    def test_provider_requested_review_is_never_marked_passed(self) -> None:
        for confidence in (0.3, 0.9):
            with self.subTest(confidence=confidence):
                provider = ScriptedProvider("primary", [valid_output(confidence, human_review=True)])
                run = ReliableWorkflow((provider,)).run(self.request)
                self.assertEqual(run.trace[-2].status, "required")
                self.assertEqual(run.trace[-1].status, "pending_review")

    def test_low_confidence_is_pending_not_accepted(self) -> None:
        run = ReliableWorkflow((ScriptedProvider("primary", [valid_output(0.2)]),)).run(self.request)
        self.assertEqual(run.trace[-1].status, "pending_review")

    def test_validation_success_is_traced(self) -> None:
        run = ReliableWorkflow((ScriptedProvider("primary", [valid_output()]),)).run(self.request)
        self.assertTrue(any(event.stage == "validation" and event.status == "passed" for event in run.trace))
        self.assertEqual([event.sequence for event in run.trace], list(range(1, len(run.trace) + 1)))

    def test_invalid_attempt_budgets_are_rejected_at_construction(self) -> None:
        for attempts in (True, 0, -1, 1.5, "2", None):
            with self.subTest(attempts=attempts), self.assertRaises(ValueError):
                ReliableWorkflow((ScriptedProvider("primary", [valid_output()]),), attempts)

    def test_ambiguous_provider_names_are_rejected(self) -> None:
        with self.assertRaises(ValueError):
            ReliableWorkflow((ScriptedProvider("same", [valid_output()]), ScriptedProvider("same", [valid_output()])))

    def test_invalid_request_values_are_rejected(self) -> None:
        for threshold in (True, "0.8", float("nan"), float("inf"), -0.1, 1.1):
            with self.subTest(threshold=threshold), self.assertRaises(ValueError):
                WorkflowRequest("id", "goal", minimum_confidence=threshold)
        for fields in ({"request_id": None}, {"goal": 42}, {"evidence": "case"}, {"constraints": (1,)}):
            with self.subTest(fields=fields), self.assertRaises(ValueError):
                WorkflowRequest(**({"request_id": "id", "goal": "goal"} | fields))

    def test_threshold_equality_does_not_require_review(self) -> None:
        run = ReliableWorkflow((ScriptedProvider("primary", [valid_output(0.65)]),)).run(self.request)
        self.assertFalse(run.output.needs_human_review)

    def test_invalid_confidence_triggers_fallback(self) -> None:
        for confidence in (True, float("nan"), float("inf"), "0.9"):
            with self.subTest(confidence=confidence):
                run = ReliableWorkflow((ScriptedProvider("primary", [valid_output(confidence)]),
                                        ScriptedProvider("fallback", [valid_output()]))).run(self.request)
                self.assertEqual(run.selected_provider, "fallback")


if __name__ == "__main__":
    unittest.main()
