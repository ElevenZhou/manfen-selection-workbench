import { notFound, redirect } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { FeishuPushButton } from "../../components/FeishuPushButton";
import { ProductFormBadge, ProductIcon, ReferenceLinks } from "../../components/ProductVisual";
import { RouteMark } from "../../components/RouteMark";
import { getReport } from "../../../lib/reports";
import { bilingualName } from "../../../lib/localization";

export default async function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getReport(id);
  if (!data) notFound();
  if (data.report.status === "research") redirect(`/research/${id}`);
  const { report, candidates } = data;
  const selected = candidates.filter((item) => item.decision === "ROUTE_SELECTED");
  const watch = candidates.filter((item) => item.decision === "ROUTE_WATCH");
  const isResearchReport = selected.length === 0 && watch.length > 0;
  const displayedCandidates = isResearchReport ? watch : selected;

  return (
    <AppShell active="reports">
      <section className="report-hero">
        <div className="report-kicker">
          <span>{report.periodLabel}</span>
          <span>{report.status === "published" ? "已发布" : report.status}</span>
          <span>{report.methodologyVersion}</span>
        </div>
        <h1>{report.title}</h1>
        <p>{report.summary}</p>
        <div className="report-hero-metrics">
          <span><b>{isResearchReport ? watch.length : report.totalSelected}</b>{isResearchReport ? "深度研究" : "最终入选"}</span>
          <span><b>{report.totalPackages}</b>完整资料包</span>
          <span><b>{report.sourceRunId}</b>来源运行</span>
        </div>
        <FeishuPushButton reportId={report.id} />
      </section>

      <section className="market-pulse panel">
        <span className="section-index">MARKET PULSE</span>
        <div>
          <h2>本期判断</h2>
          <p>{report.payload.marketPulse}</p>
        </div>
        <div className="source-stack">
          <span>证据来源</span>
          {report.payload.sources.map((source) => <b key={source}>{source}</b>)}
        </div>
      </section>

      <nav className="report-jump" aria-label="报告栏目">
        <a href="#route-a">A 竞品验证</a>
        <a href="#route-b">B 缺口重构</a>
        <a href="#route-c">C 新需求</a>
        <a href="#packages">资料包与排期</a>
      </nav>

      {(["A", "B", "C"] as const).map((route) => (
        <section className={`route-report route-${route.toLowerCase()}`} id={`route-${route.toLowerCase()}`} key={route}>
          <header>
            <RouteMark route={route} />
            <div>
              <p>{routeSubtitle(route)}</p>
              <h2>{routeTitle(route)}</h2>
            </div>
            <span className="route-total">{displayedCandidates.filter((item) => item.route === route).length} 个</span>
          </header>
          <div className="candidate-table" role="table" aria-label={`${routeTitle(route)}候选`}>
            <div className="candidate-table-head" role="row">
              <span role="columnheader">排名 / 产品</span><span role="columnheader">机会与依据</span><span role="columnheader">少而精的改进</span><span role="columnheader">路线分</span>
            </div>
            {displayedCandidates.filter((item) => item.route === route).map((item) => (
              <article className="candidate-table-row" id={item.id} key={item.id} role="row">
                <div className="candidate-name" role="cell">
                  <span className="candidate-rank">{String(item.routeRank).padStart(2, "0")}</span>
                  <ProductIcon iconUrl={item.iconUrl} route={item.route} title={item.title} />
                  <div>
                    <span className="product-title-link" aria-label="机会概念，尚无商店页面">{bilingualName(item.title, item.titleZh)}</span>
                    <small className="candidate-status-note">机会概念 · 尚未上架 App Store / Google Play</small>
                    <ProductFormBadge form={item.productForm} />
                    <small>{item.category} · {item.market}</small>
                    <ReferenceLinks references={item.references} />
                    {item.packageUrl ? <a className="package-download-link" href={item.packageUrl} download>下载资料包 ZIP</a> : null}
                  </div>
                </div>
                <div role="cell"><p>{item.opportunity}</p><small>证据完整度 {Math.round(item.dataCompleteness * 100)}%</small></div>
                <ul role="cell">{item.improvements.map((value) => <li key={value}>{value}</li>)}</ul>
                <div className="score-cell" role="cell"><strong>{item.routeScore}</strong><small>/ 100</small></div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="handoff-summary" id="packages">
        <div>
          <span className="section-index">HANDOFF</span>
          <h2>{isResearchReport ? "调查完成，先验证再立项。" : "选品结束，开发从资料包开始。"}</h2>
          <p>{isResearchReport
            ? "本期项目均为 WATCH。完成报告列出的数据、权限、使用或技术验证门槛前，不进入开发台。"
            : "本期入选项目已经完成产品、证据、品牌、UI、开发提示词、验收、推广和停止条件的交接定义。"}</p>
        </div>
        <div className="handoff-stats">
          <span><b>{report.totalPackages}</b> READY_FOR_BENCH</span>
          <span><b>{report.payload.scheduledCount}</b> 已排期</span>
          <span><b>{report.totalPackages - report.payload.scheduledCount}</b> 等待开发台</span>
        </div>
      </section>
    </AppShell>
  );
}

function routeTitle(route: "A" | "B" | "C") {
  return { A: "竞品验证与微创新", B: "市场缺口与第一性原理", C: "新需求与趋势机会" }[route];
}

function routeSubtitle(route: "A" | "B" | "C") {
  return {
    A: "从真实竞品、使用和评论出发",
    B: "从任务失败、人工流程和工具拼接出发",
    C: "从技术、行为、搜索与流量变化出发",
  }[route];
}
