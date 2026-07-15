#!/usr/bin/env node
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

async function stdinJson() {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  return input.trim() ? JSON.parse(input) : {};
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function digest(value) {
  return `sha256:${createHash("sha256").update(stableJson(value)).digest("hex")}`;
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

const hook = await stdinJson();
const cwd = hook.cwd || process.cwd();
const contractFile = path.join(cwd, ".done-yet", "contract.json");
const reportFile = path.join(cwd, ".done-yet", "latest-report.json");

if (!(await exists(contractFile))) process.exit(0);

if (!(await exists(reportFile))) {
  console.log(JSON.stringify({
    continue: false,
    stopReason: "Done Yet? has no outcome report for the active contract.",
    systemMessage: "Done Yet? is armed for this project. Run the postcondition checks and save .done-yet/latest-report.json before closing the task."
  }));
  process.exit(0);
}

try {
  const [contract, report] = await Promise.all([
    readFile(contractFile, "utf8").then(JSON.parse),
    readFile(reportFile, "utf8").then(JSON.parse),
  ]);
  const currentDigest = digest(contract);
  const reportDigest = report?.observed?.contractDigest;
  const freshEnough = Number.isFinite(Date.parse(report.generatedAt)) && Date.now() - Date.parse(report.generatedAt) < 30 * 60 * 1000;

  if (report.verdict === "PASS" && reportDigest === currentDigest && freshEnough) process.exit(0);

  const reason = report.verdict !== "PASS"
    ? `latest verdict is ${report.verdict ?? "missing"}`
    : reportDigest !== currentDigest
      ? "the acceptance contract changed after verification"
      : "the passing report is stale";

  console.log(JSON.stringify({
    continue: false,
    stopReason: `Done Yet? blocked closeout because ${reason}.`,
    systemMessage: `Done Yet? cannot support a completion claim yet: ${reason}. Rerun the active contract and inspect the failed checks.`
  }));
} catch (error) {
  console.log(JSON.stringify({
    continue: false,
    stopReason: "Done Yet? could not read the outcome report.",
    systemMessage: `Done Yet? report error: ${error.message}`
  }));
}
