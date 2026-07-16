# Done Yet? Fulcro Patch Decision

Date: 2026-07-16
Decision: `SHIP_FULCRO_PATCH_AND_KEEP_ENTRY_SUBMITTED`
Review verdict: `GO_WITH_PATCH`

## Decision

Accept Fulcro's reproducible finding and ship the smallest coherent repair before the OpenAI Build Week deadline.

The verifier must never turn unavailable evidence into a completion `PASS`. Missing before/after observations, malformed contract structures, invalid JSON pointers, and protective-only completion contracts now fail closed with `HOLD` instead of returning an unsupported verdict or throwing.

The judge console now opens on **False success** and carries the product sentence in its header:

> The agent said done. Done Yet? checks the systems.

The README and submission copy now state the lineage and trust boundary directly: design by contract applied to agent side effects at closeout; GPT-5.6 helps author a human-diffable contract before execution; deterministic checks issue the verdict; the report pins the contract digest; the Stop hook rejects a contract edited after verification.

## Why ship

- The finding directly contradicted the submitted `HOLD` claim.
- The repair closes the false-PASS and crash paths without changing any shipped scenario verdict.
- The console change improves first-minute comprehension without adding product scope.
- The patch produces a better, honest contest story: the verifier was adversarially audited against its own thesis and corrected with reproducible evidence.

## Scope held

No new connector, dashboard, model call, scenario, or production integration was added. The submitted category, public URLs, demo video, and primary product loop remain unchanged.
