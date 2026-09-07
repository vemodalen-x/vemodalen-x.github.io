# Reliable Agent Workflow Reference

This is a public-safe reference implementation for the orchestration mechanics behind an applied agent workflow:

- provider-neutral routing;
- retry and fallback behavior;
- validated structured-output contracts;
- confidence-based human-review gates;
- deterministic traces;
- hard-case evaluation.

The implementation deliberately uses `ScriptedProvider` rather than claiming access to a live model provider. A production adapter can implement the small `Provider` protocol without changing routing, validation, trace, or evaluation behavior.

Run the example:

```bash
python -m examples.run_agentic_workflow
```

Run the tests:

```bash
python -m unittest discover -s tests -v
```

## Boundary

Schema validity and human approval are separate states. If the provider requests
review or confidence is below the request threshold, the trace ends with
`review_gate: required` and `completion: pending_review`. Otherwise it ends with
`completion: accepted`. Consumers must not execute actions from a pending result.
The library returns this status; it does not run a human approval queue or execute actions.

Provider confidence is not calibrated here. Live adapters also need transport deadlines,
backoff, rate-limit handling, secret management and task-level accuracy evaluation.

This code demonstrates orchestration and reliability engineering. It does not claim model training, a production provider integration, or hyperscale agent infrastructure.
