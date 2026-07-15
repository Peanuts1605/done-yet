#!/usr/bin/env python3
"""Small repository-local validator for the distributable Codex plugin shape."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PLUGIN = ROOT / "plugins" / "done-yet"


def load_json(path: Path):
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


manifest = load_json(PLUGIN / ".codex-plugin" / "plugin.json")
hooks = load_json(PLUGIN / "hooks" / "hooks.json")
skill_text = (PLUGIN / "skills" / "done-yet" / "SKILL.md").read_text(encoding="utf-8")

frontmatter = skill_text.split("---", 2)[1]
skill = {}
for line in frontmatter.splitlines():
    key, separator, value = line.partition(":")
    if separator:
        skill[key.strip()] = value.strip()

assert manifest["name"] == "done-yet"
assert manifest["version"]
assert manifest["skills"] == "./skills/"
assert skill["name"] == "done-yet"
assert skill["description"]
assert hooks["hooks"]["Stop"][0]["hooks"][0]["command"].endswith("stop-guard.mjs\"")
assert (PLUGIN / "scripts" / "stop-guard.mjs").is_file()

print("Done Yet? plugin shape: PASS")
