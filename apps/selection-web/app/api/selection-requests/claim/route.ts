import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";

export async function POST() {
  if (!env.DB) return NextResponse.json({ error: "任务队列尚未连接" }, { status: 500 });
  const task = await env.DB.prepare("SELECT id, mode, quantity, request FROM selection_requests WHERE status = 'queued' ORDER BY created_at LIMIT 1").first<{ id: string; mode: string; quantity: number; request: string }>();
  if (!task) return NextResponse.json({ task: null, message: "没有待处理任务" });
  await env.DB.prepare("UPDATE selection_requests SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'queued'").bind(task.id).run();
  return NextResponse.json({ task: { ...task, status: "processing" } });
}
