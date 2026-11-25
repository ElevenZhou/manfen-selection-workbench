import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { ProductFormBadge, ProductIcon, ReferenceLinks } from "../components/ProductVisual";
import { RouteMark } from "../components/RouteMark";
import { bilingualName } from "../../lib/localization";
import { getCandidateFilterOptions, listCandidateArchive } from "../../lib/reports";
import type { CandidateArchiveFilters } from "../../lib/types";

export const metadata = { title: "选品总表" };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function CandidatesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = await searchParams;
  const filters = toFilters(raw);
  const options = await getCandidateFilterOptions();
  const candidates = await listCandidateArchive(filters);
  const routeCounts = {
    A: candidates.filter((item) => item.route === "A").length,
    B: candidates.filter((item) => item.route === "B").length,
    C: candidates.filter((item) => item.route === "C").length,
  };

  return (
    <AppShell active="candidates">
      <section className="page-title-row selection-library-title">
        <div>
          <p className="eyebrow">SELECTION LEDGER</p>
          <h1>选品总表</h1>
          <p>跨报告集中查看所有候选。筛选只缩小查看范围，不改变三条路线各自的评分和排名。</p>
        </div>
        <div className="selection-count"><strong>{candidates.length}</strong><span>当前结果</span></div>
      </section>

      <div className="selection-library-layout">
        <aside className="filter-rail">
          <div className="filter-toolbar-head">
            <div className="filter-rail-heading">
              <span>FILTER DESK</span>
              <strong>筛选条件</strong>
            </div>
            <div className="route-filter-summary" aria-label="当前筛选结果的路线数量">
              <span><i className="route-a" aria-hidden="true" />A <b>{routeCounts.A}</b></span>
              <span><i className="route-b" aria-hidden="true" />B <b>{routeCounts.B}</b></span>
              <span><i className="route-c" aria-hidden="true" />C <b>{routeCounts.C}</b></span>
            </div>
          </div>
          <form method="get">
            <FilterSelect label="报告期" name="reportId" value={filters.reportId}>
              <option value="">全部报告</option>
              {options.reports.map((report) => (
                <option value={report.id} key={report.id}>{report.periodLabel}</option>
              ))}
            </FilterSelect>
            <FilterSelect label="发现路线" name="route" value={filters.route}>
              <option value="">全部路线</option>
              <option value="A">A · 竞品验证</option>
              <option value="B">B · 缺口重构</option>
              <option value="C">C · 新需求</option>
            </FilterSelect>
            <FilterSelect label="产品形态" name="productForm" value={filters.productForm}>
              <option value="">全部形态</option>
              <option value="mobile_app">移动 App</option>
              <option value="mobile_game">手机游戏</option>
              <option value="web_app">Web 应用</option>
              <option value="desktop_app">桌面 App</option>
              <option value="cross_platform">跨端应用</option>
            </FilterSelect>
            <FilterSelect label="选品决策" name="decision" value={filters.decision}>
              <option value="">全部决策</option>
              <option value="ROUTE_SELECTED">路线入选</option>
              <option value="ROUTE_BACKUP">路线备选</option>
              <option value="ROUTE_WATCH">持续观察</option>
              <option value="REJECTED">已淘汰</option>
            </FilterSelect>
            <FilterSelect label="资料包" name="packageStatus" value={filters.packageStatus}>
              <option value="">全部状态</option>
              <option value="READY_FOR_BENCH">可进入工作台</option>
              <option value="DRAFT">待完善</option>
              <option value="BLOCKED">被阻塞</option>
            </FilterSelect>
            <FilterSelect label="品类" name="category" value={filters.category}>
              <option value="">全部品类</option>
              {options.categories.map((value) => <option value={value} key={value}>{value}</option>)}
            </FilterSelect>
            <FilterSelect label="市场" name="market" value={filters.market}>
              <option value="">全部市场</option>
              {options.markets.map((value) => <option value={value} key={value}>{value}</option>)}
            </FilterSelect>
            <label className="filter-field">
              <span>关键词</span>
              <input
                autoComplete="off"
                name="q"
                type="search"
                defaultValue={filters.query}
                placeholder="例如：票据识别…"
              />
            </label>
            <div className="filter-actions">
              <button type="submit">应用筛选</button>
              <Link href="/candidates">清除</Link>
            </div>
          </form>
        </aside>

        <section className="selection-ledger" aria-live="polite">
          <header>
            <div>
              <span>跨期候选账本</span>
              <strong>{hasFilters(filters) ? "筛选结果" : "全部候选"}</strong>
            </div>
            <p>共 {candidates.length} 条 · 按报告时间、路线、路线内排名排序</p>
          </header>
          {candidates.length ? (
            <div className="selection-table-wrap">
              <div className="selection-table">
                <div className="selection-table-head">
                  <span>编号</span><span>报告 / 路线</span><span>产品 / 市场</span><span>机会与改进</span>
                  <span>决策 / 资料包</span><span>路线分</span><span />
                </div>
                {candidates.map((item, index) => (
                  <article className={`selection-table-row route-${item.route.toLowerCase()}`} key={`${item.reportId}-${item.id}`}>
                    <div className="selection-number" aria-label={`编号 ${index + 1}`}>
                      {String(index + 1).padStart(3, "0")}
                    </div>
                    <div className="selection-source">
                      <div className="selection-source-top">
                        <RouteMark route={item.route} />
                        <div>
                          <strong>{formatDate(item.publishedAt)}</strong>
                          <small title={item.reportTitle}>{item.reportTitle}</small>
                        </div>
                      </div>
                      <span>路线 {item.route} · #{String(item.routeRank).padStart(2, "0")}</span>
                    </div>
                    <div className="selection-product">
                      <ProductIcon iconUrl={item.iconUrl} route={item.route} title={item.title} />
                      <div className="selection-product-copy">
                        <a className="product-title-link" href={item.references.find((reference) => reference.storeUrl)?.storeUrl ?? item.references[0]?.url} target="_blank" rel="noreferrer">{bilingualName(item.title, item.titleZh)}</a>
                        <ProductFormBadge form={item.productForm} />
                        <small>{item.category} · {item.market}</small>
                        <ReferenceLinks references={item.references} />
                        {item.packageUrl ? <a className="package-download-link" href={item.packageUrl} download>下载资料包</a> : null}
                        {item.decision === "ROUTE_SELECTED" ? <Link className="package-download-link" href={`/projects/${encodeURIComponent(item.id)}`}>打开制作档案 →</Link> : null}
                      </div>
                    </div>
                    <div className="selection-opportunity">
                      <p>{item.opportunity}</p>
                      <ul>
                        {item.improvements.map((improvement) => <li key={improvement}>{improvement}</li>)}
                      </ul>
                    </div>
                    <div className="selection-status">
                      <b>{decisionLabel(item.decision)}</b>
                      <small>{packageLabel(item.packageStatus)}</small>
                    </div>
                    <div className="selection-score">
                      <strong>{item.routeScore}</strong>
                      <small>{Math.round(item.dataCompleteness * 100)}% 完整</small>
                    </div>
                    <Link href={`/reports/${item.reportId}#${item.id}`} aria-label={`在报告中查看${bilingualName(item.title, item.titleZh)}`}>↗</Link>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="selection-empty">
              <span>0 RESULT</span>
              <h2>没有符合当前条件的候选</h2>
              <p>清除部分筛选条件，或等待下一份报告入库。</p>
              <Link href="/candidates">查看全部候选</Link>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function FilterSelect({
  label,
  name,
  value,
  children,
}: {
  label: string;
  name: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <select name={name} defaultValue={value ?? ""}>{children}</select>
    </label>
  );
}

function toFilters(raw: SearchParams): CandidateArchiveFilters {
  const value = (key: string) => {
    const item = raw[key];
    return Array.isArray(item) ? item[0] : item;
  };
  return {
    reportId: value("reportId"),
    route: value("route") as CandidateArchiveFilters["route"],
    productForm: value("productForm") as CandidateArchiveFilters["productForm"],
    decision: value("decision") as CandidateArchiveFilters["decision"],
    packageStatus: value("packageStatus") as CandidateArchiveFilters["packageStatus"],
    category: value("category"),
    market: value("market"),
    query: value("q"),
  };
}

function hasFilters(filters: CandidateArchiveFilters) {
  return Object.values(filters).some(Boolean);
}

function decisionLabel(value: string) {
  return {
    ROUTE_SELECTED: "路线入选",
    ROUTE_BACKUP: "路线备选",
    ROUTE_WATCH: "持续观察",
    REJECTED: "已淘汰",
  }[value] ?? value;
}

function packageLabel(value: string) {
  return {
    READY_FOR_BENCH: "可进入工作台",
    DRAFT: "资料包待完善",
    BLOCKED: "资料包被阻塞",
  }[value] ?? value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}
