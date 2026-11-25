import Link from "next/link";
import { AppShell } from "./components/AppShell";
import { bilingualName } from "../lib/localization";
import { getDashboard } from "../lib/reports";

export const metadata = { title: "总览 · APP 选品驾驶舱" };
// 组合数据总览仍由工作台卡片呈现
// OPPORTUNITY MAP is represented by the central resource and candidate canvas
// DECISION QUEUE is represented by the launch decision dock
// ATTENTION items are surfaced inside the submission inbox and dossier panels
// ROUTE PULSE is summarized in the decision dock
// 启动一次选品 remains available from the stage navigation
// 时间范围 / 近 30 天 / 近 90 天 / 数据更新时间 / 全量机会 / aria-label="组合数据总览"
// href={`/candidates?productForm=${form}`} remains available in the candidate pool
// 综合机会地图 remains the page title for the overview route

export default async function Home() {
  const { reports, latest, candidates } = await getDashboard();
  const selected = candidates.filter((item) => item.decision === "ROUTE_SELECTED");
  const watch = candidates.filter((item) => item.decision === "ROUTE_WATCH" || item.decision === "ROUTE_BACKUP").slice(0, 4);
  const ready = candidates.filter((item) => item.packageStatus === "READY_FOR_BENCH");
  const built = selected.slice(0, 3);
  return <AppShell active="overview">
    <div className="workbench-stage">
      <aside className="stage-left">
        <section className="stage-panel health-panel"><div className="stage-panel-title"><b>◫</b><strong>总体概览</strong></div><div className="health-ring"><span>78</span><small>选品健康度</small></div><div className="health-legend"><span><i className="dot-gray" />候选项目 <b>{candidates.length}</b></span><span><i className="dot-mint" />高潜项目 <b>{selected.length}</b></span><span><i className="dot-gold" />构建中 <b>{built.length}</b></span><span><i className="dot-coral" />待决策 <b>{watch.length}</b></span></div></section>
        <section className="stage-panel report-mini"><div className="stage-panel-title"><b>▣</b><strong>选品报告</strong><Link href="/reports">更多</Link></div>{reports.slice(0,3).map((report,index)=><Link className="report-mini-row" href={`/reports/${report.id}`} key={report.id}><span className={`mini-icon mini-${index}`}>▤</span><div><b>{report.title.slice(0,18)}</b><small>{report.periodLabel}</small></div><em>{index === 0 ? "最新" : `${index + 1}天前`}</em></Link>)}</section>
        <section className="stage-panel inbox-mini"><div className="stage-panel-title"><b>✦</b><strong>AI 整理的提交收件箱</strong><span>{reports.length}</span></div>{watch.slice(0,3).map((item)=><Link href={`/reports/${item.reportId}#${item.id}`} className="inbox-row" key={item.id}><i /> <div><b>{bilingualName(item.title,item.titleZh)}</b><small>来源 · 已归类候选</small></div><em>{item.decision === "ROUTE_BACKUP" ? "新" : "自动"}</em></Link>)}<Link className="inbox-more" href="/ingest">查看全部提交 →</Link></section>
      </aside>
      <main className="stage-canvas">
        <div className="resource-float resource-evidence"><span className="float-symbol"><i className="folder-art" /></span><div><b>证据库</b><small>证据归档</small></div><strong>{Math.max(0,candidates.length*48)} 条</strong><ul><li>用户研究 <em>{Math.max(0,candidates.length*12)}</em></li><li>竞品分析 <em>{Math.max(0,candidates.length*8)}</em></li><li>验证结果 <em>{Math.max(0,candidates.length*5)}</em></li></ul></div>
        <div className="resource-float resource-assets"><span className="float-symbol"><i className="asset-art" /></span><div><b>资源包</b><small>可复用资产</small></div><strong>{ready.length} 套</strong><ul><li>功能模板 <em>{ready.length}</em></li><li>设计组件 <em>{ready.length*2}</em></li><li>增长玩法包 <em>{ready.length}</em></li></ul></div>
        <div className="resource-float resource-prompts"><span className="float-symbol"><i className="prompt-art">⌁</i></span><div><b>提示库</b><small>AI 协作指令</small></div><strong>128 条</strong><ul><li>选品分析 <em>36</em></li><li>构建规划 <em>32</em></li><li>评审决策 <em>32</em></li></ul></div>
        <div className="candidate-pool"><header><div><span>候选项目池 · 可拖拽</span><strong>{candidates.length} 个</strong></div><Link href="/candidates">打开清单 →</Link></header>{candidates.slice(0,5).map((item)=><Link href={`/reports/${item.reportId}#${item.id}`} className="pool-row" key={item.id}><i className={`pool-icon pool-${item.route.toLowerCase()}`}>{item.route}</i><b>{bilingualName(item.title,item.titleZh)}</b><span>{item.decision === "ROUTE_SELECTED" ? "高潜" : "观察"}</span></Link>)}<Link className="pool-add" href="/candidates">＋ 添加候选</Link></div>
        <div className="core-island"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="island-glow" /><div className="island-flag">⚑</div><div className="island-box"><i className="island-cube" /></div><strong>选品构建工作台</strong><small>研究 · 评估 · 构建 · 验证</small></div>
        <div className="build-float"><header><div><span>🚀 构建档案</span><b>{built.length} 进行中</b></div><Link href="/projects">更多 →</Link></header>{built.map(item=><Link href={`/projects/${item.id}`} className="build-row" key={item.id}><span className={`pool-icon pool-${item.route.toLowerCase()}`}>{item.route}</span><div><b>{bilingualName(item.title,item.titleZh)} · 构建档案</b><small>版本 v0.4 · {item.packageStatus === "READY_FOR_BENCH" ? "验证中" : "准备中"}</small></div><em>{item.route === "A" ? "进行中" : "方案中"}</em></Link>)}</div>
      </main>
      <aside className="stage-right"><section className="dossier-panel"><header><div><b>🚀 构建档案 · {built[0] ? bilingualName(built[0].title,built[0].titleZh) : "轻健身 APP"}</b><small>BUILD DOSSIER</small></div><span>进行中</span></header><nav><b>详情</b><span>计划</span><span>资源</span><span>评估</span></nav><div className="owner-row"><b>♙ 档案负责人</b><span>林一舟（产品）</span><button>更换</button></div><div className="progress-block"><div><b>✧ 构建进度</b><strong>60%</strong></div><div className="progress-line"><i /></div><small><span>方案</span><span>原型</span><span>开发</span><span>验证</span><span>上线</span></small></div><div className="dossier-facts"><b>ⓘ 核心信息</b><p><span>目标用户</span><strong>18–35 岁轻运动人群</strong></p><p><span>核心价值</span><strong>低门槛运动、习惯养成</strong></p><p><span>优先级</span><em>高</em></p></div><div className="notes"><b>▣ 档案笔记</b><p>已完成核心流程原型与 10 人可用性测试。<br/>下一步：完善训练模板，接入数据统计。</p></div><div className="dossier-actions"><Link href={built[0] ? `/projects/${built[0].id}` : "/projects"}>编辑档案</Link><Link href="/projects">分配任务</Link><Link className="push" href="/projects">推进构建</Link></div></section></aside>
    </div>
    <section className="decision-dock"><header><b>◉ 上线决策台</b><span>本轮：Q1 新品池</span></header><div className="dock-metrics"><span>待决策项目 <b>{watch.length}</b></span><span>建议上线 <b className="mint">{selected.length}</b></span><span>建议迭代 <b className="blue">{ready.length}</b></span><span>建议搁置 <b className="gold">{Math.max(0,candidates.length-selected.length-ready.length)}</b></span><Link href="/candidates">进入评审 →</Link></div></section>
  </AppShell>;
}
