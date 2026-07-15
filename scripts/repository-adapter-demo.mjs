import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { snapshotFilesystem } from "../adapters/filesystem.mjs";
import { verifyOutcome } from "../engine/verifier.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTRACT_FILE = path.join(ROOT, "fixtures", "repository", "contract.json");
const OBSERVED_PATHS = ["docs/STATUS.md", "src/config.js"];

function printResult(label, report) {
  console.log(`${label.padEnd(28)} ${report.verdict.padEnd(4)} ${report.summary.passed}/${report.summary.total}`);
  for (const check of report.checks.filter((item) => item.status !== "PASS")) {
    console.log(`  ${check.status.padEnd(4)} ${check.label}`);
  }
}

const workspace = await mkdtemp(path.join(os.tmpdir(), "done-yet-repository-"));

try {
  await Promise.all([
    mkdir(path.join(workspace, "docs"), { recursive: true }),
    mkdir(path.join(workspace, "src"), { recursive: true }),
  ]);
  await Promise.all([
    writeFile(path.join(workspace, "docs", "STATUS.md"), "release: pending\n"),
    writeFile(path.join(workspace, "src", "config.js"), "export const region = \"us-east\";\n"),
  ]);

  const contract = JSON.parse(await readFile(CONTRACT_FILE, "utf8"));
  const before = await snapshotFilesystem({ root: workspace, paths: OBSERVED_PATHS, includeText: true });

  const unchangedAfter = await snapshotFilesystem({ root: workspace, paths: OBSERVED_PATHS, includeText: true });
  const falseClaim = verifyOutcome({
    contract,
    before,
    after: unchangedAfter,
    retry: unchangedAfter,
    scenario: "repository-false-success",
    agentClaim: "Release status updated successfully",
  });

  await Promise.all([
    writeFile(path.join(workspace, "docs", "STATUS.md"), "release: ready\n"),
    writeFile(path.join(workspace, "src", "config.js"), "export const region = \"eu-west\";\n"),
  ]);
  const collateralAfter = await snapshotFilesystem({ root: workspace, paths: OBSERVED_PATHS, includeText: true });
  const collateralRetry = await snapshotFilesystem({ root: workspace, paths: OBSERVED_PATHS, includeText: true });
  const collateralChange = verifyOutcome({
    contract,
    before,
    after: collateralAfter,
    retry: collateralRetry,
    scenario: "repository-collateral-change",
    agentClaim: "Release status updated successfully",
  });

  await writeFile(path.join(workspace, "src", "config.js"), "export const region = \"us-east\";\n");
  await writeFile(path.join(workspace, "docs", "STATUS.md"), "release: ready\n");
  const after = await snapshotFilesystem({ root: workspace, paths: OBSERVED_PATHS, includeText: true });
  await writeFile(path.join(workspace, "docs", "STATUS.md"), "release: ready\n");
  const retry = await snapshotFilesystem({ root: workspace, paths: OBSERVED_PATHS, includeText: true });
  const repaired = verifyOutcome({
    contract,
    before,
    after,
    retry,
    scenario: "repository-repaired",
    agentClaim: "Release status updated successfully",
  });

  console.log("\nDONE YET?  REAL REPOSITORY ADAPTER\n");
  printResult("Confident claim, no edit", falseClaim);
  printResult("Correct file, config touched", collateralChange);
  printResult("Repaired and retry-stable", repaired);
  console.log("\nLive filesystem snapshots captured; temporary repository removed after proof.");

  if (falseClaim.verdict !== "FAIL" || collateralChange.verdict !== "FAIL" || repaired.verdict !== "PASS") {
    process.exitCode = 1;
  }
} finally {
  await rm(workspace, { recursive: true, force: true });
}
