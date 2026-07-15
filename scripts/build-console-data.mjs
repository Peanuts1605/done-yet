import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyOutcome } from "../engine/verifier.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURES = path.join(ROOT, "fixtures", "refund");
const OUTPUT = path.join(ROOT, "apps", "console", "public", "data", "demo.json");

const definitions = [
  { id: "false-success", name: "False success", short: "Nothing committed", claim: "Refund and ticket closeout completed successfully.", insight: "The tool returned OK, but neither system changed." },
  { id: "partial-commit", name: "Partial commit", short: "Ticket left open", claim: "Refund ORD-17 for $42 has been issued as REF-17 and TKT-17 has been closed.", insight: "The refund exists, but TKT-17 is still open and not linked to it." },
  { id: "wrong-target", name: "Wrong target", short: "ORD-99 changed", claim: "ORD-17 was refunded and its ticket was closed.", insight: "The refund points to ORD-99, and the unrelated order changed." },
  { id: "duplicate-retry", name: "Duplicate retry", short: "Second refund created", claim: "The retry was safe; the existing refund was reused.", insight: "The first run looks correct, but retry creates REF-18 and relinks the ticket." },
  { id: "timeout-after-commit", name: "Timeout after commit", short: "State is correct", claim: "The upstream call timed out, so completion is uncertain.", insight: "The call timed out, but the ticket, ledger, and retry state are correct." },
  { id: "good", name: "Repaired run", short: "All systems agree", claim: "ORD-17 is refunded, TKT-17 is closed, and retry is stable.", insight: "Ticket and ledger agree, unrelated records are untouched, and retry is stable." },
];

async function json(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

const [contract, before] = await Promise.all([
  json(path.join(FIXTURES, "contract.json")),
  json(path.join(FIXTURES, "before.json")),
]);

const scenarios = [];
for (const definition of definitions) {
  const [after, retry] = await Promise.all([
    json(path.join(FIXTURES, definition.id, "after.json")),
    json(path.join(FIXTURES, definition.id, "after-retry.json")),
  ]);
  scenarios.push({
    ...definition,
    before,
    after,
    retry,
    report: verifyOutcome({ contract, before, after, retry, agentClaim: definition.claim, scenario: definition.id }),
  });
}

await mkdir(path.dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify({ contract, scenarios }, null, 2)}\n`);
console.log(`Wrote ${path.relative(ROOT, OUTPUT)}`);
