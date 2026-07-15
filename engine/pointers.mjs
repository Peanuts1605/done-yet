export function readPointer(value, pointer) {
  if (pointer === "") return { found: true, value };
  if (typeof pointer !== "string" || !pointer.startsWith("/")) {
    throw new Error(`Invalid JSON pointer: ${pointer}`);
  }

  const segments = pointer
    .slice(1)
    .split("/")
    .map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"));

  let cursor = value;
  for (const segment of segments) {
    if (cursor === null || typeof cursor !== "object" || !(segment in cursor)) {
      return { found: false, value: undefined };
    }
    cursor = cursor[segment];
  }
  return { found: true, value: cursor };
}

export function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

export function deepEqual(left, right) {
  return stableJson(left) === stableJson(right);
}
