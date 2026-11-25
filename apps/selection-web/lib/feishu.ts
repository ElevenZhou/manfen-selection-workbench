import { env } from "cloudflare:workers";
import type { Candidate, Report, RouteId } from "./types";
import { bilingualName } from "./localization";
import { productFormLabel, referenceKindLabel } from "./taxonomy";
import { buildAiStudioPrompt } from "./aiStudioPrompt";

type FeishuResult = {
  ok: boolean;
  deduplicated: boolean;
  reportId: string;
  httpStatus: number | null;
  message: string;
};

const routeMeta: Record<RouteId, { icon: string; title: string }> = {
  A: { icon: "🔵", title: "竞品验证与微创新" },
  B: { icon: "🟠", title: "市场缺口与第一性原理" },
  C: { icon: "🟢", title: "新需求与趋势机会" },
};

function getDatabase(): D1Database {
  if (!env.DB) throw new Error("报告数据库尚未连接");
  return env.DB;
}

function getWebhook(): string {
  const value = (env as unknown as { FEISHU_SELECTION_WEBHOOK_URL?: string })
    .FEISHU_SELECTION_WEBHOOK_URL?.trim();
  if (!value) throw new Error("飞书推送尚未配置");
  return value;
}

async function ensurePushSchema() {
  const db = getDatabase();
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS feishu_pushes (
      idempotency_key TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      requested_by TEXT NOT NULL,
      status TEXT NOT NULL,
      http_status INTEGER,
      provider_response TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT,
      FOREIGN KEY (report_id) REFERENCES reports(id)
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS feishu_pushes_report_idx ON feishu_pushes(report_id, created_at)"),
  ]);
}

function absoluteUrl(origin: string, value: string): string {
  return new URL(value, origin.endsWith("/") ? origin : `${origin}/`).toString();
}

function safeLabel(value: string): string {
  return value.replaceAll("[", "［").replaceAll("]", "］");
}

function markdownLink(label: string, url: string): string {
  return `[${safeLabel(label)}](${url})`;
}

