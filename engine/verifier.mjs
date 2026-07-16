import { createHash } from "node:crypto";
import { deepEqual, readPointer, stableJson } from "./pointers.mjs";

const ALLOWED_ASSERTIONS = new Set(["exists", "equals", "count", "relation", "unchanged"]);

// "unchanged" is protective: it can prove nothing broke, but it can never prove
// the requested work happened. A contract built only from protective checks
// cannot substantiate a completion claim, so it is not executable as a
// postcondition contract.
const PROTECTIVE_ASSERTIONS = new Set(["unchanged"]);

function isJsonPointer(value) {
  return typeof value === "string" && (value === "" || value.startsWith("/"));
}

export function validateContract(contract) {
  const errors = [];
  const checks = Array.isArray(contract?.checks) ? contract.checks : [];
  if (!contract || typeof contract !== "object") errors.push("contract must be an object");
  if (!contract?.id || typeof contract.id !== "string") errors.push("contract.id is required");
  if (checks.length === 0) {
    errors.push("contract.checks must contain at least one check");
  }

  for (const [index, check] of checks.entries()) {
    if (!check?.id) errors.push(`checks[${index}].id is required`);
    if (!ALLOWED_ASSERTIONS.has(check?.assertion)) {
      errors.push(`checks[${index}].assertion is unsupported`);
    }
    if (typeof check?.path !== "string") {
      errors.push(`checks[${index}].path is required`);
    } else if (!isJsonPointer(check.path)) {
      errors.push(`checks[${index}].path must be a JSON pointer`);
    }
    if (check?.assertion === "relation" && !isJsonPointer(check.equalsPath)) {
      errors.push(`checks[${index}].equalsPath must be a JSON pointer`);
    }
  }

  const hasPositiveAssertion = checks.some(
    (check) => ALLOWED_ASSERTIONS.has(check?.assertion) && !PROTECTIVE_ASSERTIONS.has(check?.assertion),
  );
  if (checks.length > 0 && !hasPositiveAssertion) {
    errors.push("contract.checks must contain at least one non-protective assertion");
  }

  if (contract?.retryStablePaths !== undefined && !Array.isArray(contract.retryStablePaths)) {
    errors.push("contract.retryStablePaths must be an array");
  }
  for (const [index, pointer] of (Array.isArray(contract?.retryStablePaths) ? contract.retryStablePaths : []).entries()) {
    if (!isJsonPointer(pointer)) errors.push(`retryStablePaths[${index}] must be a JSON pointer`);
  }

  return errors;
}

function isObserved(state) {
  return state !== null && state !== undefined;
}

export function validateObservation(before, after) {
  const errors = [];
  if (!isObserved(before)) errors.push("before state was not observed");
  if (!isObserved(after)) errors.push("after state was not observed");
  return errors;
}

function hash(value) {
  return createHash("sha256").update(stableJson(value) ?? "undefined").digest("hex");
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

  // An absent observation is the most unsupported observation there is. Without
  // this gate, a contract whose checks all read missing state could report a
  // verdict that no evidence supports.
  const observationErrors = validateObservation(before, after);
  if (observationErrors.length > 0) {
    return {
      verdict: "HOLD",
      reason: "Required observation is unavailable",
      errors: observationErrors,
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
