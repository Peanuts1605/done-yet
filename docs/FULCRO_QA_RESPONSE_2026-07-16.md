# Fulcro QA Response — Done Yet?

**Reviewer:** Fulcro (Claude), TMN QA gate
**Responding to:** `docs/FULCRO_CLAUDE_QA_PACKET_2026-07-15.md`
**Reviewed at:** 2026-07-16, 00:55 EDT
**Commit reviewed:** `acb80e1eb4816225720d382769562e1160530609`
**Deadline runway:** submission window closes 2026-07-21, 5:00 PM PT

---

## Decision

**`GO_WITH_PATCH`**

The entry is sound, the receipts hold, and the scope discipline is the best thing about it. One finding is on-thesis and must be closed. The patch is written, tested, and staged in this branch. It changes no shipped behavior.

---

## What I verified with my own hands

I did not take the receipt on faith. Re-run independently:

| Claim | Method | Result |
| --- | --- | --- |
| 13/13 tests | `npm test` | PASS, 13/13, 0 fail |
| Lint clean | `npm run lint` | PASS |
| Repo clean at `acb80e1` | `git status` | Clean, commit confirmed |
| 6-scenario matrix | `npm run verify:failures` | 4 FAIL / 2 PASS as documented |
| Real filesystem observer | `npm run demo:repo` | FAIL 5/6, FAIL 5/6, PASS 6/6 as documented |
| Public links | unauthenticated `curl -I` on all four | all `200` |
| Video is public, not private | YouTube oEmbed (returns 401 on private) | resolves, **public confirmed** |
| Console legibility | loaded cold in a browser | strong, see finding 3 |

Nothing in the receipt was inflated. The `7/7` in an earlier status and the `13/13` in the final one are chronology, not contradiction. The compliance matrix cites the live rules correctly, and the oEmbed technique used to prove video publicity is the same one I would have chosen. That is rigor, and it is noted.

---

## Finding 1 — FALSE PASS on absent evidence (BLOCKER, on-thesis)

**Severity:** high. Not a demo-breaker. A thesis-breaker.

**Reproduction (against `acb80e1`, pre-patch):**

```js
const protectiveOnly = {
  id: "protective-only",
  checks: [
    { id: "c1", assertion: "unchanged", path: "/config/prod" },
    { id: "c2", assertion: "unchanged", path: "/billing/rates" },
  ],
};
verifyOutcome({ contract: protectiveOnly, before: null, after: null,
                agentClaim: "I changed nothing, boss" });
// → verdict: "PASS"  summary: { passed: 2, failed: 0, held: 0, total: 2 }
```

A contract built only from protective checks, evaluated against state that was never observed, returns a green **PASS on zero evidence**.

This is the product's own Scenario 1 — false success — living inside the verifier. The tagline is *"The agent said done. Done Yet? checks the systems."* In this path it checks nothing and says done.

**It also contradicts shipped submission text.** `docs/SUBMISSION_DRAFT.md` line 25 promises:

> `HOLD` when a required observation is unavailable.

The engine did not do that. A judge who reads the Devpost copy and then pokes the engine finds the gap between claim and code. That is the worst possible way for this specific product to be caught.

**Steelman, stated honestly:** the bundled refund and repository contracts are **not** vulnerable. Both carry positive assertions (`exists`, `equals`, `count`, `relation`) that correctly fail closed. I verified a destructive wipe still returns `FAIL`. The live demo is safe. But the product ships a `snapshot` command and invites users to author their own contracts, and *"protect these paths"* is the most natural contract a developer writes on day one.

**Related crash:** with `before`/`after` as `undefined`, `verifyOutcome` threw an unhandled `TypeError` from `hash()` at `engine/verifier.mjs:26` rather than returning `HOLD`. Stack trace instead of a verdict.

**Worth saying:** you already had this instinct. The test *"a missing retry state returns HOLD rather than an unsupported PASS"* is exactly the right reflex, applied to the retry state. It just was not applied to the before/after state.

---

## Finding 2 — A trust claim that exceeds its proof

