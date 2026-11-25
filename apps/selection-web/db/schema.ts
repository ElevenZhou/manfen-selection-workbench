import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  periodLabel: text("period_label").notNull(),
  publishedAt: text("published_at").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  status: text("status").notNull(),
  totalSelected: integer("total_selected").notNull(),
  totalPackages: integer("total_packages").notNull(),
  sourceRunId: text("source_run_id").notNull(),
  methodologyVersion: text("methodology_version").notNull(),
  payload: text("payload").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("reports_published_at_idx").on(table.publishedAt)]);

export const candidates = sqliteTable("candidates", {
  id: text("id").primaryKey(),
  reportId: text("report_id").notNull().references(() => reports.id),
  route: text("route").notNull(),
  title: text("title").notNull(),
  titleZh: text("title_zh").notNull().default(""),
  productForm: text("product_form").notNull().default("mobile_app"),
  category: text("category").notNull(),
  market: text("market").notNull(),
  routeScore: real("route_score").notNull(),
  routeRank: integer("route_rank").notNull(),
  decision: text("decision").notNull(),
  dataCompleteness: real("data_completeness").notNull(),
  opportunity: text("opportunity").notNull(),
  improvements: text("improvements").notNull(),
  packageStatus: text("package_status").notNull(),
  packageId: text("package_id"),
  packageUrl: text("package_url"),
  packageSha256: text("package_sha256"),
  references: text("reference_apps").notNull().default("[]"),
  iconUrl: text("icon_url"),
  iconSource: text("icon_source").notNull().default("generated"),
  iconSourceUrl: text("icon_source_url"),
}, (table) => [index("candidates_report_route_idx").on(table.reportId, table.route, table.routeRank)]);

export const feishuPushes = sqliteTable("feishu_pushes", {
  idempotencyKey: text("idempotency_key").primaryKey(),
  reportId: text("report_id").notNull().references(() => reports.id),
  requestedBy: text("requested_by").notNull(),
  status: text("status").notNull(),
  httpStatus: integer("http_status"),
  providerResponse: text("provider_response"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  completedAt: text("completed_at"),
}, (table) => [index("feishu_pushes_report_idx").on(table.reportId, table.createdAt)]);
