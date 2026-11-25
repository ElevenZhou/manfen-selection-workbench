import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { FeishuPushButton } from "../components/FeishuPushButton";
import { getReport, listReports } from "../../lib/reports";

export const metadata = { title: "调查报告" };

export default async function ResearchPage() {
  const reports = (await listReports()).filter((report) => report.status === "research");
  const items = await Promise.all(reports.map(async (report) => {
    const detail = await getReport(report.id);
    return {
      report,
      watchCount: detail?.candidates.filter((candidate) => candidate.decision === "ROUTE_WATCH").length ?? 0,
    };
  }));
  const years = [...new Set(reports.map((report) => new Date(report.publishedAt).getFullYear()))];

  return (
    <AppShell active="research">
      <section className="page-title-row">
        <div>
          <p className="eyebrow">RESEARCH ARCHIVE</p>
          <h1>调查报告</h1>
          <p>纯调查与正式选品分开保存。这里的对象只用于参考和验证，不会自动进入候选总表、资料包或开发排期。</p>
        </div>
      </section>

      <div className="archive-layout">
        <aside className="year-rail">
          <span>年份</span>
          {years.map((year, index) => <b className={index === 0 ? "active" : ""} key={year}>{year}</b>)}
        </aside>
        <section className="report-timeline">
          {items.map(({ report, watchCount }, index) => (
            <article className="timeline-report research-timeline-report" key={report.id}>
              <div className="timeline-point"><span>{String(items.length - index).padStart(2, "0")}</span></div>
              <div className="timeline-date">
                <strong>{report.periodLabel}</strong>
                <small>{formatDate(report.publishedAt)}</small>
              </div>
              <div className="timeline-body">
                <div className="timeline-status">纯调查</div>
                <h2>{report.title}</h2>
                <p>{report.summary}</p>
                <div className="timeline-metrics">
                  <span><b>{watchCount}</b> 调查对象</span>
                  <span><b>0</b> 正式入选</span>
                  <span><b>{report.methodologyVersion}</b> 方法版本</span>
                </div>
              </div>
              <div className="timeline-actions">
                <FeishuPushButton reportId={report.id} compact />
                <Link className="report-open" href={`/research/${report.id}`} aria-label={`查看${report.title}`}>↗</Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric" }).format(new Date(value));
}
