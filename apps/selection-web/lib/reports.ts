import { env } from "cloudflare:workers";
import generatedReports from "./generated-reports.json";
import type {
  AppReference,
  Candidate,
  CandidateArchiveEntry,
  CandidateArchiveFilters,
  ProjectRecord,
  ProjectConcept,
  PromptVersion,
  ProjectStatus,
  Report,
  ReportPayload,
  RouteId,
  DashboardMetrics,
  DashboardTaskSummary,
} from "./types";

let schemaReady = false;

function getDatabase(): D1Database {
  if (!env.DB) throw new Error("报告数据库尚未连接");
  return env.DB;
}

async function ensureSchema() {
  if (schemaReady) return;
  const db = getDatabase();
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      period_label TEXT NOT NULL,
      published_at TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      status TEXT NOT NULL,
      total_selected INTEGER NOT NULL,
      total_packages INTEGER NOT NULL,
      source_run_id TEXT NOT NULL,
      methodology_version TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      route TEXT NOT NULL,
      title TEXT NOT NULL,
      title_zh TEXT NOT NULL DEFAULT '',
      product_form TEXT NOT NULL DEFAULT 'mobile_app',
      category TEXT NOT NULL,
      market TEXT NOT NULL,
      route_score REAL NOT NULL,
      route_rank INTEGER NOT NULL,
      decision TEXT NOT NULL,
      data_completeness REAL NOT NULL,
      opportunity TEXT NOT NULL,
      improvements TEXT NOT NULL,
      package_status TEXT NOT NULL,
      package_id TEXT,
      package_url TEXT,
      package_sha256 TEXT,
      reference_apps TEXT NOT NULL DEFAULT '[]',
      icon_url TEXT,
      icon_source TEXT NOT NULL DEFAULT 'generated',
      icon_source_url TEXT,
      FOREIGN KEY (report_id) REFERENCES reports(id)
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS reports_published_at_idx ON reports(published_at DESC)"),
    db.prepare("CREATE INDEX IF NOT EXISTS candidates_report_route_idx ON candidates(report_id, route, route_rank)"),
    db.prepare(`CREATE TABLE IF NOT EXISTS build_projects (
      candidate_id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'SELECTED',
      selected_concept TEXT,
      concept_options TEXT NOT NULL DEFAULT '[]',
      ai_studio_url TEXT,
      github_url TEXT,
      apk_url TEXT,
      test_url TEXT,
      test_result TEXT NOT NULL DEFAULT '',
      store_url TEXT,
      notes TEXT NOT NULL DEFAULT '',
      assignee TEXT NOT NULL DEFAULT '',
      prompt_version TEXT NOT NULL DEFAULT '1.0',
      prompt_text TEXT NOT NULL DEFAULT '',
      prompt_versions TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
  ]);
  await ensureCandidatePresentationColumns(db);
  await ensureBuildProjectColumns(db);
  schemaReady = true;
  await seedDatabase();
  await backfillLocalizedNames();
}

async function ensureBuildProjectColumns(db: D1Database) {
  const columns = await db.prepare("PRAGMA table_info(build_projects)").all<{ name: string }>();
  const names = new Set(columns.results.map((column) => column.name));
  const migrations = [
    ["concept_options", "ALTER TABLE build_projects ADD COLUMN concept_options TEXT NOT NULL DEFAULT '[]'"],
    ["test_result", "ALTER TABLE build_projects ADD COLUMN test_result TEXT NOT NULL DEFAULT ''"],
    ["prompt_versions", "ALTER TABLE build_projects ADD COLUMN prompt_versions TEXT NOT NULL DEFAULT '[]'"],
    ["assignee", "ALTER TABLE build_projects ADD COLUMN assignee TEXT NOT NULL DEFAULT ''"],
  ] as const;
  for (const [name, statement] of migrations) if (!names.has(name)) await db.prepare(statement).run();
}

async function ensureCandidatePresentationColumns(db: D1Database) {
  const columns = await db.prepare("PRAGMA table_info(candidates)").all<{ name: string }>();
  const names = new Set(columns.results.map((column) => column.name));
  const migrations = [
    ["title_zh", "ALTER TABLE candidates ADD COLUMN title_zh TEXT NOT NULL DEFAULT ''"],
    ["product_form", "ALTER TABLE candidates ADD COLUMN product_form TEXT NOT NULL DEFAULT 'mobile_app'"],
    ["reference_apps", "ALTER TABLE candidates ADD COLUMN reference_apps TEXT NOT NULL DEFAULT '[]'"],
    ["package_id", "ALTER TABLE candidates ADD COLUMN package_id TEXT"],
    ["package_url", "ALTER TABLE candidates ADD COLUMN package_url TEXT"],
    ["package_sha256", "ALTER TABLE candidates ADD COLUMN package_sha256 TEXT"],
    ["icon_url", "ALTER TABLE candidates ADD COLUMN icon_url TEXT"],
    ["icon_source", "ALTER TABLE candidates ADD COLUMN icon_source TEXT NOT NULL DEFAULT 'generated'"],
    ["icon_source_url", "ALTER TABLE candidates ADD COLUMN icon_source_url TEXT"],
  ] as const;
  for (const [name, statement] of migrations) {
    if (!names.has(name)) await db.prepare(statement).run();
  }
}

async function backfillLocalizedNames() {
  const db = getDatabase();
  const builtIns = generatedReports.map((value) => validateInput(value));
  const statements = builtIns.flatMap(({ report, candidates }) =>
    candidates.map((item) =>
      db.prepare(`UPDATE candidates
        SET title_zh = ?, product_form = ?, reference_apps = ?
        WHERE id = ? AND report_id = ?`).bind(
        item.titleZh,
        item.productForm,
        JSON.stringify(item.references),
        item.id,
        report.id,
      ),
    ),
  );
  if (statements.length) await db.batch(statements);
}

async function seedDatabase() {
  const db = getDatabase();
  const builtIns = generatedReports.map((value) => validateInput(value));
  for (const item of builtIns) {
    const exists = await db.prepare("SELECT id FROM reports WHERE id = ?").bind(item.report.id).first();
    if (!exists) await insertReport(item.report, item.candidates);
  }
}

async function insertReport(report: Report, candidates: Candidate[]) {
  const db = getDatabase();
  const statements = [
    db.prepare(`INSERT INTO reports (
      id, period_label, published_at, title, summary, status, total_selected,
      total_packages, source_run_id, methodology_version, payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
      report.id,
      report.periodLabel,
      report.publishedAt,
      report.title,
      report.summary,
      report.status,
      report.totalSelected,
      report.totalPackages,
      report.sourceRunId,
      report.methodologyVersion,
      JSON.stringify(report.payload),
    ),
    ...candidates.map((item) =>
      db.prepare(`INSERT INTO candidates (
        id, report_id, route, title, title_zh, product_form, category, market, route_score, route_rank,
        decision, data_completeness, opportunity, improvements, package_status,
        package_id, package_url, package_sha256, reference_apps, icon_url,
        icon_source, icon_source_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        item.id,
        report.id,
        item.route,
        item.title,
        item.titleZh,
        item.productForm,
        item.category,
        item.market,
        item.routeScore,
        item.routeRank,
        item.decision,
        item.dataCompleteness,
        item.opportunity,
        JSON.stringify(item.improvements),
        item.packageStatus,
        item.packageId,
        item.packageUrl,
        item.packageSha256,
        JSON.stringify(item.references),
        item.iconUrl,
        item.iconSource,
        item.iconSourceUrl,
      ),
    ),
  ];
  await db.batch(statements);
}

export async function listReports(): Promise<Report[]> {
  await ensureSchema();
  const rows = await getDatabase().prepare("SELECT * FROM reports ORDER BY published_at DESC").all<ReportRow>();
  return rows.results.map(mapReport);
}

export async function getReport(id: string): Promise<{ report: Report; candidates: Candidate[] } | null> {
  await ensureSchema();
  const reportRow = await getDatabase().prepare("SELECT * FROM reports WHERE id = ?").bind(id).first<ReportRow>();
  if (!reportRow) return null;
  const rows = await getDatabase().prepare(
    "SELECT * FROM candidates WHERE report_id = ? ORDER BY route, route_rank",
  ).bind(id).all<CandidateRow>();
  return { report: mapReport(reportRow), candidates: rows.results.map(mapCandidate) };
}

export async function getDashboard() {
  const reports = await listReports();
  const latest = reports.find((report) => report.status !== "research");
  const data = latest ? await getReport(latest.id) : null;
  const candidates = data?.candidates ?? [];
  const metrics: DashboardMetrics = {
    reportCount: reports.length,
    selectedCount: candidates.filter((item) => item.decision === "ROUTE_SELECTED").length,
    backupCount: candidates.filter((item) => item.decision === "ROUTE_BACKUP").length,
    watchCount: candidates.filter((item) => item.decision === "ROUTE_WATCH").length,
    packageReadyCount: candidates.filter((item) => item.packageStatus === "READY_FOR_BENCH").length,
    averageCompleteness: candidates.length ? Math.round(candidates.reduce((sum, item) => sum + item.dataCompleteness, 0) / candidates.length * 100) / 100 : null,
    latestCollectedAt: latest?.publishedAt ?? null,
  };
  const taskSummary: DashboardTaskSummary = { queued: 0, processing: 0, completed: 0, failed: 0, total: 0 };
  try {
    const rows = await getDatabase().prepare("SELECT status, COUNT(*) AS count FROM selection_requests GROUP BY status").all<{ status: string; count: number }>();
    for (const row of rows.results) {
      if (row.status === "queued" || row.status === "processing" || row.status === "completed" || row.status === "failed") taskSummary[row.status] = Number(row.count);
    }
    taskSummary.total = taskSummary.queued + taskSummary.processing + taskSummary.completed + taskSummary.failed;
  } catch {
    // Older deployments may not have the optional task queue yet.
  }
  return { reports, latest, candidates, metrics, taskSummary };
}

export async function listCandidateArchive(filters: CandidateArchiveFilters = {}): Promise<CandidateArchiveEntry[]> {
  await ensureSchema();
  const where: string[] = ["r.status != 'research'"];
  const values: unknown[] = [];
  const add = (clause: string, value: unknown) => {
    where.push(clause);
    values.push(value);
  };

  if (filters.reportId) add("c.report_id = ?", filters.reportId);
  if (filters.route && ["A", "B", "C"].includes(filters.route)) add("c.route = ?", filters.route);
  if (filters.productForm) add("c.product_form = ?", filters.productForm);
  if (filters.decision) add("c.decision = ?", filters.decision);
  if (filters.packageStatus) add("c.package_status = ?", filters.packageStatus);
  if (filters.category) add("c.category = ?", filters.category);
  if (filters.market) add("c.market = ?", filters.market);
  if (filters.query?.trim()) {
    const pattern = `%${filters.query.trim()}%`;
    where.push("(c.title LIKE ? OR c.title_zh LIKE ? OR c.opportunity LIKE ? OR c.improvements LIKE ?)");
    values.push(pattern, pattern, pattern, pattern);
  }

  const sql = `SELECT c.*, r.title AS report_title, r.period_label, r.published_at
    FROM candidates c
    INNER JOIN reports r ON r.id = c.report_id
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY r.published_at DESC, c.route ASC, c.route_rank ASC`;
  const rows = await getDatabase().prepare(sql).bind(...values).all<CandidateArchiveRow>();
  return rows.results.map((row) => ({
    ...mapCandidate(row),
    reportTitle: row.report_title,
    periodLabel: row.period_label,
    publishedAt: row.published_at,
  }));
}

export async function getCandidateFilterOptions() {
  await ensureSchema();
  const db = getDatabase();
  const [categoryRows, marketRows] = await Promise.all([
    db.prepare(`SELECT DISTINCT c.category AS category
      FROM candidates c INNER JOIN reports r ON r.id = c.report_id
      WHERE r.status != 'research' ORDER BY c.category`).all<{ category: string }>(),
    db.prepare(`SELECT DISTINCT c.market AS market
      FROM candidates c INNER JOIN reports r ON r.id = c.report_id
      WHERE r.status != 'research' ORDER BY c.market`).all<{ market: string }>(),
  ]);
  return {
    reports: (await listReports()).filter((report) => report.status !== "research"),
    categories: categoryRows.results.map((row) => row.category),
    markets: marketRows.results.map((row) => row.market),
  };
}

export async function getCandidateById(id: string): Promise<CandidateArchiveEntry | null> {
  await ensureSchema();
  const row = await getDatabase().prepare(`SELECT c.*, r.title AS report_title, r.period_label, r.published_at
    FROM candidates c INNER JOIN reports r ON r.id = c.report_id
    WHERE c.id = ? LIMIT 1`).bind(id).first<CandidateArchiveRow>();
  if (!row) return null;
  return { ...mapCandidate(row), reportTitle: row.report_title, periodLabel: row.period_label, publishedAt: row.published_at };
}

export async function getBuildProject(candidateId: string): Promise<ProjectRecord | null> {
  await ensureSchema();
  const row = await getDatabase().prepare("SELECT * FROM build_projects WHERE candidate_id = ?").bind(candidateId).first<ProjectRow>();
  return row ? mapProject(row) : null;
}

export async function saveBuildProject(candidateId: string, input: Partial<ProjectRecord>): Promise<ProjectRecord> {
  await ensureSchema();
  const current = await getBuildProject(candidateId);
  const now = new Date().toISOString();
  const next: ProjectRecord = {
    candidateId,
    status: validateProjectStatus(input.status ?? current?.status ?? "SELECTED"),
    selectedConcept: input.selectedConcept === undefined ? current?.selectedConcept ?? null : input.selectedConcept,
    conceptOptions: input.conceptOptions === undefined ? current?.conceptOptions ?? [] : input.conceptOptions as ProjectConcept[],
    aiStudioUrl: input.aiStudioUrl === undefined ? current?.aiStudioUrl ?? null : projectUrl(input.aiStudioUrl, "AI Studio 链接"),
    githubUrl: input.githubUrl === undefined ? current?.githubUrl ?? null : projectUrl(input.githubUrl, "GitHub 链接"),
    apkUrl: input.apkUrl === undefined ? current?.apkUrl ?? null : projectUrl(input.apkUrl, "APK 链接"),
    testUrl: input.testUrl === undefined ? current?.testUrl ?? null : projectUrl(input.testUrl, "测试链接"),
    testResult: input.testResult === undefined ? current?.testResult ?? "" : String(input.testResult),
    storeUrl: input.storeUrl === undefined ? current?.storeUrl ?? null : projectUrl(input.storeUrl, "上架链接"),
    notes: input.notes === undefined ? current?.notes ?? "" : String(input.notes),
    assignee: input.assignee === undefined ? current?.assignee ?? "" : String(input.assignee),
    promptVersion: input.promptVersion ?? current?.promptVersion ?? "1.0",
    promptText: input.promptText ?? current?.promptText ?? "",
    promptVersions: input.promptVersions === undefined ? current?.promptVersions ?? [] : input.promptVersions as PromptVersion[],
    updatedAt: now,
  };
  if (next.promptText && (!current || current.promptText !== next.promptText)) {
    const versions = next.promptVersions.filter((item) => item.text !== next.promptText);
    versions.push({ version: next.promptVersion, text: next.promptText, createdAt: now });
    next.promptVersions = versions;
  }
  await getDatabase().prepare(`INSERT INTO build_projects
    (candidate_id, status, selected_concept, concept_options, ai_studio_url, github_url, apk_url, test_url, test_result, store_url, notes, assignee, prompt_version, prompt_text, prompt_versions, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(candidate_id) DO UPDATE SET status=excluded.status, selected_concept=excluded.selected_concept,
    concept_options=excluded.concept_options,
    ai_studio_url=excluded.ai_studio_url, github_url=excluded.github_url, apk_url=excluded.apk_url,
    test_url=excluded.test_url, test_result=excluded.test_result, store_url=excluded.store_url, notes=excluded.notes, assignee=excluded.assignee,
    prompt_version=excluded.prompt_version, prompt_text=excluded.prompt_text, prompt_versions=excluded.prompt_versions, updated_at=excluded.updated_at`).bind(
    next.candidateId, next.status, next.selectedConcept, JSON.stringify(next.conceptOptions), next.aiStudioUrl, next.githubUrl, next.apkUrl,
    next.testUrl, next.testResult, next.storeUrl, next.notes, next.assignee, next.promptVersion, next.promptText, JSON.stringify(next.promptVersions), next.updatedAt,
  ).run();
  return next;
}

export async function saveReport(input: unknown): Promise<string> {
  await ensureSchema();
  const { report, candidates } = validateInput(input);
  const exists = await getDatabase().prepare("SELECT id FROM reports WHERE id = ?").bind(report.id).first();
  if (exists) throw new Error("相同报告ID已经存在，请使用新的版本ID保存修订");
  await insertReport(report, candidates);
  return report.id;
}

function validateInput(value: unknown): { report: Report; candidates: Candidate[] } {
  if (!value || typeof value !== "object") throw new Error("报告必须是JSON对象");
  const root = value as Record<string, unknown>;
  const raw = root.report as Record<string, unknown> | undefined;
  if (!raw) throw new Error("缺少report字段");
  for (const key of ["id", "periodLabel", "publishedAt", "title", "summary", "status", "sourceRunId", "methodologyVersion"]) {
    if (typeof raw[key] !== "string" || !raw[key]) throw new Error(`report.${key}不能为空`);
  }
  const payload = raw.payload as ReportPayload | undefined;
  if (!payload || typeof payload.marketPulse !== "string" || !Array.isArray(payload.sources)) {
    throw new Error("report.payload结构不完整");
  }
  const candidatesRaw = Array.isArray(root.candidates) ? root.candidates : [];
  const candidates = candidatesRaw.map((item, index) => validateCandidate(item, raw.id as string, index));
  const selected = candidates.filter((item) => item.decision === "ROUTE_SELECTED").length;
  const packages = candidates.filter((item) => item.packageStatus === "READY_FOR_BENCH").length;
  const report: Report = {
    id: raw.id as string,
    periodLabel: raw.periodLabel as string,
    publishedAt: raw.publishedAt as string,
    title: raw.title as string,
    summary: raw.summary as string,
    status: raw.status as string,
    sourceRunId: raw.sourceRunId as string,
    methodologyVersion: raw.methodologyVersion as string,
    totalSelected: selected,
    totalPackages: packages,
    payload: {
      marketPulse: payload.marketPulse,
      sources: payload.sources.map(String),
      scheduledCount: Number(payload.scheduledCount ?? 0),
    },
  };
  return { report, candidates };
}

function validateCandidate(value: unknown, reportId: string, index: number): Candidate {
  if (!value || typeof value !== "object") throw new Error(`candidates[${index}]无效`);
  const item = value as Record<string, unknown>;
  const route = item.route as RouteId;
  if (!["A", "B", "C"].includes(route)) throw new Error(`candidates[${index}].route必须是A、B或C`);
  const decision = String(item.decision) as Candidate["decision"];
  if (!["ROUTE_SELECTED", "ROUTE_BACKUP", "ROUTE_WATCH", "REJECTED"].includes(decision)) {
    throw new Error(`candidates[${index}].decision无效`);
  }
  const packageStatus = String(item.packageStatus) as Candidate["packageStatus"];
  if (!["READY_FOR_BENCH", "DRAFT", "BLOCKED"].includes(packageStatus)) {
    throw new Error(`candidates[${index}].packageStatus无效`);
  }
  const improvements = Array.isArray(item.improvements) ? item.improvements.map(String) : [];
  if (improvements.length < 1 || improvements.length > 3) throw new Error(`candidates[${index}]必须包含1–3个改进点`);
  const references = validateReferences(item.references, index);
  const iconSource = String(item.iconSource ?? "generated") as Candidate["iconSource"];
  if (!["product", "competitor", "generated"].includes(iconSource)) {
    throw new Error(`candidates[${index}].iconSource无效`);
  }
  return {
    id: String(item.id ?? `${reportId}-${route}-${index + 1}`),
    reportId,
    route,
    title: requiredText(item.title, `candidates[${index}].title`),
    titleZh: requiredText(item.titleZh, `candidates[${index}].titleZh`),
    productForm: validateProductForm(item.productForm, `candidates[${index}].productForm`),
    category: requiredText(item.category, `candidates[${index}].category`),
    market: requiredText(item.market, `candidates[${index}].market`),
    routeScore: numberInRange(item.routeScore, 0, 100, `candidates[${index}].routeScore`),
    routeRank: positiveInteger(item.routeRank, `candidates[${index}].routeRank`),
    decision,
    dataCompleteness: numberInRange(item.dataCompleteness, 0, 1, `candidates[${index}].dataCompleteness`),
    opportunity: requiredText(item.opportunity, `candidates[${index}].opportunity`),
    improvements,
    packageStatus,
    packageId: optionalText(item.packageId),
    packageUrl: optionalPathOrUrl(item.packageUrl, `candidates[${index}].packageUrl`),
    packageSha256: optionalSha256(item.packageSha256, `candidates[${index}].packageSha256`),
    references,
    iconUrl: optionalUrl(item.iconUrl, `candidates[${index}].iconUrl`),
    iconSource,
    iconSourceUrl: optionalUrl(item.iconSourceUrl, `candidates[${index}].iconSourceUrl`),
  };
}

function validateReferences(value: unknown, index: number): AppReference[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 5) {
    throw new Error(`candidates[${index}].references必须包含1–5个竞品、相似品或替代方案`);
  }
  return value.map((raw, referenceIndex) => {
    if (!raw || typeof raw !== "object") throw new Error(`candidates[${index}].references[${referenceIndex}]无效`);
    const item = raw as Record<string, unknown>;
    const relation = String(item.relation) as AppReference["relation"];
    if (!["competitor", "similar", "substitute"].includes(relation)) {
      throw new Error(`candidates[${index}].references[${referenceIndex}].relation无效`);
    }
    return {
      name: requiredText(item.name, `candidates[${index}].references[${referenceIndex}].name`),
      nameZh: requiredText(item.nameZh, `candidates[${index}].references[${referenceIndex}].nameZh`),
      kind: validateReferenceKind(item.kind, `candidates[${index}].references[${referenceIndex}].kind`),
      url: requiredUrl(item.url, `candidates[${index}].references[${referenceIndex}].url`),
      store: validateStore(item.store, `candidates[${index}].references[${referenceIndex}].store`),
      storeUrl: optionalUrl(item.storeUrl, `candidates[${index}].references[${referenceIndex}].storeUrl`),
      relation,
      apkDownloads: validateApkDownloads(item.apkDownloads, index, referenceIndex),
    };
  });
}

function validateApkDownloads(value: unknown, candidateIndex: number, referenceIndex: number) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > 3) {
    throw new Error(`candidates[${candidateIndex}].references[${referenceIndex}].apkDownloads最多包含3个链接`);
  }
  const providers = ["apkmirror", "uptodown", "f_droid", "amazon_appstore", "aurora_store", "aptoide", "apkpure", "other"] as const;
  return value.map((raw, downloadIndex) => {
    if (!raw || typeof raw !== "object") throw new Error(`candidates[${candidateIndex}].references[${referenceIndex}].apkDownloads[${downloadIndex}]无效`);
    const item = raw as Record<string, unknown>;
    const provider = item.provider as (typeof providers)[number];
    if (!providers.includes(provider)) throw new Error(`candidates[${candidateIndex}].references[${referenceIndex}].apkDownloads[${downloadIndex}].provider无效`);
    const status = String(item.status) as "verified" | "needs_verification";
    if (status !== "verified" && status !== "needs_verification") throw new Error(`candidates[${candidateIndex}].references[${referenceIndex}].apkDownloads[${downloadIndex}].status无效`);
    const url = requiredUrl(item.url, `candidates[${candidateIndex}].references[${referenceIndex}].apkDownloads[${downloadIndex}].url`);
    if (!url.startsWith("https://")) throw new Error(`candidates[${candidateIndex}].references[${referenceIndex}].apkDownloads[${downloadIndex}].url必须使用HTTPS`);
    return { provider, label: requiredText(item.label, `candidates[${candidateIndex}].references[${referenceIndex}].apkDownloads[${downloadIndex}].label`), url, status };
  });
}

function validateProductForm(value: unknown, label: string): Candidate["productForm"] {
  const allowed = ["mobile_app", "mobile_game", "web_app", "desktop_app", "cross_platform"] as const;
  if (allowed.includes(value as (typeof allowed)[number])) return value as Candidate["productForm"];
  throw new Error(`${label}无效`);
}

function validateReferenceKind(value: unknown, label: string): AppReference["kind"] {
  const allowed = [
    "mobile_app", "mobile_game", "web_product", "desktop_app", "open_source_project",
    "system_feature", "developer_platform", "technical_standard", "research_report",
  ] as const;
  if (allowed.includes(value as (typeof allowed)[number])) return value as AppReference["kind"];
  throw new Error(`${label}无效`);
}

function validateStore(value: unknown, label: string): AppReference["store"] {
  if (value === null || value === undefined || value === "") return null;
  if (value === "apple_app_store" || value === "google_play") return value;
  throw new Error(`${label}无效`);
}

function requiredText(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label}不能为空`);
  return value;
}

function requiredUrl(value: unknown, label: string) {
  const text = requiredText(value, label);
  try {
    const url = new URL(text);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    return url.toString();
  } catch {
    throw new Error(`${label}必须是HTTP或HTTPS链接`);
  }
}

function optionalUrl(value: unknown, label: string) {
  if (value === null || value === undefined || value === "") return null;
  return requiredUrl(value, label);
}

function optionalText(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function optionalPathOrUrl(value: unknown, label: string) {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value);
  if (text.startsWith("/")) return text;
  return requiredUrl(text, label);
}

function optionalSha256(value: unknown, label: string) {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value);
  if (!/^[0-9a-f]{64}$/.test(text)) throw new Error(`${label}必须是SHA-256`);
  return text;
}

function projectUrl(value: unknown, label: string): string | null {
  if (value === null || value === undefined || value === "") return null;
  return requiredUrl(value, label);
}

function numberInRange(value: unknown, minimum: number, maximum: number, label: string) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < minimum || number > maximum) {
    throw new Error(`${label}必须在${minimum}到${maximum}之间`);
  }
  return number;
}

