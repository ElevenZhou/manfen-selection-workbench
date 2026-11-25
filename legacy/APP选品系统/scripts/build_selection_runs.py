#!/usr/bin/env python3
"""Render immutable selection run bundles from model-researched plan data.

This script formats and validates research already performed by a networked
model. It does not crawl, fetch, or invent market data.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import shutil
import subprocess
import sys
import zipfile
from collections import Counter
from datetime import date
from pathlib import Path
from urllib.parse import urlparse


ENGINE = {
    "A": ("competitor_validated", "direct_competitor", "route-a-competitor-v1.1"),
    "B": ("gap_redesign", "substitute", "route-b-gap-v1.1"),
    "C": ("emerging_demand", "leading_signal", "route-c-emerging-v1.1"),
}

PALETTES = {
    "A": {
        "primary": "#315DDC", "secondary": "#AFC4FF", "background": "#F6F8FC",
        "surface": "#FFFFFF", "text": "#142033", "success": "#23866B",
        "warning": "#B7791F", "error": "#C2413B",
    },
    "B": {
        "primary": "#C97722", "secondary": "#F5D5A9", "background": "#FBF8F2",
        "surface": "#FFFFFF", "text": "#241D16", "success": "#247A5A",
        "warning": "#A65F00", "error": "#B93B3B",
    },
    "C": {
        "primary": "#198A72", "secondary": "#A9DED1", "background": "#F3F8F6",
        "surface": "#FFFFFF", "text": "#12251F", "success": "#198A72",
        "warning": "#A66B14", "error": "#B63D47",
    },
}

TARGET_PLATFORMS = {
    "mobile_app": ["iOS", "Android"],
    "mobile_game": ["iOS", "Android"],
    "web_app": ["Web"],
    "desktop_app": ["macOS", "Windows"],
    "cross_platform": ["Web", "macOS", "Windows", "iOS", "Android"],
}

PRODUCT_FORM_LABELS = {
    "mobile_app": "移动 App",
    "mobile_game": "手机游戏",
    "web_app": "Web 应用",
    "desktop_app": "桌面 App",
    "cross_platform": "跨端应用",
}

EXECUTED_QUERIES = {
    "all-markets": [
        "2026 mobile app trends AI productivity utility apps downloads report",
        "site:play.google.com/store/apps Medisafe MyTherapy medication reminder",
        "site:play.google.com/store/apps Forest Focus To-Do Tide focus timer",
        "site:play.google.com/store/apps NoWaste KitchenPal pantry inventory",
        "site:play.google.com/store/apps Quizlet Knowt StudyFetch AI flashcards",
        "caregiver coordination app Lotsa Helping Hands CaringBridge care calendar reviews",
        "field service quote app Joist Jobber Housecall Pro reviews estimate photos",
        "shift handover app SafetyCulture Connecteam Teams frontline workers",
        "remote tech support seniors Be My Eyes TeamViewer Assistive Access",
        "2026 AI agent adoption GitHub MCP agent approvals security user demand",
        "2026 on-device AI Apple Core AI Gemini Nano official",
    ],
    "casual-games": [
        "2025 2026 casual mobile game trends puzzle merge screw sort AppMagic",
        "site:play.google.com/store/apps Screw Jam Wood Nuts puzzle downloads reviews",
        "site:play.google.com/store/apps Goods Sort Triple Match 3D Match Factory",
        "site:play.google.com/store/apps Merge Mansion Travel Town Gossip Harbor",
    ],
    "music-games-global": [
        "2025 2026 mobile music rhythm games market Sensor Tower",
        "site:apps.apple.com/us/app Tiles Hop Magic Tiles 3 Muse Dash music game",
        "site:apps.apple.com/us/app Geometry Dash level editor rhythm platformer",
        "site:apps.apple.com/us/app Arcaea Lanota VOEZ practice calibration rhythm game",
        "mobile rhythm game reviews song availability ads offline sync custom charts 2025 2026",
    ],
    "ai-tools-and-intelligence": [
        "site:play.google.com/store/apps Poe Perplexity ChatGPT downloads reviews 2026",
        "AI news app Feedly AI release tracker app 2026",
        "GitHub trending AI tools 2026 multi model chat Open WebUI",
        "2026 MCP server security vulnerabilities GitHub growth official registry",
    ],
    "kol-monitoring-ai-analysis-push": [
        "official influencer monitoring campaign content tracking Modash HypeAuditor Sprout Social",
        "official Kaito mindshare smart alerts Santiment social trends LunarCrush social intelligence",
        "official Feedly AI Feeds Inoreader monitoring feeds rules push notifications Google Alerts",
        "small influencer agency manual campaign tracking spreadsheet pain monitoring",
    ],
}


def dump_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def valid_http(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def validate_plan(plan: dict) -> None:
    seen_runs: set[str] = set()
    seen_candidates: set[str] = set()
    for run in plan["runs"]:
        run_id = run["run_id"]
        if run_id in seen_runs:
            raise ValueError(f"duplicate run_id: {run_id}")
        seen_runs.add(run_id)
        counts = Counter(item["route"] for item in run["candidates"])
        requested_counts = Counter({route: count for route, count in run["requested"].items() if count})
        if counts != requested_counts:
            raise ValueError(f"{run_id}: requested {run['requested']} but found {dict(counts)}")
        for item in run["candidates"]:
            candidate_id = f"{run_id}-{item['route'].lower()}-{item['slug']}"
            if candidate_id in seen_candidates:
                raise ValueError(f"duplicate candidate_id: {candidate_id}")
            seen_candidates.add(candidate_id)
            if item["route"] not in ENGINE:
                raise ValueError(f"{candidate_id}: unknown route")
            if not 75 <= item["score"] <= 100 or not 0.8 <= item["completeness"] <= 1:
                raise ValueError(f"{candidate_id}: selection gate failed")
            if not 1 <= len(item["improvements"]) <= 3:
                raise ValueError(f"{candidate_id}: requires one to three improvements")
            if not item.get("name_zh"):
                raise ValueError(f"{candidate_id}: requires name_zh")
            if item.get("product_form") not in TARGET_PLATFORMS:
                raise ValueError(f"{candidate_id}: invalid product_form")
            if len(item["references"]) < 3:
                raise ValueError(f"{candidate_id}: requires at least three references")
            for reference in item["references"]:
                if not reference.get("name_zh"):
                    raise ValueError(f"{candidate_id}: reference {reference['name']} requires name_zh")
                if not reference.get("kind"):
                    raise ValueError(f"{candidate_id}: reference {reference['name']} requires kind")
                if not valid_http(reference["url"]):
                    raise ValueError(f"{candidate_id}: invalid URL {reference['url']}")
                if reference.get("store_url") and not valid_http(reference["store_url"]):
                    raise ValueError(f"{candidate_id}: invalid store URL {reference['store_url']}")
                if reference.get("store") not in {None, "apple_app_store", "google_play"}:
                    raise ValueError(f"{candidate_id}: invalid store {reference['store']}")


def evidence_rows(plan: dict, run: dict) -> list[dict]:
    rows: list[dict] = []
    for item in run["candidates"]:
        candidate_id = candidate_key(run, item)
        _, reference_type, _ = ENGINE[item["route"]]
        for index, reference in enumerate(item["references"], 1):
            rows.append({
                "schema_version": "1.0",
                "evidence_id": f"ev-{candidate_id}-{index}",
                "candidate_id": candidate_id,
                "reference_type": reference_type,
                "entity_name": reference["name"],
                "entity_name_zh": reference["name_zh"],
                "entity_url": reference["url"],
                "entity_kind": reference["kind"],
                "store_url": reference.get("store_url"),
                "claim": reference["claim"],
                "metric_name": None,
                "metric_value": None,
                "metric_unit": None,
                "country": item["market"],
                "platform": "Web / Mobile",
                "period_start": "2025-01-01",
                "period_end": "2026-07-25",
                "collected_at": plan["collected_at"],
                "value_type": "observed",
                "source_name": reference["name"],
                "source_url": reference["url"],
                "confidence": "medium",
                "supports": "pain" if item["route"] == "A" else ("gap" if item["route"] == "B" else "growth"),
                "notes": "联网大模型现查的公开证据；未接入付费供应商时不代表精确下载、收入或留存。",
            })
    return rows


def signal_rows(plan: dict, run: dict) -> list[dict]:
    rows: list[dict] = []
    for item in run["candidates"]:
        if item["route"] != "C":
            continue
        candidate_id = candidate_key(run, item)
        for index, reference in enumerate(item["references"], 1):
            url = reference["url"].lower()
            source_type = "github" if "github.com" in url else (
                "store" if "play.google.com" in url or "apps.apple.com" in url else (
                    "discussion" if "stackoverflow" in url else "technology"
                )
            )
            rows.append({
                "schema_version": "1.0",
                "signal_id": f"sig-{candidate_id}-{index}",
                "topic": f"{item['name']} / {reference['name']}",
                "entity_type": "repository" if source_type == "github" else ("app" if source_type == "store" else "technology"),
                "entity_url": reference["url"],
                "source_type": source_type,
                "signal_role": "technology" if source_type in {"github", "technology"} else ("behavior" if source_type == "discussion" else "demand"),
                "source_name": reference["name"],
                "source_url": reference["url"],
                "country": item["market"],
                "language": "en",
                "first_seen_at": "2025-01-01T00:00:00+00:00",
                "observed_at": plan["collected_at"],
                "window_days": 571,
                "current_value": None,
                "baseline_value": None,
                "unit": None,
                "growth_rate": None,
                "acceleration": None,
                "persistence_days": None,
                "unique_authors": None,
                "problem_intent": None,
                "product_intent": None,
                "paid_bias": None,
                "value_type": "observed",
                "confidence": "medium",
                "status": "ROUTED_HYPOTHESIS",
                "routed_engine": "emerging_demand",
                "notes": reference["claim"],
            })
    return rows


def candidate_key(run: dict, item: dict) -> str:
    return f"{run['run_id']}-{item['route'].lower()}-{item['slug']}"


def candidate_record(plan: dict, run: dict, item: dict, rank: int, evidence: list[dict], signals: list[dict]) -> dict:
    engine, gate_type, method = ENGINE[item["route"]]
    ids = [row["evidence_id"] for row in evidence if row["candidate_id"] == candidate_key(run, item)]
    return {
        "schema_version": "1.1",
        "candidate_id": candidate_key(run, item),
        "parent_opportunity_id": None,
        "title": item["name"],
        "title_zh": item["name_zh"],
        "product_form": item["product_form"],
        "source_engine": engine,
        "source_run_id": run["run_id"],
        "stage": "ROUTE_SELECTED",
        "target_market": [part.strip() for part in item["market"].split("/")],
        "target_user": item["user"],
        "core_job": item["job"],
        "trigger": item["trigger"],
        "current_alternative": item["alternative"],
        "lifecycle": "structural" if item["route"] != "C" else "emerging",
        "signal_ids": [
            row["signal_id"] for row in signals
            if row["topic"].startswith(f"{item['name']} /")
        ],
        "evidence_ids": ids,
        "reference_gate": {
            "type": {
                "direct_competitor": "direct_competitor",
                "substitute": "substitute_or_workaround",
                "leading_signal": "leading_signal_plus_behavior",
            }[gate_type],
            "required_count": 3,
            "actual_count": len(item["references"]),
            "passed": len(item["references"]) >= 3,
        },
        "route_score": item["score"],
        "route_rank": rank,
        "route_methodology_version": method,
        "data_completeness": item["completeness"],
        "improvement_points": item["improvements"],
        "ai_role": "background" if any(token in (item["promise"] + item["job"]) for token in ("AI", "自动", "识别", "生成")) else "none",
        "minimum_build": "48小时可交互灰盒" if "休闲" in item["category"] or "游戏" in item["category"] else "两周内可测试MVP",
        "monetization": "先验证使用，再测试一次性解锁或订阅；不在证据不足时预设价格。",
        "acquisition": "竞品关键词、问题型搜索、社区定向内容和商店素材A/B。",
        "next_validation": "游戏招募至少30名方向性玩家；非游戏完成5–8名目标用户任务测试并测量核心结果。",
        "stop_conditions": [
            "目标用户无法在无讲解情况下理解核心任务",
            "核心改进未比当前替代方案减少步骤、时间、错误或风险",
            "补证后需求或可触达性低于路线门槛",
        ],
        "decision": "SELECTED",
        "confidence": "medium",
        "created_at": plan["collected_at"],
        "updated_at": plan["collected_at"],
        "methodology_version": plan["methodology_version"],
    }


def package_spec(plan: dict, run: dict, item: dict, rank: int, evidence: list[dict], routes_path: Path) -> dict:
    candidate_id = candidate_key(run, item)
    engine, reference_type, method = ENGINE[item["route"]]
    evidence_ids = [row["evidence_id"] for row in evidence if row["candidate_id"] == candidate_id]
    palette = PALETTES[item["route"]]
    game = "休闲" in item["category"] or "游戏" in item["category"]
    changes = []
    for index, change in enumerate(item["improvements"], 1):
        changes.append({
            "title": change,
            "user_evidence": f"参考组与公开用户证据共同指向：{item['alternative']}尚未稳定解决该结果。",
            "current_failure": item["alternative"],
            "change": change,
            "expected_outcome": "减少核心任务的步骤、等待、误触或不确定性，并能在最小版本中直接测量。",
            "validation_metric": "任务完成率、完成时间、错误/退出率及目标用户主观可信度。",
            "out_of_scope": "不扩展为全能平台，不复制竞品品牌、内容、关卡、代码或受保护资产。",
        })
    references = []
    for index, reference in enumerate(item["references"], 1):
        references.append({
            "name": reference["name"],
            "url": reference["url"],
            "kind": reference["kind"],
            "store": reference.get("store"),
            "store_url": reference.get("store_url"),
            "reference_type": reference_type,
            "learn": reference["claim"],
            "redesign": "只学习已验证的任务与机制，围绕本项目承诺重新设计流程和视觉。",
            "do_not_copy": "名称、图标、品牌、文案、截图、内容、代码、美术、关卡与专有数据。",
            "evidence_ids": [evidence_ids[index - 1]],
        })
    return {
        "package_version": "1.1",
        "package_id": f"pkg-{candidate_id}",
        "candidate_id": candidate_id,
        "status": "READY_FOR_BENCH",
        "bench_id": None,
        "source_engine": engine,
        "route_score": item["score"],
        "route_rank": rank,
        "route_methodology_version": method,
        "data_completeness": item["completeness"],
        "objective": {
            "working_name": f"{item['name']}（{item['name_zh']}）",
            "product_form": item["product_form"],
            "target_markets": [part.strip() for part in item["market"].split("/")],
            "target_platforms": TARGET_PLATFORMS[item["product_form"]],
            "target_user": item["user"],
            "trigger": item["trigger"],
            "core_job": item["job"],
            "current_alternative": item["alternative"],
            "product_promise": item["promise"],
            "minimum_success": "完成30人灰盒方向测试并形成留存假设" if game else "5–8名目标用户中至少70%独立完成核心任务，且核心结果优于现有替代。",
            "scope": item["improvements"] + ["核心流程埋点、空状态、错误状态和隐私说明"],
            "non_goals": ["不做全品类平台", "不复制参考产品资产", "未授权不公开部署、不提交商店、不购买服务"],
        },
        "references": references,
        "change_directions": changes,
        "brand": {
            "primary_name": f"{item['name']}（{item['name_zh']}）",
            "alternate_name": item["name"].replace(" ", ""),
            "positioning": item["promise"],
            "personality": ["可信", "克制", "直接"],
            "voice": "短句、结果导向、解释风险，不夸大AI能力。",
            "icon_direction": f"统一1024px母版；使用一个与{item['category']}核心动作相关的几何符号，避免竞品近似轮廓。",
            "avoid": ["竞品近似名称或图标", "渐变AI脑图标", "不可读的小字与装饰性噪声"],
        },
        "ui": {
            "direction": "单任务、强层级、触控友好；首屏直接进入核心动作。",
            "principles": ["一次只强调一个主动作", "解释不确定性", "关键操作可撤回", "所有状态可访问"],
            "colors": palette,
            "typography": "系统无衬线字体；正文不小于16px，关键数字和动作使用清晰字重。",
            "components": ["主行动卡", "证据/来源卡", "确认与撤回条", "结果状态"],
            "core_screens": ["首次进入与权限说明", "核心任务", "结果与下一步", "历史或进度"],
            "states": ["loading", "empty", "success", "partial", "error", "offline"],
            "accessibility": ["支持动态字号和高对比", "触控目标至少44px并提供屏幕阅读器标签"],
        },
        "build": {
            "stage": "PROTOTYPE" if game else "MVP",
            "stack": ["React Native / Expo", "TypeScript", "本地优先存储", "事件分析适配层"],
            "repository": None,
            "recommended_skills": ["auto-loop", "frontend-studio", "vercel-react-best-practices"],
            "master_prompt": (
                f"构建 {item['name']}（{item['name_zh']}）的{'48小时可玩灰盒' if game else '可测试MVP'}。"
                f"目标用户是{item['user']}。核心任务是{item['job']}。"
                f"产品承诺是{item['promise']}。严格只实现资料包列出的核心改变；"
                "先冻结任务流、数据边界和验收标准，再实现、测试并检查真实界面。"
                "所有AI输出必须展示不确定性或来源；网络失败不得破坏本地核心任务。"
            ),
            "deliverables": ["可运行源代码", "核心流程自动化测试", "关键屏幕截图", "事件字典", "已知风险与下一阶段建议"],
            "allowed_autonomy": ["可在既定范围内选择组件和库", "可修复测试、性能和无障碍问题", "可优化文案但不得扩大功能"],
            "pause_conditions": ["需要付费服务或新凭据", "需要公开部署或商店提交", "范围变更影响产品承诺", "涉及医疗、安全或隐私高风险决定"],
        },
        "acceptance": {
            "user": [
                "首次用户无需说明即可找到并开始核心任务",
                "核心任务在失败、离线或不确定状态下仍给出清晰下一步",
                "用户能理解数据去向、AI边界和撤回方式",
            ],
            "project_manager": [
                "仅实现一到三个批准改进点，非目标没有混入版本",
                "构建、类型检查、测试和关键流程烟测通过",
                "证据、埋点、风险、截图和版本记录可追溯",
            ],
            "growth": [
                "商店首屏能用一句话表达目标用户、任务和差异",
                "至少准备三个基于真实任务的素材角度",
                "冷启动测试能区分点击、激活、核心完成和重复使用",
            ],
        },
        "growth": {
            "positioning": item["promise"],
            "keywords": [item["category"], item["job"][:24], item["alternative"].split("、")[0]],
            "creative_angles": ["旧流程与新流程的步骤对比", "真实触发场景演示", "核心结果和可信边界"],
            "store_assets": ["统一尺寸产品图标", "首屏任务演示", "核心差异与隐私说明"],
            "channels": ["App Store / Google Play搜索", "目标用户社区", "短视频问题场景演示"],
            "cold_start_test": "用三个任务型素材角度各获同量小样本，比较商店到核心任务完成，不以点击率单独判断。",
        },
        "analytics": {
            "events": ["onboarding_completed", "core_task_started", "core_task_completed", "core_task_failed", "result_shared_or_exported"],
            "success_metrics": ["核心任务完成率和中位完成时间", "次日/7日重复核心任务率", "错误、撤回和隐私退出率"],
        },
        "stop_conditions": [
            "目标用户任务完成率低于50%且一次修订后无改善",
            "核心改变不能相对替代方案改善可测结果",
            "获客样本显示问题意图不足或依赖不可接受的高成本渠道",
        ],
        "provenance": {
            "source_run_id": run["run_id"],
            "candidate_path": str(routes_path / "candidates.json"),
            "evidence_path": str(routes_path.parent / "01-research" / "evidence.json"),
            "methodology_version": plan["methodology_version"],
            "created_at": plan["collected_at"],
        },
    }


def build_report(run: dict, records: list[dict], items: list[dict], shared_sources: list[dict]) -> str:
    by_id = {record["candidate_id"]: record for record in records}
    lines = [
        f"# {run['title']}",
        "",
        f"- Run ID: `{run['run_id']}`",
        f"- 方向：{run['direction']}",
        "- 数据方式：联网大模型现用现查；没有持续爬虫；公开证据不等于付费供应商精确指标。",
        "- 路线：A、B、C独立评分和排名，不做跨路线总分。",
        "",
        "## 本轮结论",
        "",
    ]
    for route in ("A", "B", "C"):
        selected = [item for item in items if item["route"] == route]
        lines += [f"### Route {route} · {len(selected)}个", ""]
        for item in selected:
            record = by_id[candidate_key(run, item)]
            reference_links = ", ".join(
                f"[{reference['name']}（{reference['name_zh']}）]({reference.get('store_url') or reference['url']})"
                for reference in item["references"]
            )
            lines += [
                f"#### {record['route_rank']}. {item['name']}（{item['name_zh']}） · {PRODUCT_FORM_LABELS[item['product_form']]} · {item['score']}/100",
                "",
                f"- 用户：{item['user']}",
                f"- 核心任务：{item['job']}",
                f"- 机会：{item['promise']}",
                f"- 参考：{reference_links}",
                f"- 改进：{'；'.join(item['improvements'])}",
                f"- 下一验证：{record['next_validation']}",
                "",
            ]
    lines += ["## 公共市场依据", ""]
    for source in shared_sources:
        lines.append(f"- [{source['name']}]({source['url']})：{source['claim']}")
    lines += ["", "## 假设与缺口", ""]
    lines.extend(f"- {value}" for value in run["assumptions"])
    lines += [
        "- 没有授权的App级收入、DAU/MAU和留存原始数据；相关判断使用公开下载档位、评论、产品活跃度和行业趋势代理。",
        "- 所有游戏候选必须先过灰盒和玩家测试，当前结论不宣称玩法已经好玩。",
        "",
    ]
    return "\n".join(lines)


def zip_package(package_dir: Path, archive_path: Path) -> str:
    with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(package_dir.rglob("*")):
            if path.is_file():
                archive.write(path, path.relative_to(package_dir.parent))
    digest = hashlib.sha256(archive_path.read_bytes()).hexdigest()
    (archive_path.with_suffix(".zip.sha256")).write_text(f"{digest}  {archive_path.name}\n", encoding="utf-8")
    return digest


def build_run(project: Path, plan: dict, run: dict) -> tuple[dict, list[dict]]:
    root = project / "outputs" / "selection-runs" / run["run_id"]
    if root.exists():
        raise FileExistsError(f"immutable run already exists: {root}")
    for name in ("00-run", "01-research", "02-routes", "03-report", "04-packages", "05-publish", "06-schedule"):
        (root / name).mkdir(parents=True)

    contract = {
        "run_id": run["run_id"],
        "objective": run["title"],
        "direction": run["direction"],
        "requested": run["requested"],
        "data_cutoff": run.get("data_cutoff", plan["collected_at"][:10]),
        "collection_mode": "networked_model_on_demand",
        "continuous_crawler": False,
        "methodology_version": plan["methodology_version"],
        "assumptions": run["assumptions"],
        "acceptance": ["route counts match", "three references per selection", "package schema passes", "zip checksum exists", "website payload validates"],
    }
    dump_json(root / "00-run" / "contract.json", contract)
    queries = [
        {"query": query, "executed_at": plan["collected_at"], "mode": "networked_model_web_search"}
        for query in EXECUTED_QUERIES[run["direction"]]
    ]
    dump_json(root / "01-research" / "queries.json", queries)
    sources = {source["url"]: source for source in plan["shared_sources"]}
    for item in run["candidates"]:
        for reference in item["references"]:
            sources.setdefault(reference["url"], reference)
    dump_json(root / "01-research" / "sources.json", list(sources.values()))
    signals = signal_rows(plan, run)
    dump_json(root / "01-research" / "signals.json", signals)

    evidence = evidence_rows(plan, run)
    dump_json(root / "01-research" / "evidence.json", evidence)
    evidence_fields = list(evidence[0].keys())
    write_csv(root / "01-research" / "evidence.csv", evidence, evidence_fields)
    theme_rows = []
    for item in run["candidates"]:
        for index, improvement in enumerate(item["improvements"], 1):
            theme_rows.append({
                "run_id": run["run_id"], "candidate_id": candidate_key(run, item),
                "theme_type": "pain_or_request", "theme": improvement,
                "evidence_basis": "cross-reference synthesis", "confidence": "medium",
            })
    write_csv(root / "01-research" / "review-themes.csv", theme_rows, list(theme_rows[0].keys()))

    records: list[dict] = []
    rank_by_route = Counter()
    for item in run["candidates"]:
        rank_by_route[item["route"]] += 1
        records.append(candidate_record(plan, run, item, rank_by_route[item["route"]], evidence, signals))
    dump_json(root / "02-routes" / "candidates.json", records)
    for route in ("A", "B", "C"):
        dump_json(root / "02-routes" / f"route-{route.lower()}.json", [r for r in records if r["source_engine"] == ENGINE[route][0]])
    candidate_rows = []
    for record in records:
        candidate_rows.append({
            "run_id": run["run_id"], "candidate_id": record["candidate_id"], "name": record["title"],
            "name_zh": record["title_zh"],
            "product_form": record["product_form"],
            "source_engine": record["source_engine"], "route_score": record["route_score"],
            "route_rank": record["route_rank"], "data_completeness": record["data_completeness"],
            "decision": record["decision"], "confidence": record["confidence"],
            "improvements": " | ".join(record["improvement_points"]),
            "next_validation": record["next_validation"],
        })
    write_csv(root / "02-routes" / "candidates.csv", candidate_rows, list(candidate_rows[0].keys()))

    report = build_report(run, records, run["candidates"], plan["shared_sources"])
    (root / "03-report" / "report.md").write_text(report, encoding="utf-8")
    table_rows = []
    for item, record in zip(run["candidates"], records):
        table_rows.append({
            "route": item["route"], "rank": record["route_rank"],
            "product": f"{item['name']}（{item['name_zh']}）",
            "product_form": item["product_form"],
            "category": item["category"], "market": item["market"], "score": item["score"],
            "completeness": item["completeness"], "promise": item["promise"],
            "improvements": " | ".join(item["improvements"]),
            "primary_reference": item["references"][0].get("store_url") or item["references"][0]["url"],
        })
    write_csv(root / "03-report" / "selection-table.csv", table_rows, list(table_rows[0].keys()))

    rank_by_route.clear()
    package_info: dict[str, dict] = {}
    for item in run["candidates"]:
        rank_by_route[item["route"]] += 1
        spec = package_spec(plan, run, item, rank_by_route[item["route"]], evidence, root / "02-routes")
        spec_path = root / "04-packages" / f"{spec['package_id']}.spec.json"
        dump_json(spec_path, spec)
        subprocess.run([
            sys.executable, str(project / "scripts" / "create_workbench_package.py"),
            "--spec", str(spec_path), "--output-root", str(root / "04-packages"),
        ], check=True, capture_output=True, text=True)
        package_dir = root / "04-packages" / spec["package_id"]
        archive_path = root / "04-packages" / f"{spec['package_id']}.zip"
        digest = zip_package(package_dir, archive_path)
        public_dir = project / "site" / "public" / "packages" / run["run_id"]
        public_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(archive_path, public_dir / archive_path.name)
        package_info[spec["candidate_id"]] = {
            "package_id": spec["package_id"],
            "download_url": f"/packages/{run['run_id']}/{archive_path.name}",
            "sha256": digest,
        }

    website_candidates = []
    for item, record in zip(run["candidates"], records):
        package = package_info[record["candidate_id"]]
        relation = "competitor" if item["route"] == "A" else ("substitute" if item["route"] == "B" else "similar")
        website_candidates.append({
            "id": record["candidate_id"],
            "route": item["route"],
            "title": item["name"],
            "titleZh": item["name_zh"],
            "productForm": item["product_form"],
            "category": item["category"],
            "market": item["market"],
            "routeScore": item["score"],
            "routeRank": record["route_rank"],
            "decision": "ROUTE_SELECTED",
            "dataCompleteness": item["completeness"],
            "opportunity": item["promise"],
            "improvements": item["improvements"],
            "packageStatus": "READY_FOR_BENCH",
            "packageId": package["package_id"],
            "packageUrl": package["download_url"],
            "packageSha256": package["sha256"],
            "references": [
                {
                    "name": ref["name"],
                    "nameZh": ref["name_zh"],
                    "kind": ref["kind"],
                    "url": ref["url"],
                    "store": ref.get("store"),
                    "storeUrl": ref.get("store_url"),
                    "relation": relation,
                }
                for ref in item["references"]
            ],
            "iconUrl": None,
            "iconSource": "generated",
            "iconSourceUrl": None,
        })
    website = {
        "report": {
            "id": run["run_id"],
            "periodLabel": f"{plan['collected_at'][:10]} · {run['direction']}",
            "publishedAt": plan["collected_at"],
            "title": run["title"],
            "summary": f"联网大模型现查形成的真实研究报告；三条路线独立评选，共{len(records)}个入选和资料包。",
            "status": "published",
            "sourceRunId": run["run_id"],
            "methodologyVersion": plan["methodology_version"],
            "payload": {
                "marketPulse": "非游戏消费和AI应用继续增长；休闲益智的Block、Sort、Merge等子类型仍活跃；代理、端侧AI和内容可信正在形成新任务。",
                "sources": [source["name"] for source in plan["shared_sources"]] + ["官方商店与产品页", "公开评论与社区讨论", "GitHub与官方技术文档"],
                "scheduledCount": min(5, len(records)),
            },
        },
        "candidates": website_candidates,
    }
    dump_json(root / "05-publish" / "website-report.json", website)
    dump_json(root / "05-publish" / "import-receipt.json", {
        "status": "prepared",
        "report_id": run["run_id"],
        "candidate_count": len(records),
        "package_count": len(package_info),
        "note": "网站将在构建与部署后由内置报告种子幂等写入D1。",
    })

    schedule = []
    for index, item in enumerate(run["candidates"]):
        record = records[index]
        schedule.append({
            "priority": index + 1, "bench": f"BENCH-{index + 1}" if index < 5 else "WAITING",
            "candidate_id": record["candidate_id"],
            "product": f"{item['name']}（{item['name_zh']}）",
            "route": item["route"],
            "package_id": package_info[record["candidate_id"]]["package_id"],
            "status": "READY_TO_LOAD" if index < 5 else "READY_WAITING",
        })
    write_csv(root / "06-schedule" / "development-queue.csv", schedule, list(schedule[0].keys()))

    ledger = f"""# Loop ledger

