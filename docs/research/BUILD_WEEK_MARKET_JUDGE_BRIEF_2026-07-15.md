# Done Yet? - OpenAI Build Week Market and Judge Brief

## Decision

Build a new Developer Tools entry named **Done Yet?**.

Positioning: **The agent said done. Done Yet? checks the systems.**

The product is not a trace viewer, generic evaluator, or trust dashboard. Its narrow job is to independently probe canonical post-state after an agent mutates a system, then show whether required changes happened, forbidden changes did not happen, cross-system relationships hold, and retries are idempotent.

## Why this wedge

The market already has mature tracing and evaluation platforms: OpenAI trace grading and agent evals, Braintrust, LangSmith, Phoenix, Langfuse, Opik, Promptfoo, DeepEval, OpenInference, and Playwright. Hugging Face also hosts rich agent traces, verifier benchmarks, process judges, evidence-selection research, and replay environments.

The less productized gap is a compact acceptance workflow that binds one concrete task to independently observed system state. The useful contrast is:

> Traces explain what the agent attempted. Done Yet? tests whether the intended outcome actually happened.

This is workflow and product differentiation, not an uncopyable technical moat.

## Build Week fit

- Track: Developer Tools.
- Required technology: Codex and GPT-5.6 are structural, not decorative.
- Judging: technological implementation, product completeness, impact, and novelty are weighted equally; implementation breaks ties.
- Demo requirement: public video up to three minutes, working repository, setup instructions, and a judge-friendly test path.
- Deadline: July 21, 2026 at 5:00 PM PT / 8:00 PM ET.

## Canonical demo

Task: refund order `ORD-17` for `$42` and close `TKT-17` only after identity verification.

Acceptance contract:

1. Exactly one refund exists for `ORD-17` at `$42`.
2. `TKT-17` is closed and references that refund.
3. The verified customer and order relationship remains correct.
4. `ORD-99` and its ticket remain unchanged.
5. Retrying the action creates no duplicate refund or extra mutation.

Fault gallery:

- false success: tool reports success but commits nothing;
- partial commit: refund exists but ticket remains open;
- wrong target: correct amount is applied to `ORD-99`;
- duplicate retry: the second run creates another refund;
- timeout after commit: the tool times out, but canonical state is correct.

The last case is important: the verifier judges state rather than trusting either a success message or an error message.

## Judge experience

Within three minutes a judge should be able to:

1. run one command with no credentials;
2. see a confident agent claim beside authoritative before/after state;
3. watch a false-success scenario receive `FAIL` with the exact failed assertion;
4. switch to the repaired run and receive `PASS`;
5. rerun the same task and see idempotency remain intact;
6. inspect the contract and exported result without rebuilding the app.

## Claims discipline

Do not claim first, only, tamper-proof, production-safe, framework-agnostic, independent ground truth, or deterministic evaluation when an LLM contributes to a verdict. Done Yet? can accurately claim deterministic postcondition checks over the supported synthetic systems in the demo.

## Competitive lessons applied

- OpenAI and OpenInference: use inspectable traces and clear model/tool boundaries.
- Playwright and Promptfoo: make assertions runnable and judge-friendly.
- AgentEvals and verifier benchmarks: separate trajectory quality from outcome correctness.
- SmartSnap: show the smallest decisive evidence, not a wall of logs.
- in-toto: hash and version the contract and observed inputs without overstating what the digest proves.
- Prior hackathon winners: show one costly failure, one closed loop, one visible result, and one repeatable test.

## Go gate

Proceed only if the first verifier catches at least four false-success classes and produces the same verdict across three clean runs. A polished dashboard cannot compensate for a weak verification core.

## Sources

- OpenAI Build Week rules, FAQ, resources, updates, and official judging rubric.
- OpenAI Agent Evals, trace grading, programmatic tool calling, and GPT-5.6 documentation.
- GitHub: OpenAI Agents SDK, OpenAI Evals, AgentEvals, DeepEval, Promptfoo, Langfuse, Phoenix, Opik, OpenInference, OpenLLMetry, BrowserGym, Playwright, Puppeteer Replay, Hercules, and in-toto attestations.
- Hugging Face: Agent Traces, Trace Commons, AgentRewardBench, CUAVerifierBench, AgentProcessBench, SmartSnap, AJ-Bench, ANCHOR, FutureSim, and QuantSafe Certifier.
- Official and verified Devpost winners including RoboChef, Krates, plzfix.ai, Bota, e-ink-sim, CodeDecoder, Memory Palace, and A Printer for Smell.
