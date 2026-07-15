# Done Yet? - Build Week Judge Red Team

## Decision

`GO_WITH_PATCH`. Do not pivot.

Done Yet? fits the Developer Tools track as a Codex plugin, CLI, deterministic postcondition engine, and runnable test workflow. The official rubric weights technological implementation, design, potential impact, and quality of the idea equally; technological implementation is the first tie-breaker.

## Pre-patch score

| Criterion | Score | Main gap |
| --- | ---: | --- |
| Technological Implementation | 16/25 | Runnable flow began with prepared state JSON. |
| Design | 20/25 | Strong console, but mostly an inspection experience. |
| Potential Impact | 15/25 | No observation of a real developer system. |
| Quality of the Idea | 18/25 | Clear wedge, but postconditions already exist in adjacent tools. |
| Total | 69/100 | Strong foundation, not yet a finalist-grade proof. |

## Competitive reality

- Strands AI Functions supports Python postconditions and automatic reprompting until function output satisfies them. Done Yet? should not claim postconditions as a new category.
- LangSmith can evaluate semantic outcome and agent trajectory across a thread. Its center of gravity is trace and conversation evaluation rather than a small external-state acceptance contract.
- Microsoft Agent Governance Toolkit explicitly documents that audit logs record attempted actions rather than outcomes and lists post-action world-state validators as planned work. This validates the problem while showing the category is moving quickly.

The defensible product distinction is narrower: a Codex-native closeout workflow that turns one requested outcome into reviewable checks, observes explicitly named external state, verifies required and forbidden changes plus retry stability, and returns a deterministic verdict without asking the model to grade itself.

## Score-changing patches applied

1. Added a zero-credential filesystem observer over explicit relative workspace paths.
2. Added a live three-result proof: no edit `FAIL`, right edit plus protected-file mutation `FAIL`, repaired retry-stable edit `PASS`.
3. Rejected path traversal and symlinks in every observed path component; text capture is explicit and capped.
4. Added CLI integration tests for snapshot output, traversal rejection, and `PASS` / `FAIL` / `HOLD` exit codes.
5. Added an end-to-end Stop-hook lifecycle test for unarmed, missing-report, matching-pass, and changed-contract states.
6. Made the README explicit about Codex collaboration, human decisions, GPT-5.6's semantic role, and hook trust review.

## Post-patch estimate

| Criterion | Score | Strongest evidence |
| --- | ---: | --- |
| Technological Implementation | 20/25 | Shared verifier, real observer, CLI, plugin, lifecycle hook, and 13 tests. |
| Design | 20/25 | Public console remains coherent and judge-friendly. |
| Potential Impact | 18/25 | The core claim now runs against live workspace files. |
| Quality of the Idea | 19/25 | Honest differentiation from traces, output validators, and policy guards. |
| Total | 77/100 | Credible submission; final video and actual Fulcro review determine the last polish. |

## Remaining gate

Do not add broad connectors or a larger dashboard. Reconcile Fulcro/Claude's actual review. If the public video is revised, the only score-changing addition is a short capture of `npm run demo:repo` before the existing console story.

## Sources

- OpenAI Build Week rules: https://openai.devpost.com/rules
- OpenAI Build Week overview and rubric: https://openai.devpost.com/
- Codex plugin hook trust behavior: https://developers.openai.com/codex/plugins/build/
- Strands AI Functions: https://github.com/strands-labs/ai-functions
- Microsoft Agent Governance Toolkit limitations: https://github.com/microsoft/agent-governance-toolkit/blob/main/docs/LIMITATIONS.md
- LangSmith multi-turn online evaluators: https://docs.langchain.com/langsmith/online-evaluations-multi-turn
