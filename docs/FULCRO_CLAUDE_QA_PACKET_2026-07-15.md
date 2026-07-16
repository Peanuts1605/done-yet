# Done Yet? Fulcro QA Packet

## Reviewer

Fulcro is Claude. This packet is a handoff for actual Fulcro QA; it is not a Fulcro verdict.

## Fast path

- Live product: https://done-yet.pages.dev/
- Repository: https://github.com/Peanuts1605/done-yet
- Track: Developer Tools
- Product claim: **The agent said done. Done Yet? checks the systems.**

## Two-minute review

1. Open **False success** and confirm `FAIL 5/11` against unchanged observed state.
2. Open **Partial commit**, select **Failed only**, and verify that ticket closure and refund linkage are the only two failed postconditions.
3. Open the contract and JSON evidence; confirm the verdict is inspectable rather than model-scored.
4. Open **Timeout after commit** and confirm `PASS 11/11` despite the transport error.
5. Try **Wrong target** and **Duplicate retry** to test collateral-mutation and idempotency checks.
6. Review the README installation path and the opt-in Codex `Stop` hook.

## Questions for Fulcro

Return one decision: `GO`, `GO_WITH_PATCH`, or `PIVOT`.

Name only reproducible findings:

- the strongest design or comprehension failure a judge would hit in the first 60 seconds;
- any security or trust claim that exceeds the proof;
- any rule or submission requirement that the repository, video, or demo does not actually satisfy;
- the strongest existing-product collision and the exact differentiation Done Yet? still earns;
- the smallest patch that materially improves the score before July 21.

## Current truth

- The public console and repository are live.
- Automated checks and public interaction QA passed.
- The 108.309-second demo is public on YouTube.
- The Devpost entry is submitted to OpenAI Build Week.
- Fulcro returned `GO_WITH_PATCH` on 2026-07-16; the reproducible review is in `docs/FULCRO_QA_RESPONSE_2026-07-16.md`.