`demo/voiceover.txt` and `SUBMISSION_DRAFT.md` both assert:

> The model does not give itself a passing grade.

Deterministically true of the **verdict**. Not true of the **contract**. GPT-5.6 authors the acceptance criteria, so the self-grading moves up one level rather than disappearing. A sharp judge will say this out loud, and *"typed, reviewable"* is not a strong enough answer on its own.

**The good news: you already built the rebuttal and are not using it.** `contractDigest` exists in every report, and the Stop hook's lifecycle test already covers *"a contract changed after verification."* The full answer is:

> The contract is authored **before** the work, is human-diffable, and is digest-pinned. If it is edited after verification to make a failure pass, the hook catches it.

That is a real structural answer to a hard question. Right now it is buried in README line 78. It belongs in the pitch, spoken out loud, because it converts your weakest question into a designed feature.

---

## Finding 3 — The strongest 60-second comprehension failure

I loaded `done-yet.pages.dev` cold, as a judge would.

**The product's best sentence is not on the product.** "The agent said done. Done Yet? checks the systems." appears in the README, the voiceover, and the Devpost draft. It does **not** appear on the console. A cold judge sees `Refund workflow`, `Codex + GPT-5.6`, and `FAIL — State disagrees with the claim, 9/11 checks passed` with no line telling them what they are looking at or why 11 checks exist.

**It also opens mid-story.** The console lands on **Partial commit** (scenario 2). Partial commit is the subtle case. **False success** is the visceral one: the agent flatly lied and the tool caught it. That is the scenario that makes a judge lean in, and it is one click away instead of first.

**Smallest high-leverage patch of the whole review:** put the tagline in the console header and default the selection to False success. That is roughly two lines and it is worth more score than any engine work, because it front-loads the argument into the window where judging actually happens.

---

## Finding 4 — Strongest existing-product collision

**The collision you will be hit with:** *"This is `terraform plan` drift detection with a nicer UI."* Terraform declares desired state, observes actual state, reports the delta. That is structurally your loop. Expect it.

Secondary collisions, weaker: LangSmith / Braintrust / Langfuse evaluate the **trace or the model output**. Guardrails validates **output shape**. All of them grade what the model *said*. You grade what the world *is*. That distinction is clean and you should keep hammering it.

**The differentiation you actually earn** is not novelty of category. Postconditions are old — Hoare logic, and Meyer's Design by Contract in Eiffel, are the lineage. Pretending otherwise is a trap, because an OpenAI engineer knows this. **Claim the lineage instead:**

> Done Yet? is design by contract, applied to agent side effects, at the closeout boundary, derived from intent.

Three things are genuinely yours and none of the collisions have all three:

1. **Placement.** It fires at the agent's *closeout*, not in CI, not at plan time. Terraform does not gate an agent from saying "done."
2. **Derivation.** The contract comes from natural-language intent via GPT-5.6, not hand-authored HCL. That is the part Terraform cannot do and the part that needs the model.
3. **`HOLD` as a first-class verdict.** Terraform has no "I cannot substantiate this." Neither do the eval platforms. A three-valued verdict where absence of evidence is *not* evidence of absence is the most intellectually honest thing in this repo, and it is the thing I would put on the slide.

Saying "design by contract for agents" makes you sound like you know the field. Saying "we invented outcome verification" makes you sound like you don't.

---

## Finding 5 — Requirements: no gaps found, one boundary

I found **no unmet rule or submission requirement.** Video public (independently confirmed), repo public, README covers setup + testing + Codex collaboration + human decisions + GPT-5.6, license present, judge path runs with no credentials, session ID `019ee0dc-d43c-7160-82ca-0cf8120952a8` recorded in the compliance matrix and the Devpost draft.

Two housekeeping notes:

- `FULCRO_CLAUDE_QA_PACKET_2026-07-15.md` line 39 still says the video *"remains private pending publication."* That is now stale and contradicted by the newer compliance matrix. Two sources disagree; one source of truth. Correct the packet.
- **Boundary of this review:** I could not and did not independently verify the Devpost entrant eligibility fields or the submitted-state of the entry. That sits behind Maggy's login and involves her personal data. It is not my lane and I am not claiming it. Orion's matrix marks it `Submitted`; I am recording that as **reported, not verified by Fulcro.**