function positiveInteger(value: unknown, label: string) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) throw new Error(`${label}必须是正整数`);
  return number;
}

function validateProjectStatus(value: unknown): ProjectStatus {
  const allowed: ProjectStatus[] = ["SELECTED", "RESEARCHING", "CONCEPTS_READY", "CONCEPT_SELECTED", "BUILD_BRIEF_READY", "SENT_TO_AI_STUDIO", "BUILDING", "FIRST_VERSION_READY", "QA_REVIEW", "RELEASE_CANDIDATE", "PUBLISHED", "PAUSED"];
  if (allowed.includes(value as ProjectStatus)) return value as ProjectStatus;
  throw new Error("项目状态无效");
}

function mapReport(row: ReportRow): Report {
  return {
    id: row.id,
    periodLabel: row.period_label,
    publishedAt: row.published_at,
    title: row.title,
    summary: row.summary,
    status: row.status,
    totalSelected: row.total_selected,
    totalPackages: row.total_packages,
    sourceRunId: row.source_run_id,
    methodologyVersion: row.methodology_version,
    payload: JSON.parse(row.payload),
  };
}

function mapCandidate(row: CandidateRow): Candidate {
  return {
    id: row.id,
    reportId: row.report_id,
    route: row.route as RouteId,
    title: row.title,
    titleZh: row.title_zh,
    productForm: row.product_form as Candidate["productForm"],
    category: row.category,
    market: row.market,
    routeScore: row.route_score,
    routeRank: row.route_rank,
    decision: row.decision as Candidate["decision"],
    dataCompleteness: row.data_completeness,
    opportunity: row.opportunity,
    improvements: JSON.parse(row.improvements),
    packageStatus: row.package_status as Candidate["packageStatus"],
    packageId: row.package_id,
    packageUrl: row.package_url,
    packageSha256: row.package_sha256,
    references: parseReferences(row.reference_apps),
    iconUrl: row.icon_url,
    iconSource: (row.icon_source || "generated") as Candidate["iconSource"],
    iconSourceUrl: row.icon_source_url,
  };
}

