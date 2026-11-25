import { NextResponse } from "next/server";
import { ensureSelectionRequestSchema, getSelectionDb, updateTask, type TaskStatus } from "../../../../lib/selectionRequests";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { id?: unknown; status?: unknown; report_id?: unknown; error?: unknown; actor?: unknown; lease_id?: unknown };
    if (typeof body.id !== "string" || typeof body.status !== "string") return NextResponse.json({ error: "无效的任务更新" }, { status: 400 });
    const db = getSelectionDb();
    await ensureSelectionRequestSchema(db);
    const result = await updateTask(db, {
      id: body.id,
      status: body.status as TaskStatus,
      reportId: typeof body.report_id === "string" ? body.report_id : null,
      error: typeof body.error === "string" ? body.error.slice(0, 2000) : null,
      actor: typeof body.actor === "string" ? body.actor : null,
      leaseId: typeof body.lease_id === "string" ? body.lease_id : null,
    });
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "任务更新失败" }, { status: 500 });
  }
}
