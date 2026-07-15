import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";

function normalizeRelativePath(value) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("filesystem paths must be non-empty strings");
  }

  const normalized = path.posix.normalize(value.replaceAll("\\", "/"));
  if (path.posix.isAbsolute(normalized) || normalized === "." || normalized === ".." || normalized.startsWith("../")) {
    throw new Error(`filesystem path must stay inside the snapshot root: ${value}`);
  }
  return normalized;
}

function digest(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function decodeUtf8(buffer) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return null;
  }
}

async function observePath(root, relativePath, options) {
  const target = path.resolve(root, relativePath);
  const rootPrefix = `${root}${path.sep}`;
  if (!target.startsWith(rootPrefix)) {
    throw new Error(`filesystem path must stay inside the snapshot root: ${relativePath}`);
  }

  let cursor = root;
  let stat = null;
  for (const segment of relativePath.split("/")) {
    cursor = path.join(cursor, segment);
    try {
      stat = await lstat(cursor);
    } catch (error) {
      if (error?.code === "ENOENT" || error?.code === "ENOTDIR") return { exists: false };
      throw error;
    }
    if (stat.isSymbolicLink()) {
      throw new Error(`filesystem snapshot does not follow symlinks: ${relativePath}`);
    }
  }

  if (stat.isDirectory()) return { exists: true, type: "directory" };
  if (!stat.isFile()) return { exists: true, type: "other" };

  const contents = await readFile(target);
  const observation = {
    exists: true,
    type: "file",
    bytes: contents.byteLength,
    sha256: digest(contents),
  };

  if (options.includeText && contents.byteLength <= options.maxTextBytes) {
    const text = decodeUtf8(contents);
    if (text !== null) observation.text = text;
  }

  return observation;
}

export async function snapshotFilesystem({ root, paths, includeText = false, maxTextBytes = 64 * 1024 }) {
  if (!Array.isArray(paths) || paths.length === 0) {
    throw new Error("snapshot requires at least one filesystem path");
  }

  const rootPath = await realpath(path.resolve(root));
  const normalizedPaths = [...new Set(paths.map(normalizeRelativePath))].sort();
  const files = {};
  for (const relativePath of normalizedPaths) {
    files[relativePath] = await observePath(rootPath, relativePath, { includeText, maxTextBytes });
  }

  return {
    version: "done-yet.filesystem-snapshot/v0.1",
    root: path.basename(rootPath),
    files,
  };
}
