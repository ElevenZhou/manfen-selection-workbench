import { NextResponse } from "next/server";
import { ensureSelectionRequestSchema, getSelectionDb, getTask } from "../../../../lib/selectionRequests";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { id?: unknown; lease_id?: unknown; workerId?: unknown };
    if (typeof body.id !== "string" || typeof body.lease_id !== "string") return NextResponse.json({ error: "缺少任务或租约" }, { status: 400 });
    const db = getSelectionDb();
    await ensureSelectionRequestSchema(db);
    const task = await getTask(db, body.id);
    if (!task || task.lease_id !== body.lease_id || (body.workerId && task.worker_id !== body.workerId)) return NextResponse.json({ error: "任务租约不匹配" }, { status: 409 });
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString().replace("T", " ").replace("Z", "");
    await db.prepare("UPDATE selection_requests SET lease_expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND lease_id = ? AND status IN ('claimed', 'processing')").bind(expires, body.id, body.lease_id).run();
    await db.prepare("UPDATE selection_request_leases SET expires_at = ? WHERE lease_id = ? AND released_at IS NULL").bind(expires, body.lease_id).run();
    return NextResponse.json({ id: body.id, lease_id: body.lease_id, lease_expires_at: expires });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "租约续期失败" }, { status: 500 });
  }
}
