#!/usr/bin/env python3
"""Generate a self-contained development workbench package from a JSON spec."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


REQUIRED_TOP = {
    "package_version", "package_id", "candidate_id", "status", "source_engine",
    "route_score", "route_rank", "route_methodology_version",
    "data_completeness", "objective", "references",
    "change_directions", "brand", "ui", "build", "acceptance", "growth",
    "analytics", "stop_conditions", "provenance",
}


def bullets(items: list[str]) -> str:
    return "\n".join(f"- {item}" for item in items)


PRODUCT_FORM_LABELS = {
    "mobile_app": "移动 App",
    "mobile_game": "手机游戏",
    "web_app": "Web 应用",
    "desktop_app": "桌面 App",
    "cross_platform": "跨端应用",
}

REFERENCE_KIND_LABELS = {
    "mobile_app": "移动 App",
    "mobile_game": "手机游戏",
    "web_product": "Web 产品",
    "desktop_app": "桌面软件",
    "open_source_project": "开源项目",
    "system_feature": "系统功能",
    "developer_platform": "开发平台",
    "technical_standard": "技术标准",
    "research_report": "研究报告",
}


def next_available(path: Path) -> Path:
    if not path.exists():
        return path
    index = 2
    while Path(f"{path}-{index}").exists():
        index += 1
    return Path(f"{path}-{index}")


def validate(spec: dict) -> None:
    missing = sorted(REQUIRED_TOP - set(spec))
    if missing:
        raise ValueError(f"missing required fields: {', '.join(missing)}")
    if spec["status"] != "READY_FOR_BENCH":
        raise ValueError("only READY_FOR_BENCH packages can be generated")
    if spec["route_score"] < 75 or spec["data_completeness"] < 0.8:
        raise ValueError("READY_FOR_BENCH requires score >= 75 and completeness >= 0.8")
    if not 1 <= len(spec["change_directions"]) <= 3:
        raise ValueError("change_directions must contain one to three items")
    if len(spec["references"]) < 3:
        raise ValueError("at least three references are required")
    for view in ("user", "project_manager", "growth"):
        if len(spec["acceptance"].get(view, [])) < 3:
            raise ValueError(f"acceptance.{view} requires at least three criteria")


def render_index(spec: dict) -> str:
    obj = spec["objective"]
    return f"""# {obj['working_name']} — Workbench Package

- Package ID: `{spec['package_id']}`
- Candidate ID: `{spec['candidate_id']}`
- Source engine: `{spec['source_engine']}`
- Route score: {spec['route_score']}
- Route rank: {spec['route_rank']}
- Route methodology: `{spec['route_methodology_version']}`
- Data completeness: {spec['data_completeness']:.0%}
- Status: `{spec['status']}`

## Read order

1. `01-product-brief.md`
2. `02-evidence-and-references.md`
3. `03-brand-ui-direction.md`
4. `05-acceptance-criteria.md`
5. `06-growth-plan.md`
6. `07-analytics-and-stop.md`
7. `04-build-master-prompt.md`

Do not start implementation when any required file or acceptance section is missing.
"""


def render_product(spec: dict) -> str:
    obj = spec["objective"]
    changes = []
    for index, item in enumerate(spec["change_directions"], 1):
        changes.append(
            f"""### {index}. {item['title']}

- User evidence: {item['user_evidence']}
- Current failure: {item['current_failure']}
- Change: {item['change']}
- Expected outcome: {item['expected_outcome']}
- Validation metric: {item['validation_metric']}
- Out of scope: {item['out_of_scope']}"""
        )
    return f"""# Product brief

## Objective

- 产品形态：{PRODUCT_FORM_LABELS[obj['product_form']]}
- Target markets: {", ".join(obj['target_markets'])}
- Target platforms: {", ".join(obj['target_platforms'])}
- Target user: {obj['target_user']}
- Trigger: {obj['trigger']}
- Core job: {obj['core_job']}
- Current alternative: {obj['current_alternative']}
- Product promise: {obj['product_promise']}
- Minimum success: {obj['minimum_success']}

## Core change directions

{chr(10).join(changes)}

## Scope

{bullets(obj['scope'])}

## Non-goals

{bullets(obj['non_goals'])}
"""


def render_references(spec: dict) -> str:
    sections = []
    for index, item in enumerate(spec["references"], 1):
        store_label = {
            "apple_app_store": "Apple App Store",
            "google_play": "Google Play",
        }.get(item.get("store"), "无独立商店页")
        store_url = item.get("store_url") or "无"
        sections.append(
            f"""## {index}. {item['name']}

