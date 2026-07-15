#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { snapshotFilesystem } from "../adapters/filesystem.mjs";
import { verifyOutcome } from "../engine/verifier.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE_ROOT = path.join(ROOT, "fixtures", "refund");

async function readJson(file) {
  return JSON.parse(await readFile(path.resolve(file), "utf8"));
}

async function verifyFiles(contractFile, beforeFile, afterFile, options = {}) {
  const [contract, before, after, retry] = await Promise.all([
    readJson(contractFile),
    readJson(beforeFile),
    readJson(afterFile),
    options.retry ? readJson(options.retry) : null,
  ]);

  const report = verifyOutcome({
    contract,
    before,
    after,
    retry,
    agentClaim: options.agentClaim ?? "Task completed successfully",
    scenario: options.scenario ?? path.basename(path.dirname(path.resolve(afterFile))),
  });

  if (options.out) {
    await mkdir(path.dirname(path.resolve(options.out)), { recursive: true });
    await writeFile(path.resolve(options.out), `${JSON.stringify(report, null, 2)}\n`);
  }
  return report;
}

function printReport(report) {
  const mark = report.verdict === "PASS" ? "PASS" : report.verdict === "FAIL" ? "FAIL" : "HOLD";
  console.log(`\nDONE YET?  ${mark}`);
  console.log(`${report.summary?.passed ?? 0}/${report.summary?.total ?? 0} checks passed`);
  for (const check of report.checks ?? []) {
    console.log(`  ${check.status.padEnd(4)}  ${check.label ?? check.id}`);
  }
  if (report.observed?.agentClaim) console.log(`\nAgent claim: ${report.observed.agentClaim}`);
  console.log(`Verdict: ${report.verdict}\n`);
}

function parseOptions(args) {
  const positional = [];
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === "--retry" || value === "--out" || value === "--claim" || value === "--scenario") {
      options[value.slice(2)] = args[index + 1];
      index += 1;
    } else {
      positional.push(value);
    }
  }
  return { positional, options };
}

async function runScenario(name) {
  const scenarioRoot = path.join(FIXTURE_ROOT, name);
  return verifyFiles(
    path.join(FIXTURE_ROOT, "contract.json"),
    path.join(FIXTURE_ROOT, "before.json"),
    path.join(scenarioRoot, "after.json"),
    {
      retry: path.join(scenarioRoot, "after-retry.json"),
      scenario: name,
      agentClaim: "Refund and ticket closeout completed successfully",
    },
  );
}

async function main() {
  const [command = "demo", ...args] = process.argv.slice(2);

  if (command === "snapshot") {
    const includeText = args.includes("--text");
    const positional = args.filter((value) => value !== "--text");
    if (positional.length < 3) {
      throw new Error("Usage: done-yet snapshot <root> <out> <path...> [--text]");
    }
    const [root, out, ...paths] = positional;
    const snapshot = await snapshotFilesystem({ root, paths, includeText });
    await mkdir(path.dirname(path.resolve(out)), { recursive: true });
    await writeFile(path.resolve(out), `${JSON.stringify(snapshot, null, 2)}\n`);
    console.log(`Observed ${paths.length} path${paths.length === 1 ? "" : "s"} into ${path.resolve(out)}`);
    return;
  }

  if (command === "verify") {
    const { positional, options } = parseOptions(args);
    if (positional.length < 3) {
      throw new Error("Usage: done-yet verify <contract> <before> <after> [--retry <state>] [--out <report>]");
    }
    const report = await verifyFiles(positional[0], positional[1], positional[2], {
      retry: options.retry,
      out: options.out,
      scenario: options.scenario,
      agentClaim: options.claim,
    });
    printReport(report);
    process.exitCode = report.verdict === "PASS" ? 0 : report.verdict === "FAIL" ? 1 : 2;
    return;
  }

  if (command === "matrix" || command === "demo") {
    const scenarios = ["false-success", "partial-commit", "wrong-target", "duplicate-retry", "timeout-after-commit", "good"];
    const reports = [];
    for (const scenario of scenarios) reports.push(await runScenario(scenario));

    if (command === "demo") {
      for (const report of reports) printReport(report);
    } else {
      console.table(reports.map((report) => ({ scenario: report.scenario, verdict: report.verdict, passed: `${report.summary.passed}/${report.summary.total}` })));
    }

    const expected = {
      "false-success": "FAIL",
      "partial-commit": "FAIL",
      "wrong-target": "FAIL",
      "duplicate-retry": "FAIL",
      "timeout-after-commit": "PASS",
      good: "PASS",
    };
    process.exitCode = reports.every((report) => report.verdict === expected[report.scenario]) ? 0 : 1;
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(`Done Yet? ${error.message}`);
  process.exitCode = 2;
});