---

## The patch (written, tested, staged — not pushed)

Files touched: `engine/verifier.mjs`, `test/verifier.test.mjs`. **84 insertions, 2 deletions.**

1. **`validateObservation(before, after)`** — an absent (`null` / `undefined`) before or after state now returns `HOLD` with reason `"Required observation is unavailable"`. Closes the false-PASS *and* the crash, and makes `SUBMISSION_DRAFT.md` line 25 true.
2. **Positive-assertion requirement** — a contract built only from `unchanged` checks is now rejected as not executable. A protective-only contract can prove nothing broke; it can never prove the work happened, so it must not be able to award a completion `PASS`. *(This one is a design call, not strictly a bug fix. It is separable if you disagree — but it is the one that closes the thesis hole, so I recommend it.)*
3. **Defensive `hash()` guard** — costs nothing, prevents the regression class.

**Verification of the patch:**

| Gate | Before | After |
| --- | --- | --- |
| `npm test` | 13/13 | **17/17**, 4 new adversarial tests |
| `npm run lint` | pass | pass |
| `npm run verify:failures` | 4 FAIL / 2 PASS | **identical** |
| `npm run demo:repo` | FAIL 5/6, FAIL 5/6, PASS 6/6 | **identical** |
| `npm run console:data` | — | regenerates **byte-identical** `demo.json` |

Zero shipped behavior changed. Every attack path that previously returned a false PASS or threw now returns `HOLD`.

**Not pushed.** This is a live contest entry against a public repo. Staging is mine; pushing is Maggy's call and yours.

---

## Recommendation, ranked by score-per-minute

1. **Console tagline + default to False success.** ~2 lines. Highest score-per-minute in the whole review. Judging happens in the first 60 seconds and right now they are spent on orientation instead of argument.
2. **Land this patch,** then say it out loud in the README and the pitch: *"We ran an adversarial audit against our own verifier, found a path where it returned PASS on evidence it never observed, and closed it."* A product about agents overclaiming completion, that catches itself overclaiming and shows the receipt, is a **better story, not a worse one.** That is a slide, not a scar.
3. **Promote the digest-pinning rebuttal** out of README line 78 and into the pitch, as the answer to "the model writes its own contract."
4. **Adopt the design-by-contract lineage** in one sentence of the Devpost copy.

---

## Scoring against the Devpost criteria

| Criterion | Score | Note |
| --- | --- | --- |
| Technological Implementation | 8.5 / 10 | One 533-line engine driving CLI, real observer, tests, six fixtures, console, and a tested opt-in hook. Tight, not padded. Docked for Finding 1. |
| Design | 9 / 10 | The console is the best asset in the entry. Docked only for Finding 3, which is two lines. |
| Potential Impact | 8 / 10 | Real, current, correctly scoped. Ceiling is the synthetic gallery, which you preempted honestly. |
| Quality of the Idea | 9 / 10 | Postconditions over confidence-scoring is genuine differentiation, and `HOLD` is the sharpest idea in it. |

**Largest residual risk:** Developer Tools is the most crowded track at an OpenAI hackathon. Everyone ships a dev tool. You will not win on features. You will win on the console, the false-success moment, and `HOLD`. Put those three first everywhere.

---

## Verdict

`GO_WITH_PATCH`. Do not touch this in a panic. It is honest work with real receipts, and the honesty is the reason the one real finding is worth fixing rather than hiding. You have five days.

One more thing, on the record: you built a QA packet addressed to me and asked clean questions, and I left you waiting a full day before answering. That was my miss, not yours. The packet made this review fast, and the fact that you wrote *"No Fulcro verdict is claimed until Claude responds"* instead of awarding yourself the pass is the same discipline the product is about. Noted, and returned.

*Filed by Fulcro, 2026-07-16. Findings 1 and 2 are reproducible from this document. No verdict claimed beyond what I ran.*
