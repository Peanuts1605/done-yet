import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { snapshotFilesystem } from "../adapters/filesystem.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI = path.join(ROOT, "bin", "done-yet.mjs");

async function runCli(args) {
  const child = spawn(process.execPath, [CLI, ...args], { stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
  child.stderr.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
  const code = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", resolve);
  });
  return { code, stdout, stderr };
}

test("filesystem snapshots capture real file state from explicit paths", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "done-yet-snapshot-"));
  try {
    await mkdir(path.join(root, "docs"));
    await writeFile(path.join(root, "docs", "STATUS.md"), "release: ready\n");

    const snapshot = await snapshotFilesystem({
      root,
      paths: ["missing.txt", "docs/STATUS.md", "docs/STATUS.md"],
      includeText: true,
    });

    assert.deepEqual(Object.keys(snapshot.files), ["docs/STATUS.md", "missing.txt"]);
    assert.equal(snapshot.files["docs/STATUS.md"].text, "release: ready\n");
    assert.equal(snapshot.files["docs/STATUS.md"].sha256.length, 64);
    assert.deepEqual(snapshot.files["missing.txt"], { exists: false });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("filesystem snapshots reject symlinks in every path component", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "done-yet-symlink-"));
  try {
    await symlink("/etc", path.join(root, "outside"));
    await assert.rejects(
      snapshotFilesystem({ root, paths: ["outside/passwd"], includeText: true }),
      /does not follow symlinks/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("filesystem snapshots reject paths outside their root", async () => {
  await assert.rejects(
    snapshotFilesystem({ root: process.cwd(), paths: ["../secret.txt"] }),
    /must stay inside the snapshot root/,
  );
  await assert.rejects(
    snapshotFilesystem({ root: process.cwd(), paths: ["/etc/passwd"] }),
    /must stay inside the snapshot root/,
  );
});

test("the snapshot CLI writes observations and rejects traversal", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "done-yet-cli-"));
  try {
    await writeFile(path.join(root, "STATUS.md"), "release: ready\n");
    const output = path.join(root, ".done-yet", "before.json");
    const captured = await runCli(["snapshot", root, output, "STATUS.md", "--text"]);
    assert.equal(captured.code, 0, captured.stderr);
    const snapshot = JSON.parse(await readFile(output, "utf8"));
    assert.equal(snapshot.files["STATUS.md"].text, "release: ready\n");

    const rejected = await runCli(["snapshot", root, output, "../secret.txt"]);
    assert.equal(rejected.code, 2);
    assert.match(rejected.stderr, /must stay inside the snapshot root/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("the verify CLI exposes PASS, FAIL, and HOLD exit codes", async () => {
  const fixture = path.join(ROOT, "fixtures", "refund");
  const common = ["verify", path.join(fixture, "contract.json"), path.join(fixture, "before.json")];
  const passed = await runCli([
    ...common,
    path.join(fixture, "good", "after.json"),
    "--retry",
    path.join(fixture, "good", "after-retry.json"),
  ]);
  const failed = await runCli([
    ...common,
    path.join(fixture, "false-success", "after.json"),
    "--retry",
    path.join(fixture, "false-success", "after-retry.json"),
  ]);
  const held = await runCli([...common, path.join(fixture, "good", "after.json")]);
  assert.equal(passed.code, 0, passed.stderr);
  assert.equal(failed.code, 1, failed.stderr);
  assert.equal(held.code, 2, held.stderr);
});
