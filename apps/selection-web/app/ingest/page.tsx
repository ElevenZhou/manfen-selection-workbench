"use client";

import { useState } from "react";
import { AppShell } from "../components/AppShell";

export default function IngestPage() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"paste" | "guide">("paste");

  async function submit() {
    setBusy(true);
    setStatus("");
    try {
      const parsed = JSON.parse(value);
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "入库失败");
      setStatus(`已保存报告 ${result.id}。前往“选品报告”即可查看。`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "无法读取这份JSON");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell active="ingest">
      <section className="page-title-row">
        <div>
          <p className="eyebrow">AI整理提交</p>
          <h1>把其他 AI 整理的内容提交成正式任务</h1>
          <p>粘贴其他 AI 工具整理的选品清单，系统会按标准结构校验并提交到任务系统，供后续补证和制作。</p>
        </div>
      </section>
      <section className="ingest-layout workbench-ingest">
        <div className="ingest-guide"><div className="ingest-mode-tabs"><button className={mode === "paste" ? "active" : ""} onClick={() => setMode("paste")}>粘贴清单</button><button className={mode === "guide" ? "active" : ""} onClick={() => setMode("guide")}>提交说明</button></div>{mode === "guide" ? <div className="ingest-guide-copy"><h2>把外部整理变成可执行任务</h2><p>支持其他 AI 工具输出的候选清单。粘贴标准 JSON 后，系统会保留来源、路线、机会和证据字段，进入候选账本供复核。</p><ul><li>先补来源与市场范围</li><li>再核对主竞品和机会分</li><li>确认后进入制作档案</li></ul></div> : null}
          <span className="section-index">HOW IT WORKS</span>
          <ol>
            <li><b>01</b><span>其他 AI 工具整理选品清单</span></li>
            <li><b>02</b><span>补充来源、市场与机会信息</span></li>
            <li><b>03</b><span>提交后进入选品报告与候选清单</span></li>
            <li><b>04</b><span>人工复核后再进入制作档案</span></li>
          </ol>
          <p>相同报告ID不会覆盖；需要修订时使用新的版本ID，保留历史可追溯性。</p>
        </div>
        <div className="json-editor">
          <label htmlFor="report-json">报告 JSON</label>
          <textarea
            id="report-json"
            spellCheck={false}
            placeholder="粘贴 Selection Loop 生成的标准报告 JSON"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <div className="ingest-submit-row">
            <button className="primary-cta" disabled={busy} onClick={submit}>{busy ? "正在保存…" : "验证并保存"}</button>
            {status && <p className="submit-status" role="status">{status}</p>}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