export function buildFeishuCard(report: Report, candidates: Candidate[], origin: string) {
  const selected = candidates
    .filter((candidate) => candidate.decision === "ROUTE_SELECTED")
    .sort((left, right) => left.route.localeCompare(right.route) || left.routeRank - right.routeRank);
  const watch = candidates
    .filter((candidate) => candidate.decision === "ROUTE_WATCH")
    .sort((left, right) => left.route.localeCompare(right.route) || left.routeRank - right.routeRank);
  const isResearchReport = selected.length === 0 && watch.length > 0;
  const publishedCandidates = isResearchReport ? watch : selected;
  if (!publishedCandidates.length) throw new Error("该报告没有可推送的入选或深研项目");

  const elements: Array<Record<string, unknown>> = [
    {
      tag: "div",
      text: {
        tag: "lark_md",
        content:
          `**🗓️ ${report.periodLabel}**\n` +
          (isResearchReport
            ? `🔎 **${watch.length}** 个深度研究　·　⏸️ **0** 个正式入选\n`
            : `✅ **${selected.length}** 个最终入选　·　📦 **${selected.filter((item) => item.packageStatus === "READY_FOR_BENCH").length}** 个生产资料包\n`) +
          report.summary,
      },
    },
    { tag: "hr" },
  ];

  const groups = isResearchReport
    ? [{ title: `🔎 纯调查 · 参考对象（${publishedCandidates.length}）`, candidates: [...publishedCandidates].sort((left, right) => right.routeScore - left.routeScore) }]
    : (["A", "B", "C"] as const).map((route) => ({
      title: `${routeMeta[route].icon} ${route} · ${routeMeta[route].title}（${publishedCandidates.filter((candidate) => candidate.route === route).length}）`,
      candidates: publishedCandidates.filter((candidate) => candidate.route === route),
    }));

  for (const group of groups) {
    if (!group.candidates.length) continue;
    const lines = [`**${group.title}**`];
    for (const [index, candidate] of group.candidates.entries()) {
      const references = candidate.references
        .map((reference) => {
          const targetUrl = reference.storeUrl ?? reference.url;
          const apk = (reference.apkDownloads ?? [])
            .slice(0, 2)
            .filter((download) => /^https:\/\//.test(download.url))
            .map((download) => markdownLink(`APK · ${download.label}`, download.url))
            .join("、");
          return { reference, targetUrl, apk };
        })
        .filter(({ targetUrl }) => /^https?:\/\//.test(targetUrl))
        .map(({ reference, targetUrl, apk }) => `${markdownLink(
          `${bilingualName(reference.name, reference.nameZh)} · ${referenceKindLabel(reference.kind)}`,
          targetUrl,
        )}${apk ? `（${apk}）` : ""}`)
        .join(" · ");
      const candidateName = bilingualName(candidate.title, candidate.titleZh);
      if (!references) throw new Error(`${candidateName} 缺少可点击的参考品`);
      const packageLink = candidate.packageUrl
        ? markdownLink("📦 生产资料包", absoluteUrl(origin, candidate.packageUrl))
        : "资料包未就绪";
      const dossierLink = markdownLink("🛠 制作档案", absoluteUrl(origin, `/projects/${encodeURIComponent(candidate.id)}`));
      const promptPreview = !isResearchReport
        ? buildAiStudioPrompt(candidate).replace(/\s+/g, " ").slice(0, 360) + "…"
        : "";
      if (candidate.packageStatus === "READY_FOR_BENCH" && !candidate.packageUrl) {
        throw new Error(`${candidateName} 的生产资料包地址缺失`);
      }
      lines.push(
        `\n**${isResearchReport ? index + 1 : candidate.routeRank}. ${candidateName}**　\`${productFormLabel(candidate.productForm)}\`　\`${candidate.routeScore}分\`\n` +
        `参考：${references}\n${isResearchReport ? "状态：WATCH，完成报告列出的验证门槛前不进入开发台" : `${packageLink}　${dossierLink}\n**默认开工提示词**：${promptPreview}`}`,
      );
    }
    elements.push({ tag: "div", text: { tag: "lark_md", content: lines.join("\n") } });
    elements.push({ tag: "hr" });
  }

  elements.push(
    {
      tag: "note",
      elements: [{
        tag: "plain_text",
        content: isResearchReport
          ? "本卡为调查结果，不代表正式立项；完成报告列出的数据、权限、使用或技术验证后再决定是否入选。"
          : "三条路线独立评选；开发台以生产资料包为唯一交接入口。",
      }],
    },
    {
      tag: "action",
      actions: [{
        tag: "button",
        text: { tag: "plain_text", content: "查看完整选品报告" },
        type: "primary",
        url: absoluteUrl(origin, isResearchReport ? `/research/${report.id}` : `/reports/${report.id}`),
      }],
    },
  );

  return {
    msg_type: "interactive",
    card: {
      config: { wide_screen_mode: true, enable_forward: true },
      header: {
        template: "blue",
        title: { tag: "plain_text", content: `📊 ${report.title}` },
      },
      elements,
    },
  };
}

export async function pushReportToFeishu(args: {
  report: Report;
  candidates: Candidate[];
  origin: string;
  requestedBy: string;
  idempotencyKey: string;
}): Promise<FeishuResult> {
  await ensurePushSchema();
  const db = getDatabase();
  const previous = await db.prepare(
    "SELECT status, http_status FROM feishu_pushes WHERE idempotency_key = ?",
  ).bind(args.idempotencyKey).first<{ status: string; http_status: number | null }>();
  if (previous) {
    return {
      ok: previous.status === "completed",
      deduplicated: true,
      reportId: args.report.id,
      httpStatus: previous.http_status,
      message: previous.status === "completed" ? "该次推送已经完成，没有重复发送" : "该次推送已经处理，没有自动重试",
    };
  }

  await db.prepare(`INSERT INTO feishu_pushes (
    idempotency_key, report_id, requested_by, status
  ) VALUES (?, ?, ?, 'pending')`).bind(
    args.idempotencyKey,
    args.report.id,
    args.requestedBy,
  ).run();

  const card = buildFeishuCard(args.report, args.candidates, args.origin);
  let response: Response;
  let responseBody: Record<string, unknown>;
  try {
    response = await fetch(getWebhook(), {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(card),
    });
    const raw = await response.text();
    try {
      responseBody = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      responseBody = { message: raw.slice(0, 500) };
    }
  } catch (error) {
    await db.prepare(`UPDATE feishu_pushes
      SET status = 'failed', provider_response = ?, completed_at = CURRENT_TIMESTAMP
      WHERE idempotency_key = ?`).bind(
      JSON.stringify({ message: error instanceof Error ? error.message : "network error" }),
      args.idempotencyKey,
    ).run();
    throw new Error("飞书网络请求失败，本次没有自动重试");
  }

  const providerCode = responseBody.code ?? responseBody.StatusCode;
  const ok = response.status === 200 && providerCode === 0;
  await db.prepare(`UPDATE feishu_pushes
    SET status = ?, http_status = ?, provider_response = ?, completed_at = CURRENT_TIMESTAMP
    WHERE idempotency_key = ?`).bind(
    ok ? "completed" : "failed",
    response.status,
    JSON.stringify(responseBody).slice(0, 2000),
    args.idempotencyKey,
  ).run();
  return {
    ok,
    deduplicated: false,
    reportId: args.report.id,
    httpStatus: response.status,
    message: ok ? "选品概述已推送到飞书" : "飞书拒绝了本次推送，没有自动重试",
  };
}
