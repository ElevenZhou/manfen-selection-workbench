import type { YoutubeVideoEvidence } from "../../lib/types";

export function YoutubeEvidence({ evidence, candidateName }: { evidence: YoutubeVideoEvidence; candidateName?: string }) {
  const found = evidence.status === "found" && evidence.videos.length > 0;
  const query = evidence.query.startsWith("未提供") && candidateName ? `${candidateName} gameplay demo review` : evidence.query;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  return (
    <div className={`youtube-evidence ${found ? "youtube-found" : "youtube-insufficient"}`}>
      <span className="youtube-evidence-label">YouTube 证据</span>
      {found ? (
        <div className="youtube-evidence-links">
          {evidence.videos.slice(0, 2).map((video) => (
            <a href={video.url} target="_blank" rel="noreferrer" key={video.url}>
              ▶ {video.title} · {video.channel}
            </a>
          ))}
        </div>
      ) : (
        <span className="youtube-evidence-note">insufficient_data · {evidence.limitation}</span>
      )}
      <small>检索范围：{evidence.scope} · 关键词：{query} · <a href={searchUrl} target="_blank" rel="noreferrer">打开检索入口 ↗</a></small>
    </div>
  );
}
