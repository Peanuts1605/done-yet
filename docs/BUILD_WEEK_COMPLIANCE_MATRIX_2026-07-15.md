# OpenAI Build Week Compliance Matrix

Verified against the official rules and FAQ on July 15, 2026.

## Entry fit

| Requirement | Evidence | Status |
| --- | --- | --- |
| Enter one category | Developer Tools is the declared track. | Ready |
| Use Codex and GPT-5.6 meaningfully | Codex built the verifier, fixtures, plugin, console, QA, and evidence pack. GPT-5.6 turns intent into a typed contract and can explain repairs; deterministic checks issue the verdict. | Ready |
| New work during the submission period | The repository and dated commit history show the project was built from scratch on July 15, 2026. | Ready |
| Working, runnable project | The public console is live and the repository passes the documented verification command. | Ready |

## Submission materials

| Requirement | Evidence | Status |
| --- | --- | --- |
| Text description | `docs/SUBMISSION_DRAFT.md` | Ready |
| Public YouTube demo under three minutes | The 108.309-second video is uploaded and processed, currently private. | Needs publication |
| Demo audio covers the build, Codex, and GPT-5.6 | `demo/voiceover.txt` names the Codex plugin and explains the GPT-5.6 interpretation boundary. | Ready |
| Public repository with relevant licensing | https://github.com/Peanuts1605/done-yet | Ready |
| README explains setup, testing, Codex collaboration, and GPT-5.6 | `README.md` | Ready |
| Developer-tool installation instructions | The README documents Node.js setup and Codex plugin installation. | Ready |
| Judge test path without rebuilding | https://done-yet.pages.dev/ exposes all six synthetic fixtures. | Ready |
| `/feedback` Session ID | Primary build thread identified as `019ee0dc-d43c-7160-82ca-0cf8120952a8`; the explicit `/feedback` step still needs to be recorded. | Pending |
| Devpost registration and eligibility profile | Non-personal fields are staged. Location and birth month/year are missing. | Pending owner facts |

## Judge criteria

| Criterion | Strongest evidence |
| --- | --- |
| Technological Implementation | One verifier powers the CLI, tests, six fixtures, public console, and opt-in Codex hook. |
| Design | A complete judge console exposes scenarios, observed state, failed checks, contract details, JSON, copy, and export. |
| Potential Impact | Developers can detect false completion, partial commits, wrong-target mutation, duplicate retries, and timeout ambiguity. |
| Quality of the Idea | The product verifies postconditions instead of scoring agent confidence or replaying traces. |

## Final gate

Submission can proceed as soon as the YouTube draft is published, the Devpost eligibility facts are completed, the session ID is entered, and the final form is reviewed and submitted.

## Official sources

- Rules: https://openai.devpost.com/rules
- FAQ: https://openai.devpost.com/details/faqs
- Updates: https://openai.devpost.com/updates
