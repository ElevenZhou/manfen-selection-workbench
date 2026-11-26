import { AppShell } from "../components/AppShell";

/* The design gallery uses local static assets with intentional native img sizing. */
/* eslint-disable @next/next/no-img-element */

export const metadata = { title: "设计方向 · APP 选品驾驶舱" };

const directions = [
  { key: "G", title: "作战手册 · Atelier", tone: "yellow", image: "/design/option-g-playbook-atelier.png", summary: "Swiss 网格、任务卡和轻量贴纸反馈，强调下一步动作。" },
  { key: "H", title: "花园街机 · Garden", tone: "green", image: "/design/option-h-garden-arcade.png", summary: "游戏棋盘、能量和成长反馈，强调容量与认领的节奏感。" },
  { key: "I", title: "纸上巡游 · Parade", tone: "blue", image: "/design/option-i-paper-parade.png", summary: "Bauhaus 几何色块、证据索引和运营海报，强调信息层级。" },
];

const dashboards = [
  { title: "Anime Radar", image: "/design/dashboard-anime.png", label: "高密度研究驾驶舱" },
  { title: "Arcade Board", image: "/design/dashboard-arcade.png", label: "游戏化任务工作台" },
  { title: "Finance Console", image: "/design/dashboard-finance.png", label: "证据与决策控制台" },
];

export default function DesignPage() {
  return (
    <AppShell active="design">
      <section className="design-library-hero">
        <p className="eyebrow">DESIGN DIRECTION LIBRARY</p>
        <h1>这里才是设计稿入口。</h1>
        <p>当前工作台使用明亮、带工作卡片和证据层级的方向。下面保留三套设计方向和三张驾驶舱探索稿，方便直接对比。</p>
      </section>
      <section className="design-direction-grid" aria-label="设计方向">
        {directions.map((direction) => (
          <article className={`design-direction-card tone-${direction.tone}`} key={direction.key}>
            <div className="design-direction-copy"><span>{direction.key} / DIRECTION</span><h2>{direction.title}</h2><p>{direction.summary}</p></div>
            <img src={direction.image} alt={`${direction.title} 设计方向`} loading="lazy" />
          </article>
        ))}
      </section>
      <section className="design-dashboard-section">
        <div className="design-section-heading"><div><p className="eyebrow">DASHBOARD STUDIES</p><h2>驾驶舱探索稿</h2></div><span>同一产品契约 · 三种视觉表达</span></div>
        <div className="design-dashboard-grid">
          {dashboards.map((dashboard) => <figure key={dashboard.title}><img src={dashboard.image} alt={dashboard.title} loading="lazy" /><figcaption><strong>{dashboard.title}</strong><span>{dashboard.label}</span></figcaption></figure>)}
        </div>
      </section>
    </AppShell>
  );
}
