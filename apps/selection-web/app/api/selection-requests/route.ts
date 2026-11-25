import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";

const MODES = new Set(["broad", "directed", "gameplay-hunt", "competitor-expand", "pain-mine", "refresh"]);

export async function POST(request: Request) {
  try {
    const body = await request.json() as { mode?: unknown; quantity?: unknown; request?: unknown };
    const mode = typeof body.mode === "string" ? body.mode : "";
    const quantity = Number(body.quantity);
    const prompt = typeof body.request === "string" ? body.request.trim() : "";
    if (!MODES.has(mode)) return NextResponse.json({ error: "暂不支持这个任务类型" }, { status: 400 });
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return NextResponse.json({ error: "数量必须是 1–20 的整数" }, { status: 400 });
    if (!prompt || prompt.length > 1000) return NextResponse.json({ error: "请输入 1–1000 字的选品要求" }, { status: 400 });
    if (!env.DB) throw new Error("任务队列尚未连接");
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS selection_requests (
      id TEXT PRIMARY KEY, mode TEXT NOT NULL, quantity INTEGER NOT NULL, request TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued', report_id TEXT, error TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run();
    const columns = await env.DB.prepare("PRAGMA table_info(selection_requests)").all<{ name: string }>();
    const names = new Set(columns.results.map((column) => column.name));
    for (const statement of [
      ["report_id", "ALTER TABLE selection_requests ADD COLUMN report_id TEXT"],
      ["error", "ALTER TABLE selection_requests ADD COLUMN error TEXT"],
      ["updated_at", "ALTER TABLE selection_requests ADD COLUMN updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP"],
    ] as const) if (!names.has(statement[0])) await env.DB.prepare(statement[1]).run();
    const id = `sel_${crypto.randomUUID()}`;
    await env.DB.prepare("INSERT INTO selection_requests (id, mode, quantity, request, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)")
      .bind(id, mode, quantity, prompt).run();
    return NextResponse.json({ id, status: "queued", message: "已进入选品队列；完成后会自动入库网站并推送飞书。" }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "无法创建选品任务" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!env.DB) return NextResponse.json({ error: "任务队列尚未连接" }, { status: 500 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    const rows = await env.DB.prepare("SELECT id, mode, quantity, request, status, report_id, error, created_at, updated_at FROM selection_requests ORDER BY created_at DESC LIMIT 30").all();
    return NextResponse.json({ tasks: rows.results });
  }
  const row = await env.DB.prepare("SELECT id, mode, quantity, request, status, report_id, error, created_at, updated_at FROM selection_requests WHERE id = ?").bind(id).first();
  if (!row) return NextResponse.json({ error: "未找到任务" }, { status: 404 });
  return NextResponse.json(row);
}
