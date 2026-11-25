"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "../components/AppShell";

const modes = [
  ["broad", "宽泛选品", "跨品类找热门与增长机会"],
  ["directed", "定向选品", "按国家、平台、人群或品类筛选"],
  ["gameplay-hunt", "游戏玩法", "找已被市场验证的游戏循环"],
  ["competitor-expand", "竞品扩展", "围绕指定 App 找替代与相邻机会"],
  ["pain-mine", "痛点挖掘", "从一个用户任务反推产品机会"],
  ["refresh", "候选复评", "复查已有候选的最新证据"],
] as const;

const statusLabels: Record<string, string> = {
  queued: "排队中",
  claimed: "已认领",
  processing: "研究中",
  review: "待复核",
  completed: "已完成",
  blocked: "已阻塞",
  failed: "失败",
  cancelled: "已取消",
};

export default function SelectorPage() {
  const [mode, setMode] = useState("broad");
  const [quantity, setQuantity] = useState("10");
  const [request, setRequest] = useState("");
  const [status, setStatus] = useState("");
  const [taskError, setTaskError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [pendingIdempotencyKey, setPendingIdempotencyKey] = useState<string | null>(null);
  const [retryingTaskId, setRetryingTaskId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Array<{ id: string; mode: string; quantity: number; request: string; status: string; report_id?: string; error?: string; worker_id?: string | null; lease_expires_at?: string | null; updated_at?: string; created_at: string }>>([]);

  async function refreshTasks() {
    try {
      const response = await fetch("/api/selection-requests", { cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "任务列表暂时不可用");
      setTasks(result.tasks ?? []);
      setTaskError("");
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : "任务列表暂时不可用");
    }
  }
  useEffect(() => {
    const initial = window.setTimeout(refreshTasks, 0);
    const timer = window.setInterval(refreshTasks, 5000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, []);

  async function submit() {
    setBusy(true); setStatus("");
    const idempotencyKey = pendingIdempotencyKey ?? crypto.randomUUID();
    setPendingIdempotencyKey(idempotencyKey);
    try {
      const response = await fetch("/api/selection-requests", { method: "POST", headers: { "content-type": "application/json", "Idempotency-Key": idempotencyKey }, body: JSON.stringify({ mode, quantity: Number(quantity), request, idempotencyKey }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "无法启动选品");
      setPendingIdempotencyKey(null);
      setStatus(`${result.message}${result.reused ? "，已复用已有任务" : ""} 任务号：${result.id}`);
      const taskId = result.id as string;
      const poll = async () => {
        const taskResponse = await fetch(`/api/selection-requests?id=${encodeURIComponent(taskId)}`, { cache: "no-store" });
        if (!taskResponse.ok) return;
        const taskResult = await taskResponse.json();
        const task = taskResult.task ?? taskResult;
        if (task.status === "completed") setStatus(`选品已完成，报告已入库${task.report_id ? `：${task.report_id}` : ""}。`);
        else if (["failed", "blocked", "cancelled"].includes(task.status)) setStatus(`选品任务${statusLabels[task.status] ?? task.status}：${task.error ?? "请检查任务日志"}`);
        else window.setTimeout(poll, 5000);
      };
      window.setTimeout(poll, 1500);
      refreshTasks();
      setRequest("");
    } catch (error) { setStatus(error instanceof Error ? error.message : "无法启动选品"); }
    finally { setBusy(false); }
  }

  async function retryTask(taskId: string) {
    setRetryingTaskId(taskId);
    try {
      const response = await fetch("/api/selection-requests/update", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: taskId, status: "queued", actor: "selector-retry" }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "任务重新排队失败");
      setStatus(`任务 ${taskId} 已重新排队。`);
      await refreshTasks();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "任务重新排队失败");
    } finally {
      setRetryingTaskId(null);
    }
  }

  return <AppShell active="selector">
    <section className="page-title-row"><div><p className="eyebrow">SELECTION LAUNCHER</p><h1>启动一次选品</h1><p>选择任务类型、数量，再用一句话描述要求。系统只接受选品相关任务。</p></div></section>
    <section className="ingest-layout">
      <div className="ingest-guide"><span className="section-index">WORKFLOW</span><ol><li><b>01</b><span>选择器限定任务范围</span></li><li><b>02</b><span>服务端创建可追踪任务</span></li><li><b>03</b><span>研究完成后自动入库网站</span></li><li><b>04</b><span>网站成功后自动推送飞书</span></li></ol><p>选品结果仍需经过证据门槛；游戏项目的入选只代表进入灰盒验证。</p></div>
      <div className="json-editor selector-form"><label>选品类型</label><div className="selector-grid">{modes.map(([id, title, desc]) => <button type="button" className={mode === id ? "selector-option active" : "selector-option"} onClick={() => setMode(id)} key={id}><b>{title}</b><small>{desc}</small></button>)}</div><label htmlFor="quantity">希望返回数量</label><input id="quantity" type="number" min="1" max="20" value={quantity} onChange={e => setQuantity(e.target.value)} /><label htmlFor="request">对话式要求</label><textarea id="request" value={request} onChange={e => setRequest(e.target.value)} placeholder="例如：分析美国免费榜上热门、增长快的手机游戏，优先轻量益智，输出 20 个机会。" /><button disabled={busy} onClick={submit}>{busy ? "正在创建任务…" : "启动选品"}</button>{status && <p role="status">{status}</p>}</div>
    </section>
    <section className="task-board" aria-labelledby="task-board-title">
      <div className="task-board-heading">
        <div><span className="section-index">TASK BOARD</span><h2 id="task-board-title">正在运行与历史任务</h2></div>
        <div className="task-board-actions"><label htmlFor="task-status-filter">状态</label><select id="task-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">全部</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><button type="button" onClick={refreshTasks}>刷新</button></div>
      </div>
      <p className="task-board-note">任务按创建时间倒序显示。状态以服务端回执为准，报告链接只在完成后出现。</p>
      {taskError ? <div className="task-board-error" role="alert"><span>{taskError}</span><button type="button" onClick={refreshTasks}>重试</button></div> : null}
      {tasks.length === 0 ? <p className="empty-state">还没有启动任务。</p> : null}
      {tasks.length > 0 && tasks.filter((task) => statusFilter === "all" || task.status === statusFilter).length === 0 ? <p className="empty-state">当前状态没有任务。</p> : null}
      <div className="task-list">{tasks.filter((task) => statusFilter === "all" || task.status === statusFilter).map((task, index) => <article className="task-row" key={task.id}><span className="task-number">{String(index + 1).padStart(2, "0")}</span><div><strong>{task.id}</strong><p>{task.request}</p><small>{task.mode} · {task.quantity} 个 · {formatTaskDate(task.created_at)} · 更新 {formatTaskDate(task.updated_at ?? task.created_at)}</small>{task.worker_id ? <small>执行器：{task.worker_id}{task.lease_expires_at ? ` · 租约至 ${formatTaskDate(task.lease_expires_at)}` : ""}</small> : null}</div><div className={`task-status status-${task.status}`}><b>{statusLabels[task.status] ?? task.status}</b><small>{task.report_id ? <Link href={`/reports/${encodeURIComponent(task.report_id)}`}>打开报告 ↗</Link> : task.error ?? "等待 Worker 更新阶段"}</small>{["failed", "blocked"].includes(task.status) ? <button type="button" disabled={retryingTaskId === task.id} onClick={() => retryTask(task.id)}>{retryingTaskId === task.id ? "重新排队中…" : "重新排队"}</button> : null}</div></article>)}</div>
    </section>
  </AppShell>;
}

function formatTaskDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "时间待同步" : date.toLocaleString("zh-CN");
}
