import { env } from "cloudflare:workers";

export const TASK_STATUSES = ["queued", "claimed", "processing", "review", "completed", "blocked", "cancelled", "failed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
  queued: ["claimed", "cancelled"],
  claimed: ["processing", "queued", "cancelled", "blocked", "failed"],
  processing: ["review", "completed", "queued", "blocked", "cancelled", "failed"],
  review: ["processing", "completed", "blocked", "cancelled"],
  completed: [],
  blocked: ["queued", "cancelled"],
  cancelled: [],
  failed: ["queued", "cancelled"],
};

export type SelectionTask = {
  id: string;
  mode: string;
  quantity: number;
  request: string;
  status: TaskStatus;
  report_id: string | null;
  error: string | null;
  requested_by: string | null;
  idempotency_key: string | null;
  assignee: string | null;
  worker_id: string | null;
  lease_id: string | null;
  lease_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

type Db = D1Database;

export function getSelectionDb(): Db {
  if (!env.DB) throw new Error("任务队列尚未连接");
  return env.DB;
}

export async function ensureSelectionRequestSchema(db: Db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS selection_requests (
      id TEXT PRIMARY KEY,
      mode TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      request TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      report_id TEXT,
      error TEXT,
      requested_by TEXT,
      idempotency_key TEXT,
      assignee TEXT,
      worker_id TEXT,
      lease_id TEXT,
      lease_expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS selection_request_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      event TEXT NOT NULL,
      from_status TEXT,
      to_status TEXT,
      actor TEXT,
      details TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS selection_request_leases (
      lease_id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      worker_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      released_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
  ]);

  const columns = await db.prepare("PRAGMA table_info(selection_requests)").all<{ name: string }>();
  const names = new Set(columns.results.map((column) => column.name));
  const additions: [string, string][] = [
    ["report_id", "ALTER TABLE selection_requests ADD COLUMN report_id TEXT"],
    ["error", "ALTER TABLE selection_requests ADD COLUMN error TEXT"],
    ["requested_by", "ALTER TABLE selection_requests ADD COLUMN requested_by TEXT"],
    ["idempotency_key", "ALTER TABLE selection_requests ADD COLUMN idempotency_key TEXT"],
    ["assignee", "ALTER TABLE selection_requests ADD COLUMN assignee TEXT"],
    ["worker_id", "ALTER TABLE selection_requests ADD COLUMN worker_id TEXT"],
    ["lease_id", "ALTER TABLE selection_requests ADD COLUMN lease_id TEXT"],
    ["lease_expires_at", "ALTER TABLE selection_requests ADD COLUMN lease_expires_at TEXT"],
    // SQLite does not allow adding a column with a non-constant default.
    // Keep the migration compatible with the original lightweight queue table.
    ["updated_at", "ALTER TABLE selection_requests ADD COLUMN updated_at TEXT"],
  ];
  for (const [name, statement] of additions) {
    if (!names.has(name)) await db.prepare(statement).run();
  }
  await db.prepare("UPDATE selection_requests SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP) WHERE updated_at IS NULL").run();
  await db.batch([
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS selection_requests_idempotency_idx ON selection_requests(idempotency_key) WHERE idempotency_key IS NOT NULL"),
    db.prepare("CREATE INDEX IF NOT EXISTS selection_requests_status_idx ON selection_requests(status, created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS selection_request_events_task_idx ON selection_request_events(task_id, created_at)"),
  ]);
}

export async function recordTaskEvent(db: Db, taskId: string, event: string, fromStatus: string | null, toStatus: string | null, actor: string | null, details?: unknown) {
  await db.prepare("INSERT INTO selection_request_events (task_id, event, from_status, to_status, actor, details) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(taskId, event, fromStatus, toStatus, actor, details ? JSON.stringify(details) : null).run();
}

export async function getTask(db: Db, id: string): Promise<SelectionTask | null> {
  return db.prepare("SELECT id, mode, quantity, request, status, report_id, error, requested_by, idempotency_key, assignee, worker_id, lease_id, lease_expires_at, created_at, updated_at FROM selection_requests WHERE id = ?")
    .bind(id).first<SelectionTask>();
}

export async function listTaskEvents(db: Db, id: string) {
  const rows = await db.prepare("SELECT id, event, from_status, to_status, actor, details, created_at FROM selection_request_events WHERE task_id = ? ORDER BY created_at ASC, id ASC")
    .bind(id).all();
  return rows.results;
}

export async function reclaimExpiredTasks(db: Db, actor = "lease-reaper") {
  const expired = await db.prepare("SELECT id, status, lease_id FROM selection_requests WHERE status IN ('claimed', 'processing') AND lease_expires_at IS NOT NULL AND lease_expires_at < CURRENT_TIMESTAMP").all<{ id: string; status: TaskStatus; lease_id: string | null }>();
  for (const task of expired.results) {
    await db.prepare("UPDATE selection_requests SET status = 'queued', worker_id = NULL, lease_id = NULL, lease_expires_at = NULL, updated_at = CURRENT_TIMESTAMP, error = ? WHERE id = ? AND status IN ('claimed', 'processing')")
      .bind("租约已过期，任务已回收", task.id).run();
    if (task.lease_id) await db.prepare("UPDATE selection_request_leases SET released_at = CURRENT_TIMESTAMP WHERE lease_id = ?").bind(task.lease_id).run();
    await recordTaskEvent(db, task.id, "lease_expired", task.status, "queued", actor);
  }
  return expired.results.length;
}

export async function createTask(db: Db, input: { mode: string; quantity: number; request: string; requestedBy?: string | null; idempotencyKey?: string | null }) {
  if (input.idempotencyKey) {
    const existing = await db.prepare("SELECT id, status FROM selection_requests WHERE idempotency_key = ?").bind(input.idempotencyKey).first<{ id: string; status: TaskStatus }>();
    if (existing) return { id: existing.id, status: existing.status, reused: true };
  }
  const id = `sel_${crypto.randomUUID()}`;
  try {
    await db.prepare("INSERT INTO selection_requests (id, mode, quantity, request, requested_by, idempotency_key, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'queued', CURRENT_TIMESTAMP)")
      .bind(id, input.mode, input.quantity, input.request, input.requestedBy ?? null, input.idempotencyKey ?? null).run();
  } catch (error) {
    // Two concurrent requests with the same idempotency key may both miss the read above.
    // Resolve the unique-index race to the original task instead of returning a 500.
    if (input.idempotencyKey) {
      const existing = await db.prepare("SELECT id, status FROM selection_requests WHERE idempotency_key = ?").bind(input.idempotencyKey).first<{ id: string; status: TaskStatus }>();
      if (existing) return { id: existing.id, status: existing.status, reused: true };
    }
    throw error;
  }
  await recordTaskEvent(db, id, "created", null, "queued", input.requestedBy ?? "system", { mode: input.mode, quantity: input.quantity });
  return { id, status: "queued" as const, reused: false };
}

export async function claimTask(db: Db, workerId: string, actor = workerId) {
  await reclaimExpiredTasks(db, actor);
  const leaseId = `lease_${crypto.randomUUID()}`;
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString().replace("T", " ").replace("Z", "");
  const candidate = await db.prepare("SELECT id, status FROM selection_requests WHERE status = 'queued' ORDER BY created_at ASC LIMIT 1").first<{ id: string; status: TaskStatus }>();
  if (!candidate) return null;
  const updated = await db.prepare("UPDATE selection_requests SET status = 'claimed', worker_id = ?, assignee = ?, lease_id = ?, lease_expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'queued'")
    .bind(workerId, actor, leaseId, expires, candidate.id).run();
  if (!updated.meta.changes) return null;
  await db.prepare("INSERT INTO selection_request_leases (lease_id, task_id, worker_id, expires_at) VALUES (?, ?, ?, ?)").bind(leaseId, candidate.id, workerId, expires).run();
  await recordTaskEvent(db, candidate.id, "claimed", "queued", "claimed", actor, { workerId, leaseId, expires });
  return getTask(db, candidate.id);
}

export async function updateTask(db: Db, input: { id: string; status: TaskStatus; reportId?: string | null; error?: string | null; actor?: string | null; leaseId?: string | null }) {
  const current = await getTask(db, input.id);
  if (!current) return { error: "未找到任务", status: 404 as const };
  if (!TASK_STATUSES.includes(input.status)) return { error: "无效的任务状态", status: 400 as const };
  if (current.status !== input.status && !ALLOWED_TRANSITIONS[current.status].includes(input.status)) {
    return { error: `不允许从 ${current.status} 转为 ${input.status}`, status: 409 as const };
  }
  if (current.lease_id && current.lease_id !== input.leaseId) return { error: "任务租约不匹配", status: 409 as const };
  if (current.status === "completed" && input.status !== "completed") return { error: "已完成任务不可回退", status: 409 as const };
  if (input.status === "completed" && !input.reportId && !current.report_id) return { error: "完成任务必须提供报告回执", status: 422 as const };
  await db.prepare("UPDATE selection_requests SET status = ?, report_id = COALESCE(?, report_id), error = ?, updated_at = CURRENT_TIMESTAMP, lease_expires_at = CASE WHEN ? IN ('completed', 'blocked', 'cancelled', 'failed') THEN NULL ELSE lease_expires_at END, lease_id = CASE WHEN ? IN ('completed', 'blocked', 'cancelled', 'failed') THEN NULL ELSE lease_id END, worker_id = CASE WHEN ? IN ('completed', 'blocked', 'cancelled', 'failed') THEN NULL ELSE worker_id END WHERE id = ?")
    .bind(input.status, input.reportId ?? null, input.error ?? null, input.status, input.status, input.status, input.id).run();
  if (["completed", "blocked", "cancelled", "failed"].includes(input.status) && current.lease_id) {
    await db.prepare("UPDATE selection_request_leases SET released_at = CURRENT_TIMESTAMP WHERE lease_id = ?").bind(current.lease_id).run();
  }
  await recordTaskEvent(db, input.id, "status_changed", current.status, input.status, input.actor ?? current.worker_id ?? "system", { reportId: input.reportId ?? null, error: input.error ?? null });
  return { task: await getTask(db, input.id) };
}
