#!/usr/bin/env python3
"""Apply English + Chinese display names to current selection artifacts."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path


def dump(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def bilingual(name: str, chinese: str) -> str:
    return f"{name}（{chinese}）"


TARGET_PLATFORMS = {
    "mobile_app": ["iOS", "Android"],
    "mobile_game": ["iOS", "Android"],
    "web_app": ["Web"],
    "desktop_app": ["macOS", "Windows"],
    "cross_platform": ["Web", "macOS", "Windows", "iOS", "Android"],
}


def zip_package(package_dir: Path, archive_path: Path) -> str:
    with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(package_dir.rglob("*")):
            if path.is_file():
                archive.write(path, path.relative_to(package_dir.parent))
    digest = hashlib.sha256(archive_path.read_bytes()).hexdigest()
    archive_path.with_suffix(".zip.sha256").write_text(
        f"{digest}  {archive_path.name}\n",
        encoding="utf-8",
    )
    return digest


def write_csv(path: Path, rows: list[dict]) -> None:
    if not rows:
        return
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project-root", required=True)
    args = parser.parse_args()
    project = Path(args.project_root).expanduser().resolve()
    names = json.loads((project / "config" / "name-localizations.json").read_text(encoding="utf-8"))
    product_names: dict[str, str] = names["products"]
    reference_names: dict[str, str] = names["references"]
    store_links: dict[str, dict] = json.loads(
        (project / "config" / "reference-store-links.json").read_text(encoding="utf-8")
    )
    forms = json.loads(
        (project / "config" / "product-form-classifications.json").read_text(encoding="utf-8")
    )
    product_forms: dict[str, str] = forms["products"]
    reference_kinds: dict[str, str] = forms["references"]

    plan_path = project / "data" / "run-plans" / "2026-07-25-three-runs.json"
    plan = json.loads(plan_path.read_text(encoding="utf-8"))
    for run in plan["runs"]:
        for item in run["candidates"]:
            item["name_zh"] = product_names[item["name"]]
            item["product_form"] = product_forms[item["name"]]
            for reference in item["references"]:
                reference["name_zh"] = reference_names[reference["name"]]
                reference["kind"] = reference_kinds[reference["name"]]
                store_link = store_links.get(reference["name"], {})
                reference["store"] = store_link.get("store")
                reference["store_url"] = store_link.get("store_url")
    dump(plan_path, plan)

    websites: list[dict] = []
    for run in plan["runs"]:
        run_root = project / "outputs" / "selection-runs" / run["run_id"]
        website_path = run_root / "05-publish" / "website-report.json"
        website = json.loads(website_path.read_text(encoding="utf-8"))
        source_by_id = {
            f"{run['run_id']}-{item['route'].lower()}-{item['slug']}": item
            for item in run["candidates"]
        }
        for relative in [
            "02-routes/candidates.json",
            "02-routes/route-a.json",
            "02-routes/route-b.json",
            "02-routes/route-c.json",
        ]:
            path = run_root / relative
            records = json.loads(path.read_text(encoding="utf-8"))
            for record in records:
                record["title_zh"] = source_by_id[record["candidate_id"]]["name_zh"]
                record["product_form"] = source_by_id[record["candidate_id"]]["product_form"]
            dump(path, records)

        evidence_path = run_root / "01-research" / "evidence.json"
        evidence = json.loads(evidence_path.read_text(encoding="utf-8"))
        for row in evidence:
            row["entity_name_zh"] = reference_names[row["entity_name"]]
            row["entity_kind"] = reference_kinds[row["entity_name"]]
            row["store_url"] = store_links.get(row["entity_name"], {}).get("store_url")
        dump(evidence_path, evidence)
        write_csv(run_root / "01-research" / "evidence.csv", evidence)

        candidates_csv_path = run_root / "02-routes" / "candidates.csv"
        with candidates_csv_path.open(encoding="utf-8-sig", newline="") as handle:
            candidate_rows = list(csv.DictReader(handle))
        for row in candidate_rows:
            row["name_zh"] = source_by_id[row["candidate_id"]]["name_zh"]
            row["product_form"] = source_by_id[row["candidate_id"]]["product_form"]
        write_csv(candidates_csv_path, candidate_rows)

        selection_table_path = run_root / "03-report" / "selection-table.csv"
        with selection_table_path.open(encoding="utf-8-sig", newline="") as handle:
            selection_rows = list(csv.DictReader(handle))
        for row in selection_rows:
            source = next(
                item for item in run["candidates"]
                if row["product"] in {item["name"], bilingual(item["name"], item["name_zh"])}
            )
            row["product"] = bilingual(source["name"], source["name_zh"])
            row["product_form"] = source["product_form"]
        write_csv(selection_table_path, selection_rows)

        for candidate in website["candidates"]:
            source = source_by_id[candidate["id"]]
            candidate["titleZh"] = source["name_zh"]
            candidate["productForm"] = source["product_form"]
            for reference, source_reference in zip(candidate["references"], source["references"]):
                reference["nameZh"] = source_reference["name_zh"]
                reference["kind"] = source_reference["kind"]
                reference["store"] = source_reference["store"]
                reference["storeUrl"] = source_reference["store_url"]

            spec_path = run_root / "04-packages" / f"{candidate['packageId']}.spec.json"
            spec = json.loads(spec_path.read_text(encoding="utf-8"))
            display_name = bilingual(source["name"], source["name_zh"])
            spec["objective"]["working_name"] = display_name
            spec["objective"]["product_form"] = source["product_form"]
            spec["objective"]["target_platforms"] = TARGET_PLATFORMS[source["product_form"]]
            spec["brand"]["primary_name"] = display_name
            for reference, source_reference in zip(spec["references"], source["references"]):
                reference["name"] = bilingual(source_reference["name"], source_reference["name_zh"])
                reference["kind"] = source_reference["kind"]
                reference["store"] = source_reference["store"]
                reference["store_url"] = source_reference["store_url"]
            spec["build"]["master_prompt"] = spec["build"]["master_prompt"].replace(
                f"构建 {source['name']} 的",
                f"构建 {display_name} 的",
            )
            dump(spec_path, spec)

            with tempfile.TemporaryDirectory() as temp_dir:
                subprocess.run(
                    [
                        sys.executable,
                        str(project / "scripts" / "create_workbench_package.py"),
                        "--spec",
                        str(spec_path),
                        "--output-root",
                        temp_dir,
                    ],
                    check=True,
                    capture_output=True,
                    text=True,
                )
                generated = Path(temp_dir) / candidate["packageId"]
                target = run_root / "04-packages" / candidate["packageId"]
                shutil.copytree(generated, target, dirs_exist_ok=True)

            archive_path = run_root / "04-packages" / f"{candidate['packageId']}.zip"
            digest = zip_package(run_root / "04-packages" / candidate["packageId"], archive_path)
            candidate["packageSha256"] = digest
            public_archive = (
                project / "site" / "public" / "packages" / run["run_id"] / archive_path.name
            )
            shutil.copy2(archive_path, public_archive)

        dump(website_path, website)
        websites.append(website)

    dump(project / "site" / "lib" / "generated-reports.json", websites)
    print(json.dumps({"reports": len(websites), "localized_products": sum(len(run["candidates"]) for run in plan["runs"])}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
