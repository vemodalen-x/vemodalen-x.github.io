from __future__ import annotations

from collections import deque
from dataclasses import replace
from typing import Any, Mapping, Protocol, Sequence

from .contracts import ContractError, TraceEvent, WorkflowRequest, WorkflowRun, validate_output


class ProviderError(RuntimeError):
    """Base class for expected provider failures."""


class TransientProviderError(ProviderError):
    """A provider failure that may succeed on retry."""


class PermanentProviderError(ProviderError):
    """A provider failure that should immediately trigger fallback."""


class WorkflowFailed(RuntimeError):
    def __init__(self, message: str, trace: Sequence[TraceEvent]) -> None:
        super().__init__(message)
        self.trace = tuple(trace)


class Provider(Protocol):
    name: str

    def generate(self, request: WorkflowRequest) -> Mapping[str, Any]: ...


class ScriptedProvider:
    """Deterministic provider used by the public demo and hard-case tests."""

    def __init__(self, name: str, responses: Sequence[Mapping[str, Any] | ProviderError]) -> None:
        if not name.strip():
            raise ValueError("provider name must not be empty")
        if not responses:
            raise ValueError("at least one scripted response is required")
        self.name = name
        self._responses = deque(responses)

    def generate(self, request: WorkflowRequest) -> Mapping[str, Any]:
        del request
        if not self._responses:
            raise PermanentProviderError(f"{self.name} has no scripted response remaining")
        response = self._responses.popleft()
        if isinstance(response, ProviderError):
            raise response
        return response


class ReliableWorkflow:
    def __init__(self, providers: Sequence[Provider], max_attempts_per_provider: int = 2) -> None:
        if not providers:
            raise ValueError("at least one provider is required")
        if (isinstance(max_attempts_per_provider, bool)
                or not isinstance(max_attempts_per_provider, int)
                or max_attempts_per_provider < 1):
            raise ValueError("max_attempts_per_provider must be a positive integer")
        names = [provider.name for provider in providers]
        if any(not isinstance(name, str) or not name.strip() for name in names):
            raise ValueError("provider names must be non-empty strings")
        if len(set(names)) != len(names):
            raise ValueError("provider names must be unique for unambiguous traces")
        self.providers = tuple(providers)
        self.max_attempts_per_provider = max_attempts_per_provider

    def run(self, request: WorkflowRequest) -> WorkflowRun:
        trace: list[TraceEvent] = []

        def record(stage: str, provider: str, status: str, detail: str) -> None:
            trace.append(TraceEvent(len(trace) + 1, stage, provider, status, detail))

        for provider_index, provider in enumerate(self.providers):
            record("routing", provider.name, "selected", f"priority={provider_index + 1}")
            for attempt in range(1, self.max_attempts_per_provider + 1):
                record("generation", provider.name, "started", f"attempt={attempt}")
                try:
                    raw_output = provider.generate(request)
                except TransientProviderError as error:
                    status = "retry" if attempt < self.max_attempts_per_provider else "exhausted"
                    record("generation", provider.name, status, str(error))
                    continue
                except PermanentProviderError as error:
                    record("generation", provider.name, "fallback", str(error))
                    break

                try:
                    output = validate_output(raw_output)
                except ContractError as error:
                    record("validation", provider.name, "fallback", str(error))
                    break

                record("validation", provider.name, "passed", "output contract valid")
                low_confidence = output.confidence < request.minimum_confidence
                if low_confidence or output.needs_human_review:
                    output = replace(output, needs_human_review=True)
                    record(
                        "review_gate",
                        provider.name,
                        "required",
                        (f"confidence={output.confidence:.2f} threshold={request.minimum_confidence:.2f}"
                         if low_confidence else "provider requested human review"),
                    )
                else:
                    record("review_gate", provider.name, "passed", f"confidence={output.confidence:.2f}")

                status = "pending_review" if output.needs_human_review else "accepted"
                record("completion", provider.name, status, f"actions={len(output.actions)}")
                return WorkflowRun(request.request_id, provider.name, output, tuple(trace))

        record("completion", "none", "failed", "all providers exhausted")
        raise WorkflowFailed("all providers failed or returned invalid output", trace)
