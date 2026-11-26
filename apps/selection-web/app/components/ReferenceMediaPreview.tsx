import type { AppReference } from "../../lib/types";
import { loadReferenceMedia } from "../../lib/referenceMedia";

/* Reference media comes from dynamic store hosts. */
/* eslint-disable @next/next/no-img-element */

export async function ReferenceMediaPreview({ references, title }: { references: AppReference[]; title: string }) {
  const media = await loadReferenceMedia(references);
  if (!media || (!media.iconUrl && media.screenshotUrls.length === 0)) {
    return <div className="reference-media-preview reference-media-empty"><span>商店图待抓取</span><small>打开参照产品链接查看原始页面</small></div>;
  }
  return (
    <div className="reference-media-preview">
      <div className="reference-media-head">
        {media.iconUrl ? <img src={media.iconUrl} alt={`${title} 参考产品图标`} width={36} height={36} loading="lazy" /> : null}
        <span>商店视觉资料 · {media.provider === "apple_itunes_lookup" ? "App Store" : "商店页面"}</span>
      </div>
      {media.screenshotUrls.length ? <div className="reference-media-shots">{media.screenshotUrls.slice(0, 2).map((url, index) => <img src={url} alt={`${title} 商店截图 ${index + 1}`} width={120} height={76} loading="lazy" key={url} />)}</div> : null}
      <small>来源：<a href={media.sourceUrl} target="_blank" rel="noreferrer">打开商店页面 ↗</a></small>
    </div>
  );
}
