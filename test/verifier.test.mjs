import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { verifyOutcome } from "../engine/verifier.mjs";

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
