# OpenAI Build Week Compliance Matrix

Verified against the official rules and FAQ on July 15, 2026.

## Entry fit

| Requirement | Evidence | Status |
| --- | --- | --- |
| Enter one category | Developer Tools is the declared track. | Ready |
| Use Codex and GPT-5.6 meaningfully | Codex built the verifier, fixtures, plugin, console, QA, and evidence pack. GPT-5.6 turns intent into a typed contract and can explain repairs; deterministic checks issue the verdict. | Ready |
| New work during the submission period | The repository and dated commit history show the project was built from scratch on July 15, 2026. | Ready |
| Working, runnable project | The public console is live, the real repository observer has a one-command proof, and the repository passes the documented verification command. | Ready |

## Submission materials

| Requirement | Evidence | Status |
| --- | --- | --- |
| Text description | `docs/SUBMISSION_DRAFT.md` | Ready |
| Public YouTube demo under three minutes | The 108.309-second video is public at https://youtu.be/fCkm2LJgihE and resolves through YouTube's unauthenticated oEmbed endpoint. | Ready |
| Demo audio covers the build, Codex, and GPT-5.6 | `demo/voiceover.txt` names the Codex plugin and explains the GPT-5.6 interpretation boundary. | Ready |
| Public repository with relevant licensing | https://github.com/Peanuts1605/done-yet | Ready |
| README explains setup, testing, Codex collaboration, human decisions, and GPT-5.6 | `README.md` | Ready |
| Developer-tool installation instructions | The README documents Node.js setup and Codex plugin installation. | Ready |
| Judge test path without rebuilding | https://done-yet.pages.dev/ exposes all six synthetic fixtures; `npm run demo:repo` exercises a live filesystem observer with no credentials. | Ready |
| `/feedback` Session ID | Provider-authoritative primary build session `019ee0dc-d43c-7160-82ca-0cf8120952a8` was entered; provenance is recorded in `docs/CODEX_SESSION_PROOF_2026-07-15.md`. | Submitted |
| Devpost registration and eligibility profile | Required entrant fields were completed in Devpost. | Submitted |
| Final Devpost entry | https://devpost.com/software/done-yet; Devpost displayed `Project submitted!` and `Submitted to OpenAI Build Week`. | Submitted |

## Judge criteria

| Criterion | Strongest evidence |
| --- | --- |
| Technological Implementation | One verifier powers the CLI, real filesystem observer, tests, six fixtures, public console, and tested opt-in Codex hook. |
| Design | A complete judge console exposes scenarios, observed state, failed checks, contract details, JSON, copy, and export. |
| Potential Impact | Developers can detect false completion against real repository files plus partial commits, wrong-target mutation, duplicate retries, and timeout ambiguity. |
| Quality of the Idea | The product verifies postconditions instead of scoring agent confidence or replaying traces. |

## Final gate

`PASS`: Done Yet? was submitted to OpenAI Build Week on `2026-07-16T02:05:45Z`. The public project, repository, demo, video, session ID, gallery, and judge instructions were present at submission.

## Official sources

- Rules: https://openai.devpost.com/rules
- FAQ: https://openai.devpost.com/details/faqs
- Updates: https://openai.devpost.com/updates
