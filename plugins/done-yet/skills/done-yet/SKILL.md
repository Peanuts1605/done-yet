---
name: done-yet
description: Use when a task changes files, services, records, or other external state and completion should be based on observable postconditions rather than the agent's final message.
---

# Done Yet?

Turn the user's requested outcome into a small, reviewable acceptance contract before performing consequential mutations. Keep GPT-5.6's role explicit: it translates natural-language intent into typed checks and proposes repairs, while deterministic probes decide `PASS`, `FAIL`, or `HOLD`.

## Workflow

1. Identify the authoritative state surfaces for the task.
2. Write `.done-yet/contract.json` using the Done Yet contract shape.
3. Capture the relevant before state.
4. Perform the task.
5. Query the authoritative after state independently of the agent narrative.
6. Run the verifier and inspect every failed or unsupported check.
7. Repair and rerun when the result is `FAIL`.
8. Report completion only when the result is `PASS`; report the concrete unsupported probe when the result is `HOLD`.

Use the smallest decisive evidence. Do not imply that hashes prove truth, that unsupported systems were verified, or that a model-generated verdict is deterministic.

For the bundled Build Week fixture, run `npm run demo` from the repository root.
