import { NextResponse } from "next/server";
import { createTask, ensureSelectionRequestSchema, getSelectionDb, getTask, listTaskEvents, reclaimExpiredTasks } from "../../../lib/selectionRequests";

const MODES = new Set(["broad", "directed", "gameplay-hunt", "competitor-expand", "pain-mine", "refresh"]);
// selection_requests starts every new task at status: "queued".

export async function POST(request: Request) {
  try {
    const body = await request.json() as { mode?: unknown; quantity?: unknown; request?: unknown; requestedBy?: unknown; idempotencyKey?: unknown };
    const mode = typeof body.mode === "string" ? body.mode : "";
    const quantity = Number(body.quantity);
    const prompt = typeof body.request === "string" ? body.request.trim() : "";
    if (!MODES.has(mode)) return NextResponse.json({ error: "暂不支持这个任务类型" }, { status: 400 });
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return NextResponse.json({ error: "数量必须是 1–20 的整数" }, { status: 400 });
    if (!prompt || prompt.length > 1000) return NextResponse.json({ error: "请输入 1–1000 字的选品要求" }, { status: 400 });
    const db = getSelectionDb();
    await ensureSelectionRequestSchema(db);
    const result = await createTask(db, {
      mode,
      quantity,
      request: prompt,
      requestedBy: typeof body.requestedBy === "string" ? body.requestedBy : null,
      idempotencyKey: typeof body.idempotencyKey === "string" && body.idempotencyKey.length <= 160
        ? body.idempotencyKey
        : request.headers.get("Idempotency-Key"),
    });
    return NextResponse.json({ ...result, message: result.reused ? "幂等键已对应已有任务" : "已进入选品队列" }, { status: result.reused ? 200 : 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "无法创建选品任务" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const db = getSelectionDb();
    await ensureSelectionRequestSchema(db);
    await reclaimExpiredTasks(db);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (id) {
      const task = await getTask(db, id);
      if (!task) return NextResponse.json({ error: "未找到任务" }, { status: 404 });
      return NextResponse.json({ task, events: await listTaskEvents(db, id) });
    }
    const status = url.searchParams.get("status");
    const requestedLimit = Number(url.searchParams.get("limit") || 30);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 100) : 30;
    const query = status && ["queued", "claimed", "processing", "review", "completed", "blocked", "cancelled", "failed"].includes(status)
      ? db.prepare("SELECT id, mode, quantity, request, status, report_id, error, requested_by, idempotency_key, assignee, worker_id, lease_id, lease_expires_at, created_at, updated_at FROM selection_requests WHERE status = ? ORDER BY created_at DESC LIMIT ?").bind(status, limit)
      : db.prepare("SELECT id, mode, quantity, request, status, report_id, error, requested_by, idempotency_key, assignee, worker_id, lease_id, lease_expires_at, created_at, updated_at FROM selection_requests ORDER BY created_at DESC LIMIT ?").bind(limit);
    const rows = await query.all();
    return NextResponse.json({ tasks: rows.results });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "任务读取失败" }, { status: 500 });
  }
}
