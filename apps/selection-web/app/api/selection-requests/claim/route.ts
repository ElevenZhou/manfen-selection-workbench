import { NextResponse } from "next/server";
import { claimTask, ensureSelectionRequestSchema, getSelectionDb } from "../../../../lib/selectionRequests";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as { workerId?: unknown; actor?: unknown };
    const workerId = typeof body.workerId === "string" && body.workerId.trim() ? body.workerId.trim() : "selection-worker";
    const actor = typeof body.actor === "string" && body.actor.trim() ? body.actor.trim() : workerId;
    const db = getSelectionDb();
    await ensureSelectionRequestSchema(db);
    const task = await claimTask(db, workerId, actor);
    return NextResponse.json({ task, message: task ? "任务已领取" : "没有待处理任务" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "任务领取失败" }, { status: 500 });
  }
}