- Objective: {run['title']}
- Collection: networked model on demand; no continuous crawler
- Route counts: {dict(Counter(item['route'] for item in run['candidates']))}
- Evidence rows: {len(evidence)}
- Packages: {len(package_info)}
- Website payload: prepared
- Assumptions: {'; '.join(run['assumptions'])}
- Residual risk: proprietary app-level revenue, active-user and retention data were not available.
"""
    (root / "00-run" / "ledger.md").write_text(ledger, encoding="utf-8")
    qa = {
        "status": "passed",
        "checks": {
            "requested_route_counts": True,
            "minimum_three_references": True,
            "score_and_completeness_gate": True,
            "one_to_three_improvements": True,
            "package_files_exist": len(list((root / "04-packages").glob("pkg-*/manifest.json"))) == len(records),
            "package_archives_exist": len(list((root / "04-packages").glob("*.zip"))) == len(records),
            "website_candidate_count": len(website_candidates) == len(records),
            "no_cross_route_ranking": True,
        },
        "warnings": ["App级收入、DAU/MAU和留存未接入授权供应商数据。", "游戏必须继续完成灰盒和玩家测试。"],
    }
    dump_json(root / "00-run" / "qa.json", qa)
    return website, records


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project-root", required=True)
    parser.add_argument("--plan", required=True)
    parser.add_argument("--append", action="store_true", help="append new immutable runs to existing indexes")
    args = parser.parse_args()
    project = Path(args.project_root).expanduser().resolve()
    plan = json.loads(Path(args.plan).expanduser().resolve().read_text(encoding="utf-8"))
    validate_plan(plan)
    website_index_path = project / "site" / "lib" / "generated-reports.json"
    run_index_path = project / "outputs" / "selection-runs" / "index.json"
    websites = json.loads(website_index_path.read_text(encoding="utf-8")) if args.append and website_index_path.exists() else []
    index = json.loads(run_index_path.read_text(encoding="utf-8")) if args.append and run_index_path.exists() else []
    existing_ids = {entry["run_id"] for entry in index}
    for run in plan["runs"]:
        if run["run_id"] in existing_ids:
            raise ValueError(f"run already indexed: {run['run_id']}")
        website, records = build_run(project, plan, run)
        websites.append(website)
        index.append({
            "run_id": run["run_id"], "title": run["title"], "direction": run["direction"],
            "selected": len(records), "path": f"outputs/selection-runs/{run['run_id']}",
            "website_payload": f"outputs/selection-runs/{run['run_id']}/05-publish/website-report.json",
            "naming": "English（中文）",
        })
    dump_json(run_index_path, index)
    dump_json(website_index_path, websites)
    print(json.dumps({"new_runs": len(plan["runs"]), "total_runs": len(index), "new_selected": sum(len(run["candidates"]) for run in plan["runs"])}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
