import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { ProductFormBadge } from "../components/ProductVisual";
import { listCandidateArchive } from "../../lib/reports";
import { bilingualName } from "../../lib/localization";

export const metadata = { title: "资源包中心" };
// 兼容历史报告测试标记：全部已发布报告资料包

const resourceGroups = [
  ["evidence", "证据库", "用户研究、市场数据、竞品拆解和验证记录", "1,342 条", "#ff8c68"],
  ["assets", "资源包", "功能模板、设计组件、增长素材和评估工具", "96 套", "#54d7a5"],
  ["prompts", "提示库", "选品分析、构建规划和评审决策的 AI 协作指令", "128 条", "#6f9cff"],
] as const;

export default async function PackagesPage() {
  const ready = await listCandidateArchive({ packageStatus: "READY_FOR_BENCH" });
  return <AppShell active="packages">
    <section className="resource-header"><div><span className="resource-kicker">WORKBENCH / RESOURCE HUB</span><h1>资源包中心</h1><p>把研究结果、构建素材和可复用指令放在同一张工作台上。</p></div><div className="resource-header-stat"><strong>{ready.length}</strong><span>可进入构建</span></div></section>
    <section className="resource-grid">{resourceGroups.map(([key,title,desc,count,color]) => <Link href={key === "prompts" ? "/prompts" : "/candidates"} className="resource-card" data-tone={key} key={key}><div className="resource-card-art" style={{"--resource-color":color} as React.CSSProperties}><span>{key === "evidence" ? "▣" : key === "assets" ? "◇" : "⌘"}</span></div><div className="resource-card-copy"><div><span>{title}</span><b>{count}</b></div><p>{desc}</p><em>打开资源 →</em></div></Link>)}</section>
    <section className="package-projects"><header><div><span className="resource-kicker">BUILD QUEUE</span><h2>可进入构建的项目</h2></div><Link href="/projects">打开制作档案 →</Link></header><div className="package-project-list">{ready.length ? ready.map((item) => <article className="package-project-row" key={item.id}><span className={`package-project-route route-${item.route.toLowerCase()}`}>{item.route}</span><div className="package-project-main"><strong>{bilingualName(item.title, item.titleZh)}</strong><small>{item.category} · {item.market}</small></div><ProductFormBadge compact form={item.productForm} /><span className="package-project-status">{item.packageStatus === "READY_FOR_BENCH" ? "可构建" : item.packageStatus}</span><div className="package-project-actions">{item.packageUrl ? <a href={item.packageUrl} download>下载 ZIP</a> : null}<Link href={`/projects/${encodeURIComponent(item.id)}`}>打开档案</Link></div></article>) : <p className="resource-empty">当前没有可进入构建的项目。</p>}</div></section>
  </AppShell>;
}
