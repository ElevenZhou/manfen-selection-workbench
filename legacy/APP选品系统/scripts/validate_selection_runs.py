#!/usr/bin/env python3
"""Validate selection bundles against project JSON Schemas and file checks."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlparse


def type_matches(value: object, expected: str) -> bool:
    return {
        "null": value is None,
        "object": isinstance(value, dict),
        "array": isinstance(value, list),
        "string": isinstance(value, str),
        "number": isinstance(value, (int, float)) and not isinstance(value, bool),
        "integer": isinstance(value, int) and not isinstance(value, bool),
        "boolean": isinstance(value, bool),
    }[expected]


def validate(value: object, schema: dict, path: str = "$") -> None:
    if "const" in schema and value != schema["const"]:
        raise ValueError(f"{path}: expected const {schema['const']!r}")
    if "enum" in schema and value not in schema["enum"]:
        raise ValueError(f"{path}: value not in enum")
    expected = schema.get("type")
    if expected:
        allowed = expected if isinstance(expected, list) else [expected]
        if not any(type_matches(value, item) for item in allowed):
            raise ValueError(f"{path}: expected {allowed}, got {type(value).__name__}")
    if value is None:
        return
    if isinstance(value, dict):
        for key in schema.get("required", []):
            if key not in value:
                raise ValueError(f"{path}: missing required {key}")
        properties = schema.get("properties", {})
        for key, item in value.items():
            if key in properties:
                validate(item, properties[key], f"{path}.{key}")
            elif schema.get("additionalProperties") is False:
                raise ValueError(f"{path}: unexpected property {key}")
            elif isinstance(schema.get("additionalProperties"), dict):
                validate(item, schema["additionalProperties"], f"{path}.{key}")
    if isinstance(value, list):
        if len(value) < schema.get("minItems", 0):
            raise ValueError(f"{path}: too few items")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            raise ValueError(f"{path}: too many items")
        if schema.get("uniqueItems") and len({json.dumps(item, sort_keys=True) for item in value}) != len(value):
            raise ValueError(f"{path}: duplicate items")
        if "items" in schema:
            for index, item in enumerate(value):
                validate(item, schema["items"], f"{path}[{index}]")
    if isinstance(value, str):
        if len(value) < schema.get("minLength", 0):
            raise ValueError(f"{path}: string too short")
        if "pattern" in schema and re.search(schema["pattern"], value) is None:
            raise ValueError(f"{path}: pattern mismatch")
        fmt = schema.get("format")
        if fmt == "uri":
            parsed = urlparse(value)
            if not parsed.scheme or not parsed.netloc:
                raise ValueError(f"{path}: invalid URI")
        elif fmt == "date":
            date.fromisoformat(value)
        elif fmt == "date-time":
            datetime.fromisoformat(value.replace("Z", "+00:00"))
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if "minimum" in schema and value < schema["minimum"]:
            raise ValueError(f"{path}: below minimum")
        if "maximum" in schema and value > schema["maximum"]:
            raise ValueError(f"{path}: above maximum")
    for child in schema.get("allOf", []):
        condition = child.get("if")
        applies = True
        if condition:
            try:
                validate(value, condition, path)
            except ValueError:
                applies = False
        if applies and "then" in child:
            validate(value, child["then"], path)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project-root", required=True)
    args = parser.parse_args()
    root = Path(args.project_root).expanduser().resolve()
    schemas = {
        name: json.loads((root / "schemas" / f"{name}.schema.json").read_text(encoding="utf-8"))
        for name in ("website-report", "opportunity-candidate", "reference-evidence", "signal-event", "workbench-package")
    }
    index = json.loads((root / "outputs" / "selection-runs" / "index.json").read_text(encoding="utf-8"))
    counts = {"runs": 0, "websites": 0, "candidates": 0, "evidence": 0, "signals": 0, "packages": 0, "archives": 0}
    for entry in index:
        run = root / entry["path"]
        website = json.loads((run / "05-publish" / "website-report.json").read_text(encoding="utf-8"))
        validate(website, schemas["website-report"])
        counts["websites"] += 1
        candidates = json.loads((run / "02-routes" / "candidates.json").read_text(encoding="utf-8"))
        for candidate in candidates:
            validate(candidate, schemas["opportunity-candidate"], candidate["candidate_id"])
            counts["candidates"] += 1
        evidence = json.loads((run / "01-research" / "evidence.json").read_text(encoding="utf-8"))
        for item in evidence:
            validate(item, schemas["reference-evidence"], item["evidence_id"])
            counts["evidence"] += 1
        signals = json.loads((run / "01-research" / "signals.json").read_text(encoding="utf-8"))
        for item in signals:
            validate(item, schemas["signal-event"], item["signal_id"])
            counts["signals"] += 1
        known_signals = {item["signal_id"] for item in signals}
        for candidate in candidates:
            if candidate["source_engine"] == "emerging_demand":
                if len(candidate["signal_ids"]) < 3 or not set(candidate["signal_ids"]).issubset(known_signals):
                    raise ValueError(f"{candidate['candidate_id']}: missing three linked leading signals")
        manifests = sorted((run / "04-packages").glob("pkg-*/manifest.json"))
        archives = sorted((run / "04-packages").glob("*.zip"))
        if len(manifests) != len(candidates) or len(archives) != len(candidates):
            raise ValueError(f"{entry['run_id']}: package/archive count mismatch")
        for manifest in manifests:
            validate(json.loads(manifest.read_text(encoding="utf-8")), schemas["workbench-package"], str(manifest))
            counts["packages"] += 1
        for archive in archives:
            expected = archive.with_suffix(".zip.sha256").read_text(encoding="utf-8").split()[0]
            actual = hashlib.sha256(archive.read_bytes()).hexdigest()
            if actual != expected:
                raise ValueError(f"{archive}: checksum mismatch")
            public = root / "site" / "public" / "packages" / entry["run_id"] / archive.name
            if not public.exists() or hashlib.sha256(public.read_bytes()).hexdigest() != actual:
                raise ValueError(f"{archive}: public download mismatch")
            counts["archives"] += 1
        counts["runs"] += 1
    print(json.dumps(counts, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
