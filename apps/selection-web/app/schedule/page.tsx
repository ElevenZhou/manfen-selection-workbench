import { AppShell } from "../components/AppShell";
import { ProductFormBadge } from "../components/ProductVisual";
import { getDashboard } from "../../lib/reports";
import { bilingualName } from "../../lib/localization";

export const metadata = { title: "开发排期" };

export default async function SchedulePage() {
  const { candidates } = await getDashboard();
  const ready = candidates.filter((item) => item.packageStatus === "READY_FOR_BENCH");
  const scheduled = ready.slice(0, 5);
  const waiting = ready.slice(5);
  return (
    <AppShell active="schedule">
      <section className="page-title-row">
        <div>
          <p className="eyebrow">DEVELOPMENT SCHEDULE</p>
          <h1>排期不改变选品</h1>
          <p>15个入选仍然全部成立。当前5个开发台只决定谁先开工，其余资料包留在等待队列。</p>
        </div>
        <div className="capacity-stamp"><span>WEEKLY CAPACITY</span><strong>05</strong></div>
      </section>
      <section className="bench-grid">
        {scheduled.map((item, index) => (
          <article key={item.id}>
            <div className="bench-number">BENCH {String(index + 1).padStart(2, "0")}</div>
            <span className={`mini-route route-${item.route.toLowerCase()}`}>{item.route}</span>
            <h2>{bilingualName(item.title, item.titleZh)}</h2>
            <ProductFormBadge form={item.productForm} />
            <p>{item.opportunity}</p>
            <div><span>状态</span><b>待开发台领取</b></div>
          </article>
        ))}
      </section>
      <section className="waiting-queue panel">
        <div className="section-heading"><div><span className="section-index">WAITING QUEUE</span><h2>等待开发台</h2></div><b>{waiting.length} 个</b></div>
        {waiting.map((item, index) => (
          <div className="queue-row" key={item.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <i className={`mini-route route-${item.route.toLowerCase()}`}>{item.route}</i>
            <strong>{bilingualName(item.title, item.titleZh)}</strong>
            <ProductFormBadge compact form={item.productForm} />
            <small>{item.category} · 资料包已就绪</small>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
