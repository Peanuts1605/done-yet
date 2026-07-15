# Done Yet?

**Tagline:** The agent said done. Done Yet? checks the systems.

**Track:** Developer Tools

**Live demo:** https://done-yet.pages.dev/

**Public repository:** https://github.com/Peanuts1605/done-yet

**Public demo video:** https://youtu.be/fCkm2LJgihE

## Inspiration

Agent transcripts are useful for understanding what an agent attempted, but a confident completion message is not proof that the requested outcome happened. A refund can post while its helpdesk ticket stays open. A retry after a timeout can create a duplicate. The wrong record can change while the agent still says "done."

Done Yet? starts from one practical question: after an agent acts, do the systems now satisfy the user's actual acceptance criteria?

## What it does

Done Yet? turns an intended outcome into a typed acceptance contract, reads observed before, after, and retry state, and runs deterministic postcondition checks. It returns:

- `PASS` when every required and protective check succeeds;
- `FAIL` when observed state contradicts the contract;
- `HOLD` when a required observation is unavailable.

The Build Week proof uses a synthetic helpdesk and refund ledger. One contract requires a `$42` refund for `ORD-17`, closure and linkage of `TKT-17`, no change to unrelated records, and no duplicate refund on retry. Six adversarial fixtures show false success, partial commit, wrong target, duplicate retry, timeout after commit, and a repaired run.

## How a judge can test it

1. Open the live console and select **Partial commit**. The refund exists, but the ticket is still open and unlinked, so the result is `FAIL 9/11`.
2. Switch to **Failed only**, inspect the two missed postconditions, and open the result JSON.
3. Select **Timeout after commit**. The transport reported a timeout, but canonical state satisfies all 11 checks, so the result is `PASS 11/11`.
4. Try the wrong-target and duplicate-retry fixtures to see protective checks catch collateral mutation and non-idempotency.

No account, key, database, or customer data is required.

## How we built it

The project has one verification engine shared by the CLI, tests, generated demo data, and React judge console. The engine supports explicit `exists`, `equals`, `count`, `relation`, `unchanged`, and retry-stability assertions over JSON-pointer paths. A Codex plugin packages a `done-yet` skill and an opt-in `Stop` hook that requires a current passing report only in projects that contain an active Done Yet? contract.

Codex was used to research the challenge, shape the narrow postcondition-verification wedge, implement and test the verifier and plugin, build the judge console, generate adversarial fixtures, run visual QA, and prepare the submission. GPT-5.6's product role is semantic: translate natural-language intent into a reviewable typed contract and help explain or repair failures. The model does not award its own verdict; deterministic checks do.

## Challenges

The hardest design choice was separating explanation from measurement. It was tempting to build another agent-evaluation dashboard or make broad trust claims. Instead, the proof stays deliberately narrow: a contract, observable system state, explicit checks, and a verdict whose reasoning a judge can inspect.

Timeout ambiguity was another useful edge case. A failed transport does not necessarily mean a failed outcome, just as a successful API response does not prove a complete cross-system result. The verifier therefore evaluates observed state rather than the agent's tone or the last tool response.

## Accomplishments

- One deterministic 11-check contract catches four distinct failure patterns.
- The same engine powers the CLI, tests, and public console.
- Six reproducible fixtures make the claim judgeable in under two minutes.
- The Codex integration is opt-in and leaves unrelated projects untouched.
- The full proof runs locally with synthetic data and no credentials.

## What we learned

The useful boundary is not agent versus human. It is interpretation versus observation. Models are strong at turning intent into structure and helping people understand failures. Explicit checks are better at deciding whether a known postcondition holds. Combining those strengths produces a result that is both flexible and inspectable.

## What's next

The next responsible step is not a larger dashboard. It is a small adapter interface for reading canonical state from real developer systems while preserving the same contract and verdict semantics. Production connectors, cryptographic attestation, and universal agent evaluation are outside this Build Week proof.

## Submission values

- Public YouTube demo: https://youtu.be/fCkm2LJgihE
- Codex `/feedback` session ID: `019ee0dc-d43c-7160-82ca-0cf8120952a8`
- Final desktop screenshot: `docs/design/renders/done-yet-console-desktop-1440-full.png`