function parseReferences(value: string): AppReference[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type ReportRow = {
  id: string; period_label: string; published_at: string; title: string; summary: string;
  status: string; total_selected: number; total_packages: number; source_run_id: string;
  methodology_version: string; payload: string;
};

type CandidateRow = {
  id: string; report_id: string; route: string; title: string; title_zh: string; product_form: string; category: string; market: string;
  route_score: number; route_rank: number; decision: string; data_completeness: number;
  opportunity: string; improvements: string; package_status: string; reference_apps: string;
  package_id: string | null; package_url: string | null; package_sha256: string | null;
  icon_url: string | null; icon_source: string; icon_source_url: string | null;
};

type CandidateArchiveRow = CandidateRow & {
  report_title: string;
  period_label: string;
  published_at: string;
};

type ProjectRow = {
  candidate_id: string; status: string; selected_concept: string | null; concept_options: string;
  ai_studio_url: string | null; github_url: string | null; apk_url: string | null;
  test_url: string | null; test_result: string; store_url: string | null; notes: string; assignee: string;
  prompt_version: string; prompt_text: string; prompt_versions: string; updated_at: string;
};

function mapProject(row: ProjectRow): ProjectRecord {
  return {
    candidateId: row.candidate_id,
    status: validateProjectStatus(row.status),
    selectedConcept: row.selected_concept,
    conceptOptions: parseJson<ProjectConcept[]>(row.concept_options, []),
    aiStudioUrl: row.ai_studio_url,
    githubUrl: row.github_url,
    apkUrl: row.apk_url,
    testUrl: row.test_url,
    testResult: row.test_result,
    storeUrl: row.store_url,
    notes: row.notes,
    assignee: row.assignee ?? "",
    promptVersion: row.prompt_version,
    promptText: row.prompt_text,
    promptVersions: parseJson<PromptVersion[]>(row.prompt_versions, []),
    updatedAt: row.updated_at,
  };
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  try { return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}
