# Done Yet?

**Tagline:** The agent said done. Done Yet? checks the systems.

**Track:** Developer Tools

**Live demo:** https://done-yet.pages.dev/

**Public repository:** https://github.com/Peanuts1605/done-yet

**Public demo video:** https://youtu.be/fCkm2LJgihE

## Inspiration

Agent transcripts are useful for understanding what an agent attempted, but a confident completion message is not proof that the requested outcome happened. A refund can post while its helpdesk ticket stays open. A retry after a timeout can create a duplicate. The wrong record can change while the agent still says "done."

Done Yet? starts from one practical question: after an agent acts, do the systems now satisfy the user's actual acceptance criteria? It is design by contract applied to agent side effects at the closeout boundary.

## What it does

Done Yet? turns an intended outcome into a typed acceptance contract, reads observed before, after, and retry state, and runs deterministic postcondition checks. It returns:

- `PASS` when every required and protective check succeeds;
- `FAIL` when observed state contradicts the contract;
- `HOLD` when a required observation is unavailable.

The Build Week proof has two layers. A real filesystem observer checks an actual temporary workspace, rejects a confident claim when no edit landed, and rejects the right edit when protected configuration also changed. It passes only after the expected status file changes, protected configuration stays untouched, and a retry remains stable. A synthetic helpdesk and refund ledger then provide six reproducible adversarial cases: false success, partial commit, wrong target, duplicate retry, timeout after commit, and a repaired run.

## How a judge can test it

1. Run `npm run demo:repo`. No edit receives `FAIL`, the right edit plus collateral configuration change receives `FAIL`, and the repaired stable retry receives `PASS 6/6`.
2. Open the live console. It starts on **False success**: the agent confidently claims completion, but observed state is unchanged, so the result is `FAIL 5/11`.
3. Switch to **Failed only**, inspect the two missed postconditions, and open the result JSON.
4. Select **Timeout after commit**. The transport reported a timeout, but canonical state satisfies all 11 checks, so the result is `PASS 11/11`.

No account, key, database, or customer data is required.

## How we built it

The project has one verification engine shared by the CLI, tests, generated demo data, and React judge console. The engine supports explicit `exists`, `equals`, `count`, `relation`, `unchanged`, and retry-stability assertions over JSON-pointer paths. A Codex plugin packages a `done-yet` skill and an opt-in `Stop` hook that requires a current passing report only in projects that contain an active Done Yet? contract.

Codex was used to research the challenge and adjacent tools, narrow the product from a broad trust dashboard to a postcondition loop, implement and test the verifier, filesystem observer, plugin, and console, generate adversarial fixtures, run visual QA, deploy the demo, and prepare the submission. GPT-5.6's product role is semantic: translate natural-language intent into a human-diffable typed contract before execution and help explain or repair failures. Deterministic checks award the verdict; the report pins the contract digest, and the Stop hook rejects a contract edited after verification.

The key decisions were deliberate: an opt-in hook rather than a global gate, a visible `HOLD` for missing evidence, timeout-after-commit as a first-class case, and one bounded real repository observer instead of overstating the synthetic helpdesk as a production connector. The primary build session is `019ee0dc-d43c-7160-82ca-0cf8120952a8`.

## Challenges

The hardest design choice was separating explanation from measurement. It was tempting to build another agent-evaluation dashboard or make broad trust claims. Instead, the proof stays deliberately narrow: a contract, observable system state, explicit checks, and a verdict whose reasoning a judge can inspect.

Timeout ambiguity was another useful edge case. A failed transport does not necessarily mean a failed outcome, just as a successful API response does not prove a complete cross-system result. The verifier therefore evaluates observed state rather than the agent's tone or the last tool response.

## Accomplishments

- One live workspace contract catches false completion and collateral edits, then verifies a repaired, retry-stable edit.
- One deterministic 11-check business contract catches four distinct failure patterns.
- The same engine powers the CLI, tests, and public console.
- Six reproducible fixtures make the claim judgeable in under two minutes.
- The Codex integration is opt-in, leaves unrelated projects untouched, and has an automated Stop-hook lifecycle test.
- The real repository proof and synthetic adversarial gallery both run locally with no credentials.
- An independent adversarial audit found and closed a false-PASS path for absent observations; regression coverage now requires `HOLD` when evidence is unavailable.

## What we learned

The useful boundary is not agent versus human. It is interpretation versus observation. Models are strong at turning intent into structure and helping people understand failures. Explicit checks are better at deciding whether a known postcondition holds. Combining those strengths produces a result that is both flexible and inspectable.

## What's next

The next responsible step is not a larger dashboard. It is a small adapter interface that lets additional developer systems implement the same observation contract. Production service connectors, cryptographic attestation, and universal agent evaluation are outside this Build Week proof.

## Submission values

- Public YouTube demo: https://youtu.be/fCkm2LJgihE
- Codex `/feedback` session ID: `019ee0dc-d43c-7160-82ca-0cf8120952a8`
- Final desktop screenshot: `docs/design/renders/done-yet-console-desktop-1440-full.png`
