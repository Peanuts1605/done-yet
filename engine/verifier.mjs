import { createHash } from "node:crypto";
import { deepEqual, readPointer, stableJson } from "./pointers.mjs";

const ALLOWED_ASSERTIONS = new Set(["exists", "equals", "count", "relation", "unchanged"]);

export function validateContract(contract) {
  const errors = [];
  if (!contract || typeof contract !== "object") errors.push("contract must be an object");
  if (!contract?.id || typeof contract.id !== "string") errors.push("contract.id is required");
  if (!Array.isArray(contract?.checks) || contract.checks.length === 0) {
    errors.push("contract.checks must contain at least one check");
  }

  for (const [index, check] of (contract?.checks ?? []).entries()) {
    if (!check?.id) errors.push(`checks[${index}].id is required`);
    if (!ALLOWED_ASSERTIONS.has(check?.assertion)) {
      errors.push(`checks[${index}].assertion is unsupported`);
    }
    if (typeof check?.path !== "string") errors.push(`checks[${index}].path is required`);
  }

  return errors;
}

function hash(value) {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

function valuesAtCollection(collection) {
  if (Array.isArray(collection)) return collection;
  if (collection && typeof collection === "object") return Object.values(collection);
  return [];
}

function matchesWhere(value, where = {}) {
  return value && typeof value === "object" && Object.entries(where).every(([key, expected]) => deepEqual(value[key], expected));
}

function runCheck(check, before, after) {
  const afterRead = readPointer(after, check.path);
  let actual;
  let passed = false;
  let expected;

  switch (check.assertion) {
    case "exists":
      actual = afterRead.found;
      expected = check.expected ?? true;
      passed = actual === expected;
      break;
    case "equals":
      actual = afterRead.value;
      expected = check.expected;
      passed = afterRead.found && deepEqual(actual, expected);
      break;
    case "count": {
      const matches = valuesAtCollection(afterRead.value).filter((item) => matchesWhere(item, check.where));
      actual = matches.length;
      expected = check.expected;
      passed = afterRead.found && actual === expected;
      break;
    }
    case "relation": {
      const right = readPointer(after, check.equalsPath);
      actual = { left: afterRead.value, right: right.value };
      expected = "values match";
      passed = afterRead.found && right.found && deepEqual(afterRead.value, right.value);
      break;
    }
    case "unchanged": {
      const beforeRead = readPointer(before, check.path);
      actual = afterRead.value;
      expected = beforeRead.value;
      passed = beforeRead.found === afterRead.found && deepEqual(beforeRead.value, afterRead.value);
      break;
    }
  }

  return {
    id: check.id,
    label: check.label,
    assertion: check.assertion,
    path: check.path,
    status: passed ? "PASS" : "FAIL",
    expected,
    actual,
  };
}

export function verifyOutcome({ contract, before, after, retry, agentClaim = null, scenario = null }) {
  const contractErrors = validateContract(contract);
  if (contractErrors.length > 0) {
    return {
      verdict: "HOLD",
      reason: "Contract is not executable",
      errors: contractErrors,
      checks: [],
    };
  }

  const checks = contract.checks.map((check) => runCheck(check, before, after));

  if (Array.isArray(contract.retryStablePaths) && contract.retryStablePaths.length > 0) {
    if (!retry) {
      checks.push({
        id: "retry-state-available",
        label: "Retry state is available",
        assertion: "retry",
        status: "HOLD",
        expected: "retry state",
        actual: "missing",
      });
    } else {
      for (const path of contract.retryStablePaths) {
        const afterRead = readPointer(after, path);
        const retryRead = readPointer(retry, path);
        checks.push({
          id: `retry-stable:${path}`,
          label: `Retry leaves ${path} stable`,
          assertion: "retry",
          path,
          status: afterRead.found === retryRead.found && deepEqual(afterRead.value, retryRead.value) ? "PASS" : "FAIL",
          expected: afterRead.value,
          actual: retryRead.value,
        });
      }
    }
  }

  const hasHold = checks.some((check) => check.status === "HOLD");
  const hasFailure = checks.some((check) => check.status === "FAIL");
  const verdict = hasHold ? "HOLD" : hasFailure ? "FAIL" : "PASS";

  return {
    version: "done-yet.outcome-report/v0.1",
    scenario,
    verdict,
    summary: {
      passed: checks.filter((check) => check.status === "PASS").length,
      failed: checks.filter((check) => check.status === "FAIL").length,
      held: checks.filter((check) => check.status === "HOLD").length,
      total: checks.length,
    },
    checks,
    observed: {
      agentClaim,
      contractDigest: `sha256:${hash(contract)}`,
      beforeDigest: `sha256:${hash(before)}`,
      afterDigest: `sha256:${hash(after)}`,
      retryDigest: retry ? `sha256:${hash(retry)}` : null,
    },
    generatedAt: new Date().toISOString(),
  };
}
