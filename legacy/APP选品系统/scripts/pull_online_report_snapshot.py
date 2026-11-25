#!/usr/bin/env python3
"""Pull the public report-level snapshot from the hosted selection site."""
from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path
from urllib.request import Request, urlopen

DEFAULT_URL = "https://select.1add2.com/api/reports"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument("--out", type=Path, default=None)
    args = parser.parse_args()
    output = args.out or Path("outputs") / f"online-sync-{date.today().isoformat()}"
    output.mkdir(parents=True, exist_ok=True)
    request = Request(args.url, headers={"User-Agent": "APP-selection-system-sync/1.0"})
    with urlopen(request, timeout=30) as response:
        payload = json.load(response)
    reports = payload.get("reports", [])
    local_path = Path("site/lib/generated-reports.json")
    local = json.loads(local_path.read_text()) if local_path.exists() else []
    local_ids = {item["report"]["id"] for item in local}
    online_ids = {item["id"] for item in reports}
    (output / "reports.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    manifest = {
        "pulledAt": date.today().isoformat(),
        "source": args.url,
        "onlineReportCount": len(reports),
        "localGeneratedReportCount": len(local),
        "onlineOnlyReportIds": sorted(online_ids - local_ids),
        "sharedReportIds": sorted(online_ids & local_ids),
        "note": "该公开接口只返回报告级数据和 payload，候选明细、制作档案和任务状态需要单独导出接口。",
    }
    (output / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
