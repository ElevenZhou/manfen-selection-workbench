import { getReport, listReports } from "../../lib/reports";
import { loadReferenceMedia } from "../../lib/referenceMedia";

/* Dynamic store assets are loaded from verified store URLs. */
/* eslint-disable @next/next/no-img-element */

/* Curated latest-case video. It is labeled as third-party gameplay evidence. */
const latestCaseVideo = {
  url: "https://www.youtube.com/watch?v=zgBze7IAdXQ",
  embedUrl: "https://www.youtube.com/embed/zgBze7IAdXQ",
  title: "Tiles Hop gameplay · rhythm music ball",
  channel: "MusicTiles",
  relation: "第三方玩法视频",
};

export async function LatestCaseShowcase() {
  const reports = (await listReports()).filter((report) => report.status !== "research").sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const latest = reports[0];
  if (!latest) return null;
  const data = await getReport(latest.id);
  const candidate = data?.candidates.find((item) => item.decision === "ROUTE_SELECTED") ?? data?.candidates[0];
  if (!candidate) return null;
  const media = await loadReferenceMedia(candidate.references);
  const hasTilesHop = candidate.references.some((reference) => reference.name.toLowerCase().includes("tiles hop"));

  return (
    <section className="latest-case-showcase" aria-labelledby="latest-case-title">
      <header className="latest-case-heading">
        <div><p className="eyebrow">LATEST CASE / VISUAL EVIDENCE</p><h2 id="latest-case-title">最新案例 · {latest.title}</h2><p>只展示最新报告的代表候选，集中查看图标、商店图和可播放玩法视频。</p></div>
        <a href={`/reports/${latest.id}`}>打开完整报告 ↗</a>
      </header>
      <div className="latest-case-grid">
        <article className="latest-case-product">
          <div className="latest-case-product-head">
            {media?.iconUrl ? <img src={media.iconUrl} alt={`${candidate.title} 参考产品图标`} width={64} height={64} loading="lazy" /> : <span className="latest-case-fallback-icon">{candidate.titleZh.slice(0, 2)}</span>}
            <div><strong>{candidate.titleZh || candidate.title}</strong><small>{candidate.category} · {candidate.market}</small></div>
          </div>
          <p>{candidate.opportunity}</p>
          <div className="latest-case-store-links">{candidate.references.slice(0, 3).map((reference) => <a href={reference.storeUrl || reference.url} target="_blank" rel="noreferrer" key={reference.url}>{reference.name} ↗</a>)}</div>
          {media?.screenshotUrls.length ? <div className="latest-case-shots">{media.screenshotUrls.slice(0, 3).map((url, index) => <img src={url} alt={`${candidate.title} 商店截图 ${index + 1}`} width={150} height={92} loading="lazy" key={url} />)}</div> : <div className="latest-case-no-shots">商店截图暂未返回，保留商店页面入口。</div>}
        </article>
        <article className="latest-case-video-card">
          <div className="latest-case-video-head"><div><span>PLAYABLE VIDEO EVIDENCE</span><strong>{hasTilesHop ? latestCaseVideo.title : "YouTube 玩法证据"}</strong></div><a href={latestCaseVideo.url} target="_blank" rel="noreferrer">打开 YouTube ↗</a></div>
          {hasTilesHop ? <iframe src={latestCaseVideo.embedUrl} title={latestCaseVideo.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <div className="latest-case-video-empty">当前候选还没有经过核验的具体视频 URL。</div>}
          <small>{latestCaseVideo.relation} · {latestCaseVideo.channel} · 仅作为最新案例的玩法参考</small>
        </article>
      </div>
    </section>
  );
}
