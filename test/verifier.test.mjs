import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateContract, verifyOutcome } from "../engine/verifier.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURES = path.join(ROOT, "fixtures", "refund");

async function json(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function reportFor(scenario) {
  const [contract, before, after, retry] = await Promise.all([
    json(path.join(FIXTURES, "contract.json")),
    json(path.join(FIXTURES, "before.json")),
    json(path.join(FIXTURES, scenario, "after.json")),
    json(path.join(FIXTURES, scenario, "after-retry.json")),
  ]);
  return verifyOutcome({ contract, before, after, retry, agentClaim: "Everything worked", scenario });
}

for (const scenario of ["false-success", "partial-commit", "wrong-target", "duplicate-retry"]) {
  test(`${scenario} is rejected despite a success claim`, async () => {
    const report = await reportFor(scenario);
    assert.equal(report.verdict, "FAIL");
    assert.ok(report.summary.failed > 0);
  });
}

test("a timeout after commit passes when canonical state is correct", async () => {
  const report = await reportFor("timeout-after-commit");
  assert.equal(report.verdict, "PASS");
  assert.equal(report.summary.failed, 0);
});

test("the good scenario passes all checks", async () => {
  const report = await reportFor("good");
  assert.equal(report.verdict, "PASS");
  assert.equal(report.summary.passed, report.summary.total);
});

test("a missing retry state returns HOLD rather than an unsupported PASS", async () => {
  const [contract, before, after] = await Promise.all([
    json(path.join(FIXTURES, "contract.json")),
    json(path.join(FIXTURES, "before.json")),
    json(path.join(FIXTURES, "good", "after.json")),
  ]);
  const report = verifyOutcome({ contract, before, after });
  assert.equal(report.verdict, "HOLD");
});

test("a missing observation returns HOLD rather than an unsupported verdict", async () => {
  const [contract, before] = await Promise.all([
    json(path.join(FIXTURES, "contract.json")),
    json(path.join(FIXTURES, "before.json")),
  ]);
  for (const absent of [undefined, null]) {
    const report = verifyOutcome({ contract, before, after: absent, agentClaim: "All done" });
    assert.equal(report.verdict, "HOLD");
    assert.equal(report.reason, "Required observation is unavailable");
  }
});

test("an unobserved before state returns HOLD instead of throwing", async () => {
  const [contract, after] = await Promise.all([
    json(path.join(FIXTURES, "contract.json")),
    json(path.join(FIXTURES, "good", "after.json")),
  ]);
  const report = verifyOutcome({ contract, before: undefined, after });
  assert.equal(report.verdict, "HOLD");
});

test("a protective-only contract cannot award a PASS on absent state", () => {
  const protectiveOnly = {
    id: "protective-only",
    checks: [
      { id: "c1", label: "Protected config untouched", assertion: "unchanged", path: "/config/prod" },
      { id: "c2", label: "Billing untouched", assertion: "unchanged", path: "/billing/rates" },
    ],
  };
  for (const state of [null, {}]) {
    const report = verifyOutcome({ contract: protectiveOnly, before: state, after: state, agentClaim: "I changed nothing" });
    assert.notEqual(report.verdict, "PASS");
    assert.equal(report.verdict, "HOLD");
  }
});

test("a contract with no positive assertion is not executable", () => {
  const errors = validateContract({
    id: "protective-only",
    checks: [{ id: "c1", assertion: "unchanged", path: "/config/prod" }],
  });
  assert.ok(errors.some((error) => error.includes("non-protective assertion")));
});

test("malformed contract structures return HOLD instead of throwing", () => {
  for (const checks of [{}, "not-an-array"]) {
    const report = verifyOutcome({ contract: { id: "malformed", checks }, before: {}, after: {} });
    assert.equal(report.verdict, "HOLD");
    assert.equal(report.reason, "Contract is not executable");
  }
});

test("invalid contract pointers return HOLD before evaluation", () => {
  const contracts = [
    { id: "bad-path", checks: [{ id: "c1", assertion: "equals", path: "not-a-pointer", expected: true }] },
    { id: "bad-relation", checks: [{ id: "c1", assertion: "relation", path: "/left" }] },
    {
      id: "bad-retry-path",
      checks: [{ id: "c1", assertion: "exists", path: "/result" }],
      retryStablePaths: ["not-a-pointer"],
    },
  ];
  for (const contract of contracts) {
    const report = verifyOutcome({ contract, before: {}, after: {} });
    assert.equal(report.verdict, "HOLD");
    assert.equal(report.reason, "Contract is not executable");
  }
});
