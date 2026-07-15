from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping


class ContractError(ValueError):
    """Raised when a provider returns an invalid structured output."""


@dataclass(frozen=True)
class WorkflowRequest:
    request_id: str
    goal: str
    evidence: tuple[str, ...] = ()
    constraints: tuple[str, ...] = ()
    minimum_confidence: float = 0.65

    def __post_init__(self) -> None:
        if not self.request_id.strip():
            raise ValueError("request_id must not be empty")
        if not self.goal.strip():
            raise ValueError("goal must not be empty")
        if not 0 <= self.minimum_confidence <= 1:
            raise ValueError("minimum_confidence must be between 0 and 1")


@dataclass(frozen=True)
class AgentOutput:
    summary: str
    actions: tuple[str, ...]
    confidence: float
    needs_human_review: bool
    evidence: tuple[str, ...]


@dataclass(frozen=True)
class TraceEvent:
    sequence: int
    stage: str
    provider: str
    status: str
    detail: str


@dataclass(frozen=True)
class WorkflowRun:
    request_id: str
    selected_provider: str
    output: AgentOutput
    trace: tuple[TraceEvent, ...]


def validate_output(value: Mapping[str, Any]) -> AgentOutput:
    if not isinstance(value, Mapping):
        raise ContractError("output must be an object")

    required = {"summary", "actions", "confidence", "needs_human_review", "evidence"}
    missing = sorted(required.difference(value))
    if missing:
        raise ContractError(f"missing fields: {', '.join(missing)}")

    summary = value["summary"]
    actions = value["actions"]
    confidence = value["confidence"]
    human_review = value["needs_human_review"]
    evidence = value["evidence"]

    if not isinstance(summary, str) or not summary.strip() or len(summary) > 500:
        raise ContractError("summary must be a non-empty string of at most 500 characters")
    if not isinstance(actions, list) or not 1 <= len(actions) <= 5:
        raise ContractError("actions must contain between one and five items")
    if any(not isinstance(item, str) or not item.strip() for item in actions):
        raise ContractError("every action must be a non-empty string")
    if isinstance(confidence, bool) or not isinstance(confidence, (int, float)) or not 0 <= confidence <= 1:
        raise ContractError("confidence must be a number between zero and one")
    if not isinstance(human_review, bool):
        raise ContractError("needs_human_review must be a boolean")
    if not isinstance(evidence, list) or any(not isinstance(item, str) for item in evidence):
        raise ContractError("evidence must be a list of strings")

    return AgentOutput(
        summary=summary.strip(),
        actions=tuple(item.strip() for item in actions),
        confidence=float(confidence),
        needs_human_review=human_review,
        evidence=tuple(item.strip() for item in evidence if item.strip()),
    )
