#!/usr/bin/env python3
"""Adapt on-demand scouting outputs to the website report contract."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def split_name(value: str) -> tuple[str, str]:
    match = re.fullmatch(r"\s*(.*?)（(.*?)）\s*", value)
    return (match.group(1), match.group(2)) if match else (value, value)


def reference(raw: dict) -> dict:
    name, name_zh = split_name(str(raw["name"]))
    return {
        "name": name,
        "nameZh": str(raw.get("nameZh") or name_zh),
        "kind": "mobile_app",
        "url": str(raw.get("storeUrl") or raw.get("url")),
        "store": "apple_app_store",
        "storeUrl": str(raw.get("storeUrl") or raw.get("url")),
        "relation": "similar" if raw.get("relation") == "adjacent_product" else "competitor",
    }


def build_first() -> None:
    run_dir = ROOT / "outputs/scouting/2026-07-26-china-doushengsheng-competitor-map"
    source = json.loads((run_dir / "website.json").read_text(encoding="utf-8"))
    candidates = []
    for rank, raw in enumerate((item for item in source["candidates"] if item.get("deepDive"))):
        candidates.append({
            "id": f"{source['run']['id']}-a-{raw['id'].lower()}",
            "route": "A",
            "title": raw["title"],
            "titleZh": raw["titleZh"],
            "productForm": raw["productForm"],
            "category": raw["category"],
            "market": "中国",
            "routeScore": raw["score"],
            "routeRank": rank + 1,
            "decision": "ROUTE_WATCH",
            "dataCompleteness": raw["dataCompleteness"],
            "opportunity": f"{raw['coreJob']}；目标用户：{raw['targetUser']}",
            "improvements": raw["improvements"],
            "packageStatus": "BLOCKED",
            "packageId": None,
            "packageUrl": None,
            "packageSha256": None,
            "references": [reference(item) for item in raw["competitors"][:5]],
            "iconUrl": None,
            "iconSource": "competitor",
            "iconSourceUrl": raw["competitors"][0]["storeUrl"],
        })
    payload = {
        "report": {
            "id": source["run"]["id"],
            "periodLabel": "2026-07-26 · 抖省省竞品扩展调查",
            "publishedAt": "2026-07-26T21:15:00+08:00",
            "title": "抖省省竞品、相邻产品与替代方案调查",
            "summary": "发现10个机会，深度研究3个；因缺少付费市场数据与真实订单验证，本轮正式入选0个，全部保持WATCH。",
            "status": "research",
            "sourceRunId": source["run"]["id"],
            "methodologyVersion": "app-opportunity-scout-v1",
            "payload": {
                "marketPulse": "抖省省、美团、大众点评、高德等已验证本地优惠需求；当前更明确的机会在跨平台到手价、券生命周期和规则解释。",
                "sources": ["Apple App Store 官方页面与评论", "竞品官方产品页", "公开规则与研究证据"],
                "scheduledCount": 0,
            },
        },
        "candidates": candidates,
    }
    (run_dir / "website-report.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def build_second() -> None:
    run_dir = ROOT / "outputs/scouting/2026-07-26-china-multi-platform-local-deals-rebate"
    source = json.loads((run_dir / "website.json").read_text(encoding="utf-8"))
    refs = [reference(item) for item in source["competitors"][:5]]
    completeness = {"medium": 0.63, "low": 0.48}
    candidates = []
    for rank, raw in enumerate(source["candidates"]):
        candidates.append({
            "id": f"{source['run']['id']}-a-{raw['id'].lower()}",
            "route": "A",
            "title": raw["title"],
            "titleZh": raw["titleZh"],
            "productForm": raw["productForm"],
            "category": "跨平台返利与本地生活优惠",
            "market": "中国",
            "routeScore": raw["score"],
            "routeRank": rank + 1,
            "decision": "ROUTE_WATCH",
            "dataCompleteness": completeness[raw["confidence"]],
            "opportunity": f"{raw['coreJob']}；目标用户：{raw['targetUser']}",
            "improvements": raw["improvements"],
            "packageStatus": "BLOCKED",
            "packageId": None,
            "packageUrl": None,
            "packageSha256": None,
            "references": refs,
            "iconUrl": None,
            "iconSource": "competitor",
            "iconSourceUrl": refs[0]["storeUrl"],
        })
    payload = {
        "report": {
            "id": source["run"]["id"],
            "periodLabel": "2026-07-26 · 多平台优惠返利调查",
            "publishedAt": "2026-07-26T22:10:00+08:00",
            "title": "美团、抖音、淘宝多平台优惠返利调查",
            "summary": "核验10个现有竞品，深度研究3个产品方向；平台书面授权与真实订单结算验证完成前，正式入选0个。",
            "status": "research",
            "sourceRunId": source["run"]["id"],
            "methodologyVersion": "app-opportunity-scout-v1",
            "payload": {
                "marketPulse": "中国 App Store 已存在覆盖淘宝、抖音、美团等多平台的返利产品；差异化重点不是平台数量，而是真实到手价、可返性解释和丢单申诉。",
                "sources": ["Apple App Store 官方产品页", "平台开放能力与联盟规则", "竞品覆盖与授权证据"],
                "scheduledCount": 0,
            },
        },
        "candidates": candidates,
    }
    (run_dir / "website-report.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def build_kol_reference_landscape() -> None:
    run_dir = ROOT / "outputs/scouting/2026-07-26-kol-monitoring-open-source-freemium-landscape"
    source = json.loads((run_dir / "candidates.json").read_text(encoding="utf-8"))
    details = {
        "ref-changedetection-io": {
            "titleZh": "网页变化监控",
            "route": "A",
            "rank": 1,
            "category": "开源变化检测",
            "opportunity": "网页差异、截图证据、AI重要性判断和多通道通知最接近现有KOL变化检测内核。",
            "improvements": ["复用CSS/XPath/JSON差异和原文快照", "接入自选LLM后仍保留人工确认与证据引用"],
            "kind": "open_source_project",
        },
        "ref-rsshub": {
            "titleZh": "万物皆可RSS",
            "route": "A",
            "rank": 2,
            "category": "开源来源接入",
            "opportunity": "把微博、YouTube、TikTok、知乎等公开来源标准化成RSS，降低逐平台接入成本。",
            "improvements": ["优先选择官方API、公开RSS和允许的公开页面", "为每条路由记录成功率、延迟和失效原因"],
            "kind": "open_source_project",
        },
        "ref-freshrss": {
            "titleZh": "清新订阅",
            "route": "A",
            "rank": 3,
            "category": "开源信息聚合",
            "opportunity": "官方扩展已有关键词Webhook和LLM分类，可快速搭建聚合、筛选与飞书入口。",
            "improvements": ["补充KOL实体、观点版本和证据字段", "把LLM分类结果放入人工审核队列而非自动处置"],
            "kind": "open_source_project",
        },
        "ref-huginn": {
            "titleZh": "自动情报代理",
            "route": "A",
            "rank": 4,
            "category": "开源工作流编排",
            "opportunity": "用事件Agent图串联网页、RSS、过滤、Digest、Webhook和团队通知。",
            "improvements": ["借鉴Event与Agent模型而不直接复制旧技术栈", "先用单条RSS到Webhook链路测量维护成本"],
            "kind": "open_source_project",
        },
        "ref-miniflux": {
            "titleZh": "极简订阅流",
            "route": "A",
            "rank": 5,
            "category": "开源RSS后端",
            "opportunity": "轻量RSS后端，具备过滤、REST API、Webhook以及Slack、Telegram、Apprise等集成。",
            "improvements": ["作为低维护来源收件箱与FreshRSS对照", "将AI解释、观点变化和审核工作流保持在外部服务"],
            "kind": "open_source_project",
        },
        "ref-visualping": {
            "titleZh": "网页变化提醒",
            "route": "B",
            "rank": 1,
            "category": "免费商业验证工具",
            "opportunity": "无需部署即可用5个页面和150次月检查验证AI变化摘要与重要性提醒。",
            "improvements": ["用免费额度对比原始变化提醒和重要变化提醒", "把Webhook结果接入现有人工确认卡片"],
            "kind": "web_product",
        },
        "ref-talkwalker-alerts": {
            "titleZh": "拓克沃克提醒",
            "route": "B",
            "rank": 2,
            "category": "免费商业验证工具",
            "opportunity": "免费发现新闻、博客、论坛、网站和X中的人物、品牌及关键词提及。",
            "improvements": ["用Boolean查询控制噪声并通过RSS保留来源", "把免费结果当线索而不是完整审计数据"],
            "kind": "web_product",
        },
        "ref-inoreader": {
            "titleZh": "资讯阅读器",
            "route": "B",
            "rank": 3,
            "category": "免费商业验证工具",
            "opportunity": "Free forever支持150个公开RSS订阅，适合快速验证KOL统一阅读池。",
            "improvements": ["先验证用户是否持续阅读和标记来源", "不要把Pro的规则、监控源和社交源配额误当免费能力"],
            "kind": "web_product",
        },
        "ref-distill": {
            "titleZh": "网页监测器",
            "route": "B",
            "rank": 4,
            "category": "免费商业验证工具",
            "opportunity": "免费25个监控、5个云端监控和每月1000次云检查，适合低频关键页面验证。",
            "improvements": ["仅用于少量公开页面的低频试验", "自行保存原文快照和哈希以补足免费版无变化历史"],
            "kind": "web_product",
        },
        "ref-browse-ai": {
            "titleZh": "浏览器采集助手",
            "route": "B",
            "rank": 5,
            "category": "免费商业验证工具",
            "opportunity": "用无代码浏览器任务验证难做RSS的公开页面能否稳定抽取结构化字段。",
            "improvements": ["只验证一个站点允许采集的公开来源", "不把绕过CAPTCHA、登录限制或平台条款作为产品前提"],
            "kind": "web_product",
        },
    }
    candidates = []
    for raw in source:
        detail = details[raw["candidate_id"]]
        candidates.append({
            "id": f"{run_dir.name}-{detail['route'].lower()}-{raw['candidate_id']}",
            "route": detail["route"],
            "title": raw["name"],
            "titleZh": detail["titleZh"],
            "productForm": raw["product_form"],
            "category": detail["category"],
            "market": "Global",
            "routeScore": raw["reference_fit_score"],
            "routeRank": detail["rank"],
            "decision": "ROUTE_WATCH",
            "dataCompleteness": 0.9 if raw["rank"] <= 6 else 0.82,
            "opportunity": detail["opportunity"],
            "improvements": detail["improvements"],
            "packageStatus": "BLOCKED",
            "packageId": None,
            "packageUrl": None,
            "packageSha256": None,
            "references": [{
                "name": raw["name"],
                "nameZh": detail["titleZh"],
                "kind": detail["kind"],
                "url": raw["url"],
                "store": None,
                "storeUrl": None,
                "relation": "similar",
            }],
            "iconUrl": None,
            "iconSource": "generated",
            "iconSourceUrl": None,
        })
    candidates.sort(key=lambda item: (item["route"], item["routeRank"]))
    payload = {
        "report": {
            "id": run_dir.name,
            "periodLabel": "2026-07-26 · KOL监控开源与免费工具调查",
            "publishedAt": "2026-07-26T22:30:00+08:00",
            "title": "KOL监控与推送：开源及免费商业产品精选10个",
            "summary": "精选5个开源底座和5个带长期免费额度的商业产品；本轮为参考对象调查，正式入选0个，10项保持WATCH。",
            "status": "research",
            "sourceRunId": run_dir.name,
            "methodologyVersion": "kol-reference-fit-v1",
            "payload": {
                "marketPulse": "最可落地的开源组合是RSSHub接入、changedetection.io变化检测、FreshRSS聚合与分类，再复用现有飞书人工确认和幂等推送。",
                "sources": [
                    "GitHub官方仓库、Release与API快照",
                    "Visualping官方免费档说明",
                    "Talkwalker Alerts官方页面",
                    "Inoreader官方价格页",
                    "Distill官方价格页",
                    "Browse AI官方价格与帮助中心",
                ],
                "scheduledCount": 0,
            },
        },
        "candidates": candidates,
    }
    (run_dir / "website-report.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    generated_path = ROOT / "site/lib/generated-reports.json"
    generated = json.loads(generated_path.read_text(encoding="utf-8"))
    generated = [item for item in generated if item["report"]["id"] != payload["report"]["id"]]
    generated.append(payload)
    generated_path.write_text(
        json.dumps(generated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    build_first()
    build_second()
    build_kol_reference_landscape()
