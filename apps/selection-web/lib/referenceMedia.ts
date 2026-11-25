import type { AppReference } from "./types";

export type ReferenceMedia = {
  name: string;
  sourceUrl: string;
  fetchedAt: string;
  iconUrl: string | null;
  screenshotUrls: string[];
  provider: "apple_itunes_lookup" | "store_page_only";
};

function appStoreId(url: string | null): string | null {
  const match = url?.match(/\/id(\d+)/);
  return match?.[1] ?? null;
}

export async function loadReferenceMedia(references: AppReference[]): Promise<ReferenceMedia | null> {
  const reference = references.find((item) => item.store === "apple_app_store" && appStoreId(item.storeUrl));
  if (!reference) return null;
  const sourceUrl = reference.storeUrl!;
  const id = appStoreId(sourceUrl)!;
  const fetchedAt = new Date().toISOString();
  try {
    const response = await fetch(`https://itunes.apple.com/lookup?id=${id}&entity=software`, { next: { revalidate: 86400 } });
    if (!response.ok) throw new Error(`lookup ${response.status}`);
    const payload = await response.json() as { results?: Array<{ artworkUrl512?: string; screenshotUrls?: string[] }> };
    const result = payload.results?.[0];
    return { name: reference.name, sourceUrl, fetchedAt, iconUrl: result?.artworkUrl512 ?? null, screenshotUrls: (result?.screenshotUrls ?? []).slice(0, 3), provider: "apple_itunes_lookup" };
  } catch {
    return { name: reference.name, sourceUrl, fetchedAt, iconUrl: null, screenshotUrls: [], provider: "store_page_only" };
  }
}
