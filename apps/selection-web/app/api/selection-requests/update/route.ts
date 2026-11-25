import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";

export async function POST(request: Request) {
  if (!env.DB) return NextResponse.json({ error: "任务队列尚未连接" }, { status: 500 });
  const body = await request.json() as { id?: unknown; status?: unknown; report_id?: unknown; error?: unknown };
  if (typeof body.id !== "string" || !["queued", "processing", "completed", "failed"].includes(String(body.status))) return NextResponse.json({ error: "无效的任务更新" }, { status: 400 });
  await env.DB.prepare("UPDATE selection_requests SET status = ?, report_id = ?, error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(body.status, body.report_id ?? null, body.error ?? null, body.id).run();
  return NextResponse.json({ id: body.id, status: body.status });
}