- 参考对象类型：{REFERENCE_KIND_LABELS[item['kind']]}
- 应用商店：{store_label}
- 商店链接：{store_url}
- 证据链接：{item['url']}
- Type: `{item['reference_type']}`
- Evidence IDs: {", ".join(item['evidence_ids'])}
- Learn: {item['learn']}
- Redesign: {item['redesign']}
- Do not copy: {item['do_not_copy']}"""
        )
    return "# Evidence and references\n\n" + "\n\n".join(sections) + "\n"


def render_brand_ui(spec: dict) -> str:
    brand, ui = spec["brand"], spec["ui"]
    colors = "\n".join(f"- `{key}`: `{value}`" for key, value in ui["colors"].items())
    return f"""# Brand and UI direction

## Brand

- Primary name: {brand['primary_name']}
- Alternate name: {brand['alternate_name']}
- Positioning: {brand['positioning']}
- Personality: {", ".join(brand['personality'])}
- Voice: {brand['voice']}
- Icon direction: {brand['icon_direction']}
- Avoid: {", ".join(brand['avoid'])}

## UI

- Direction: {ui['direction']}
- Principles: {", ".join(ui['principles'])}
- Typography: {ui['typography']}

### Color tokens

{colors}

### Components

{bullets(ui['components'])}

### Core screens

{bullets(ui['core_screens'])}

### Required states

{bullets(ui['states'])}

### Accessibility

{bullets(ui['accessibility'])}
"""


def render_prompt(spec: dict) -> str:
    build, obj = spec["build"], spec["objective"]
    return f"""# Build master prompt

Read every file in this package. Freeze the scope, core change directions, and
three-perspective acceptance criteria before coding.

Objective: {obj['product_promise']}
Stage: `{build['stage']}`
Stack: {", ".join(build['stack'])}
Repository: {build['repository'] or "create or select within the authorized workspace"}
Recommended skills: {", ".join(build['recommended_skills']) or "select relevant installed skills"}

{build['master_prompt']}

## Required deliverables

{bullets(build['deliverables'])}

## Allowed autonomy

{bullets(build['allowed_autonomy'])}

## Pause conditions

{bullets(build['pause_conditions'])}

Run tests, inspect the actual UI, complete an improvement pass, and return source
paths, build/test evidence, screenshots, known risks, and stage status. Do not add
unapproved features or perform public deployment/store submission without authority.
"""


def render_acceptance(spec: dict) -> str:
    acceptance = spec["acceptance"]
    return f"""# Acceptance criteria

## User perspective

{bullets(acceptance['user'])}

## Project-manager perspective

{bullets(acceptance['project_manager'])}

## Growth perspective

{bullets(acceptance['growth'])}
"""


def render_growth(spec: dict) -> str:
    growth = spec["growth"]
    return f"""# Growth plan

- Positioning: {growth['positioning']}
- Cold-start test: {growth['cold_start_test']}

## Keywords

{bullets(growth['keywords'])}

## Creative angles

{bullets(growth['creative_angles'])}

## Store assets

{bullets(growth['store_assets'])}

## Channels

{bullets(growth['channels'])}
"""


def render_analytics(spec: dict) -> str:
    analytics = spec["analytics"]
    return f"""# Analytics and stop conditions

## Events

{bullets(analytics['events'])}

## Success metrics

{bullets(analytics['success_metrics'])}

## Stop conditions

{bullets(spec['stop_conditions'])}
"""


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--spec", required=True)
    parser.add_argument("--output-root", required=True)
    args = parser.parse_args()

    spec_path = Path(args.spec).expanduser().resolve()
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    validate(spec)

    output_root = Path(args.output_root).expanduser().resolve()
    output_root.mkdir(parents=True, exist_ok=True)
    package_dir = next_available(output_root / spec["package_id"])
    package_dir.mkdir()

    (package_dir / "manifest.json").write_text(
        json.dumps(spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    files = {
        "00-package-index.md": render_index(spec),
        "01-product-brief.md": render_product(spec),
        "02-evidence-and-references.md": render_references(spec),
        "03-brand-ui-direction.md": render_brand_ui(spec),
        "04-build-master-prompt.md": render_prompt(spec),
        "05-acceptance-criteria.md": render_acceptance(spec),
        "06-growth-plan.md": render_growth(spec),
        "07-analytics-and-stop.md": render_analytics(spec),
    }
    for name, content in files.items():
        (package_dir / name).write_text(content, encoding="utf-8")
    print(package_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
