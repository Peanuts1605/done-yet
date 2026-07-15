# Done Yet? Demo Script

Target length: 2 minutes 15 seconds.

## 0:00-0:15 — The claim

**Screen:** Open the live console on **Partial commit**.

**Voiceover:**

"Agents are good at telling us what they attempted. But a confident completion message is not the same as proving the outcome. Done Yet? checks the systems after the agent says it is finished."

## 0:15-0:40 — The contract

**Screen:** Open **View full contract** and briefly scroll the checks.

**Voiceover:**

"For this synthetic helpdesk task, the contract says: refund order seventeen for forty-two dollars, close and link ticket seventeen, leave unrelated records unchanged, and do not duplicate the refund on retry. GPT-5.6 helps translate intent into this typed, reviewable contract."

## 0:40-1:10 — Catch a partial commit

**Screen:** Close the contract, choose **Failed only**, and show the two failed rows beside the helpdesk and refund states.

**Voiceover:**

"The agent says both jobs are done. The refund ledger agrees, but the helpdesk does not: the ticket remains open and has no refund link. Done Yet? returns FAIL, nine of eleven, and shows the exact postconditions that disagree with the claim."

## 1:10-1:35 — Resolve timeout ambiguity

**Screen:** Select **Timeout after commit**. Show `PASS 11/11` and the state relationship.

**Voiceover:**

"Now the opposite case. The agent saw a timeout and might report failure, but the canonical state is correct. The refund exists once, the ticket is closed and linked, and unrelated records are unchanged. The result is PASS, eleven of eleven."

## 1:35-1:55 — Evidence and integration

**Screen:** Open the result JSON, then cut to the repository's plugin folder and README install commands.

**Voiceover:**

"Every verdict includes the contract, individual checks, observed values, and evidence digests. The repository also includes an opt-in Codex skill and Stop hook, so a participating task cannot close without a current passing report."

## 1:55-2:15 — The boundary

**Screen:** Return to the six-scenario rail, ending on the Done Yet? wordmark and live URL.

**Voiceover:**

"GPT-5.6 handles semantic interpretation and repair suggestions. The verifier handles measurement. It does not grade the agent's confidence. It checks whether the intended result happened. The agent said done. Done Yet? checks the systems."

## Capture notes

- Record at 1440 by 900 or 1920 by 1080.
- Keep the browser zoom at 100 percent and the pointer deliberate.
- Show one failure and one counterintuitive pass; do not tour every fixture.
- Use a human voiceover with natural pacing. Keep music absent or very low.
- Final upload must be public on YouTube and no longer than three minutes.
