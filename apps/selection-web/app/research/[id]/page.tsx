import { notFound } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { FeishuPushButton } from "../../components/FeishuPushButton";
import { ProductFormBadge, ProductIcon, ReferenceLinks } from "../../components/ProductVisual";
import { getReport } from "../../../lib/reports";
import { bilingualName } from "../../../lib/localization";

export default async function ResearchDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getReport(id);
  if (!data || data.report.status !== "research") notFound();
  const { report } = data;
  const candidates = data.candidates
    .filter((item) => item.decision === "ROUTE_WATCH")
    .sort((left, right) => right.routeScore - left.routeScore);

  return (
    <AppShell active="research">
      <section className="report-hero research-hero">
        <div className="report-kicker">
          <span>{report.periodLabel}</span>
          <span>纯调查</span>
          <span>{report.methodologyVersion}</span>
        </div>
        <h1>{report.title}</h1>
        <p>{report.summary}</p>
        <div className="report-hero-metrics">
          <span><b>{candidates.length}</b>调查对象</span>
          <span><b>0</b>正式入选</span>
          <span><b>{report.sourceRunId}</b>来源运行</span>
        </div>
        <FeishuPushButton reportId={report.id} />
      </section>

      <section className="market-pulse panel">
        <span className="section-index">RESEARCH NOTE</span>
        <div>
          <h2>调查结论</h2>
          <p>{report.payload.marketPulse}</p>
        </div>
        <div className="source-stack">
          <span>证据来源</span>
          {report.payload.sources.map((source) => <b key={source}>{source}</b>)}
        </div>
      </section>

      <section className="route-report research-report">
        <header>
          <span className="research-mark" aria-hidden="true">R</span>
          <div>
            <p>按当前适配度排序，不构成路线入选</p>
            <h2>调查对象</h2>
          </div>
          <span className="route-total">{candidates.length} 个</span>
        </header>
        <div className="candidate-table" role="table" aria-label="调查对象">
          <div className="candidate-table-head" role="row">
            <span role="columnheader">序号 / 对象</span><span role="columnheader">适用价值与依据</span><span role="columnheader">可复用与验证</span><span role="columnheader">适配分</span>
          </div>
          {candidates.map((item, index) => (
            <article className="candidate-table-row" id={item.id} key={item.id} role="row">
              <div className="candidate-name" role="cell">
                <span className="candidate-rank">{String(index + 1).padStart(2, "0")}</span>
                <ProductIcon iconUrl={item.iconUrl} route={item.route} title={item.title} />
                <div>
                  <a className="product-title-link" href={item.references.find((reference) => reference.storeUrl)?.storeUrl ?? item.references[0]?.url} target="_blank" rel="noreferrer">{bilingualName(item.title, item.titleZh)}</a>
                  <ProductFormBadge form={item.productForm} />
                  <small>{item.category} · {item.market} · WATCH</small>
                  <ReferenceLinks references={item.references} />
                </div>
              </div>
              <div role="cell"><p>{item.opportunity}</p><small>证据完整度 {Math.round(item.dataCompleteness * 100)}%</small></div>
              <ul role="cell">{item.improvements.map((value) => <li key={value}>{value}</li>)}</ul>
              <div className="score-cell" role="cell"><strong>{item.routeScore}</strong><small>/ 100</small></div>
            </article>
          ))}
        </div>
      </section>

      <section className="handoff-summary research-boundary">
        <div>
          <span className="section-index">RESEARCH BOUNDARY</span>
          <h2>调查完成，不等于强制入选。</h2>
          <p>调查结论不会自动进入选品总表、资料包或开发排期。需要立项时，必须创建新的路线候选并重新通过证据、验证与交接门槛。</p>
        </div>
        <div className="handoff-stats">
          <span><b>{candidates.length}</b> 调查对象</span>
          <span><b>0</b> 正式入选</span>
          <span><b>0</b> 开发排期</span>
        </div>
      </section>
    </AppShell>
  );
}
