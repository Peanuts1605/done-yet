import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { verifyOutcome } from "../engine/verifier.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GUARD = path.join(ROOT, "plugins", "done-yet", "scripts", "stop-guard.mjs");

async function runGuard(cwd) {
  const child = spawn(process.execPath, [GUARD], { stdio: ["pipe", "pipe", "pipe"] });
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
  child.stderr.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
  child.stdin.end(JSON.stringify({ cwd }));

  const code = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", resolve);
  });
  assert.equal(code, 0, stderr);
  return stdout.trim() ? JSON.parse(stdout) : null;
}

test("the Stop hook only allows a fresh PASS for the current contract", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "done-yet-hook-"));
  try {
    assert.equal(await runGuard(root), null, "projects without a contract stay untouched");

    const doneYet = path.join(root, ".done-yet");
    await mkdir(doneYet);
    const contract = {
      version: "done-yet.outcome-contract/v0.1",
      id: "hook-proof",
      checks: [{ id: "ready", label: "Status is ready", assertion: "equals", path: "/status", expected: "ready" }],
    };
    await writeFile(path.join(doneYet, "contract.json"), `${JSON.stringify(contract)}\n`);

    const missingReport = await runGuard(root);
    assert.equal(missingReport.continue, false);
    assert.match(missingReport.stopReason, /no outcome report/);

    const report = verifyOutcome({ contract, before: { status: "pending" }, after: { status: "ready" } });
    await writeFile(path.join(doneYet, "latest-report.json"), `${JSON.stringify(report)}\n`);
    assert.equal(await runGuard(root), null, "a fresh PASS for the current contract allows closeout");

    await writeFile(
      path.join(doneYet, "contract.json"),
      `${JSON.stringify({ ...contract, title: "Changed after verification" })}\n`,
    );
    const changedContract = await runGuard(root);
    assert.equal(changedContract.continue, false);
    assert.match(changedContract.stopReason, /contract changed after verification/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
