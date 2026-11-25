import { AppShell } from "./components/AppShell";

export default function Loading() {
  return <AppShell active="overview">
    <section className="loading-screen" aria-live="polite" aria-busy="true">
      <div className="loading-kicker">APP PORTFOLIO / 正在读取</div>
      <div className="loading-title"><i /><i /><i /></div>
      <div className="loading-ribbon"><i /><i /><i /><i /></div>
      <div className="loading-grid"><i /><i /><i /></div>
      <p>正在读取报告、候选与任务状态…</p>
    </section>
  </AppShell>;
}
