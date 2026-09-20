export type GoogleNewsItem = {
  title: string;
  link: string;
  source: string;
  publishedAt: string | null;
};

const FEED =
  "https://news.google.com/rss/search?hl=ko&gl=KR&ceid=KR:ko&q=";

/** 뉴스/주장 텍스트에서 RSS 검색어를 짧게 뽑는다. */
export function buildSearchQuery(text: string, maxLen = 80): string {
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/["""'']/g, "")
    .trim();
  const firstSentence =
    cleaned.split(/(?<=[.!?。])\s+/)[0] || cleaned;
  return firstSentence.slice(0, maxLen).trim();
}

export async function fetchGoogleNewsRss(
  query: string,
  limit = 8,
): Promise<GoogleNewsItem[]> {
  const q = query.trim();
  if (!q) return [];

  const url = `${FEED}${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "news-context/0.1 (evidence lookup)",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Google News RSS 요청 실패 (${res.status})`);
  }

  const xml = await res.text();
  return parseRssItems(xml).slice(0, limit);
}

function parseRssItems(xml: string): GoogleNewsItem[] {
  const items: GoogleNewsItem[] = [];
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

  for (const block of itemBlocks) {
    const rawTitle = decodeXml(tagText(block, "title"));
    const link = decodeXml(tagText(block, "link"));
    const pubDate = tagText(block, "pubDate") || null;
    const source =
      decodeXml(tagText(block, "source")) ||
      extractSourceFromTitle(rawTitle) ||
      "출처 미상";
    const title = stripSourceSuffix(rawTitle, source);

    if (!title || !link) continue;
    items.push({
      title,
      link,
      source,
      publishedAt: pubDate,
    });
  }

  return items;
}

function tagText(block: string, tag: string): string {
  const re = new RegExp(
    `<${tag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))</${tag}>`,
    "i",
  );
  const m = block.match(re);
  return (m?.[1] ?? m?.[2] ?? "").trim();
}

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractSourceFromTitle(title: string): string | null {
  const m = title.match(/\s[-–—]\s([^−–—-]+)$/);
  return m?.[1]?.trim() || null;
}

function stripSourceSuffix(title: string, source: string): string {
  if (!source) return title;
  const suffix = new RegExp(`\\s[-–—]\\s${escapeReg(source)}\\s*$`);
  return title.replace(suffix, "").trim();
}

function escapeReg(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
