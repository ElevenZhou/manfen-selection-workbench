import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { FeishuPushButton } from "../components/FeishuPushButton";
import { listReports } from "../../lib/reports";

export const metadata = { title: "选品报告" };

export default async function ReportsPage() {
  const reports = (await listReports()).filter((report) => report.status !== "research");
  const years = [...new Set(reports.map((report) => new Date(report.publishedAt).getFullYear()))];

  return (
    <AppShell active="reports">
      <section className="page-title-row">
        <div>
          <p className="eyebrow">REPORT ARCHIVE</p>
          <h1>选品报告</h1>
          <p>只保存进入路线评选的报告；纯调查内容在「调查报告」中独立归档。</p>
        </div>
        <Link className="primary-action" href="/ingest">导入新报告</Link>
      </section>

      <div className="archive-layout">
        <aside className="year-rail">
          <span>年份</span>
          {years.map((year, index) => <b className={index === 0 ? "active" : ""} key={year}>{year}</b>)}
        </aside>
        <section className="report-timeline">
          {reports.map((report, index) => (
            <article className="timeline-report" key={report.id}>
              <div className="timeline-point"><span>{String(reports.length - index).padStart(2, "0")}</span></div>
              <div className="timeline-date">
                <strong>{report.periodLabel}</strong>
                <small>{formatDate(report.publishedAt)}</small>
              </div>
              <div className="timeline-body">
                <div className="timeline-status">{report.status === "published" ? "已发布" : report.status}</div>
                <h2>{report.title}</h2>
                <p>{report.summary}</p>
                <div className="timeline-metrics">
                  <span><b>{report.totalSelected}</b> 入选</span>
                  <span><b>{report.totalPackages}</b> 资料包</span>
                  <span><b>{report.methodologyVersion}</b> 方法版本</span>
                </div>
              </div>
              <div className="timeline-actions">
                <FeishuPushButton reportId={report.id} compact />
                <Link className="report-open" href={`/reports/${report.id}`} aria-label={`查看${report.title}`}>↗</Link>
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
