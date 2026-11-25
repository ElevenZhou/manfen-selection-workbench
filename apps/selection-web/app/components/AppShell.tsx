import Link from "next/link";

type Active = "overview" | "reports" | "research" | "candidates" | "packages" | "ingest" | "selector" | "projects" | "prompts";

// APP PORTFOLIO · 调查报告归档保留在 /research，不占用主导航
const nav = [
  { id: "overview", label: "总览", href: "/" },
  { id: "reports", label: "选品报告", href: "/reports" },
  { id: "candidates", label: "选品总表", href: "/candidates" },
  { id: "packages", label: "资料包", href: "/packages" },
  { id: "projects", label: "制作档案", href: "/projects" },
  { id: "prompts", label: "提示词库", href: "/prompts" },
  { id: "ingest", label: "AI整理提交", href: "/ingest" },
  { id: "selector", label: "启动选品", href: "/selector" },
] as const;

export function AppShell({ active, children }: { active: Active; children: React.ReactNode }) {
  return (
    <div className={`app-frame ${active === "overview" ? "command-frame" : ""}`}>
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>
            <strong>APP 选品</strong>
            <small>PORTFOLIO INTELLIGENCE</small>
          </span>
        </Link>
        <nav aria-label="主导航">
          {nav.map((item) => (
            <Link
              aria-current={active === item.id ? "page" : undefined}
              className={active === item.id ? "active" : ""}
              href={item.href}
              key={item.id}
            >
              <span>{item.label}</span>
              <i aria-hidden="true" />
            </Link>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span className="status-line"><i aria-hidden="true" /> SYSTEM READY</span>
          <p>证据驱动选品<br />从清单到制作</p>
        </div>
      </aside>
      <main className={`content ${active === "overview" ? "command-center" : ""}`} id="main-content">
        <header className="topbar workbench-topbar"><div className="topbar-context"><span className="topbar-kicker">APP 选品与构建 · 运营中枢</span><span className="stage-flow"><b className="stage-active">选品</b><i>→</i><b>构建</b><i>→</i><b>验证</b><i>→</i><b>上线</b></span></div><div className="topbar-actions"><span className="team-pill">◉ 产品实验舱</span><span className="ready-pill">进行中</span><time>{new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric" }).format(new Date())}</time></div></header>
        {children}
      </main>
    </div>
  );
}
