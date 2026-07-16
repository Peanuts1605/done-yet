# Done Yet? - Final Devpost Submission

## Submission status

- Status: `SUBMITTED`
- Submitted: `2026-07-16T02:05:45Z`
- Devpost: https://devpost.com/software/done-yet
- Submission ID: `1087865-done-yet`
- Confirmation: `Project submitted!`

## Project name

Done Yet?

## Elevator pitch

The agent said done. Done Yet? checks the systems before Codex closes the task.

## Track

Developer Tools

## About the project

## Inspiration

AI agents are becoming convincing narrators of their own work. They can say the refund was issued, the file was updated, or the ticket was closed. But a confident completion message proves what the agent attempted, not what actually changed.

A refund can post while its helpdesk ticket stays open. A retry after a timeout can create a duplicate. The correct file can change while protected configuration changes with it.

Done Yet? began with one practical question: **after the agent acts, do the systems now satisfy the user's actual acceptance criteria?**

## What it does

Done Yet? turns an intended outcome into a typed acceptance contract, observes before, after, and retry state, then runs deterministic postcondition checks.

- `PASS` means every required and protective check succeeded.
- `FAIL` means observed state contradicts the contract.
- `HOLD` means a required observation is unavailable, so the tool refuses to guess.

The Build Week proof has two layers:

1. A real filesystem observer checks an actual temporary workspace. It rejects a confident claim when no edit landed. It also rejects the correct edit when protected configuration changed. Only the repaired, retry-stable edit receives `PASS 6/6`.
2. A synthetic helpdesk and refund ledger provides six reproducible adversarial cases: false success, partial commit, wrong target, duplicate retry, timeout after commit, and a repaired run.

The point is not another score for the agent. It is a closeout check against the world the agent was supposed to change.

## Try it in two minutes

Run the real workspace proof:

```bash
npm install
npm run demo:repo
```

Then open the live judge console and choose **Partial commit**. The refund exists, but the ticket remains open and unlinked, so the result is `FAIL 9/11`.

Choose **Timeout after commit** next. The transport reported an error, but canonical state satisfies all 11 checks, so the result is `PASS 11/11`.

No account, API key, database, or customer data is required.

## How we built it

One verification engine powers the CLI, tests, generated fixtures, filesystem observer, and React judge console. Contracts support explicit `exists`, `equals`, `count`, `relation`, `unchanged`, and retry-stability checks over JSON-pointer paths.

A Codex plugin packages a `done-yet` skill and an opt-in `Stop` hook. In an armed project, Codex cannot close the task without a current passing report. Unrelated projects remain untouched.

GPT-5.6 handles the semantic work: translating natural-language intent into a typed, reviewable contract and helping explain or repair failed checks. It does not award its own verdict. Explicit observations and deterministic checks do that.

Codex was used throughout the build: research, product narrowing, implementation, adversarial fixtures, tests, visual QA, deployment, and submission evidence. The primary build session is `019ee0dc-d43c-7160-82ca-0cf8120952a8`.

## Challenges

The hardest design choice was separating explanation from measurement. It was tempting to build another trace dashboard or make broad claims about agent trust. Instead, the proof stays narrow: one requested outcome, observable state, explicit checks, and an inspectable verdict.

Timeout ambiguity was another important edge case. A failed transport does not necessarily mean a failed outcome, just as a successful API response does not prove a complete result. Done Yet? evaluates canonical state rather than the agent's tone or its last tool response.

The filesystem observer also needed real boundaries. It reads only explicit relative paths, rejects traversal and symlinks, caps captured text, and verifies protected files as well as requested changes.

## Accomplishments

- A real workspace proof catches false completion and collateral edits, then verifies a repaired, retry-stable result.
- One deterministic 11-check contract catches four distinct business-workflow failure patterns.
- The same engine powers the CLI, tests, plugin, generated evidence, and public console.
- Thirteen automated tests cover the verifier, observer, CLI exit codes, and Codex hook lifecycle.
- Six reproducible fixtures make the central claim judgeable in under two minutes.

## What we learned

The useful boundary is not agent versus human. It is interpretation versus observation. Models are strong at turning intent into structure and helping people understand failures. Explicit checks are better at deciding whether known postconditions hold.

A tool response describes the trip. **Done is a property of the destination.**

## What's next

The next step is a small observer interface for additional developer systems, not a larger dashboard. Repository hosting, issue trackers, CI, and deployment platforms can all implement the same contract without changing the verifier's core.

## Built with

- Codex
- GPT-5.6
- JavaScript
- Node.js
- React
- Vite
- Cloudflare Pages
- Playwright
- GitHub

## Links

- Live demo: https://done-yet.pages.dev/
- Source: https://github.com/Peanuts1605/done-yet
- Video: https://youtu.be/fCkm2LJgihE

## Media order

1. `demo/thumbnail/done-yet-youtube-thumbnail.png`
2. `docs/design/renders/done-yet-console-desktop-1440-full.png`
3. `docs/design/renders/done-yet-console-mobile-390x844.png`

## Additional info

- Track: Developer Tools
- Codex `/feedback` session ID: `019ee0dc-d43c-7160-82ca-0cf8120952a8`
- Public repository: https://github.com/Peanuts1605/done-yet
- Public demo: https://done-yet.pages.dev/
- Public video: https://youtu.be/fCkm2LJgihE
