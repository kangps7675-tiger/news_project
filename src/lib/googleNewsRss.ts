export type GoogleNewsItem = {
  title: string;
  link: string;
  /** 가능하면 언론사 원문 URL */
  url: string;
  source: string;
  publishedAt: string | null;
  mediaTier?: string;
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
      "User-Agent":
        "Mozilla/5.0 (compatible; news-context/0.2; +https://localhost)",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Google News RSS 요청 실패 (${res.status})`);
  }

  const xml = await res.text();
  const raw = parseRssItems(xml).slice(0, limit);

  const resolved = await Promise.all(
    raw.map(async (item) => {
      const real = await resolvePublisherUrl(item.link);
      return { ...item, url: real || item.link, link: real || item.link };
    }),
  );

  return resolved;
}

function parseRssItems(xml: string): Omit<GoogleNewsItem, "url">[] {
  const items: Omit<GoogleNewsItem, "url">[] = [];
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

  for (const block of itemBlocks) {
    const rawTitle = decodeXml(tagText(block, "title"));
    const link = decodeXml(tagText(block, "link"));
    const guid = decodeXml(tagText(block, "guid"));
    const pubDate = tagText(block, "pubDate") || null;
    const description = decodeXml(tagText(block, "description"));
    const source =
      decodeXml(tagText(block, "source")) ||
      extractSourceFromTitle(rawTitle) ||
      "출처 미상";
    const title = stripSourceSuffix(rawTitle, source);
    const fromDesc = extractHttpFromHtml(description);
    const href = fromDesc || link || guid;

    if (!title || !href) continue;
    items.push({
      title,
      link: href,
      source,
      publishedAt: pubDate,
    });
  }

  return items;
}

function extractHttpFromHtml(html: string): string | null {
  if (!html) return null;
  const anchors = [
    ...html.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi),
  ].map((m) => m[1]);
  for (const a of anchors) {
    if (!/news\.google\.com/i.test(a)) return a;
  }
  return null;
}

/** Google News 리다이렉트/파라미터에서 원문 URL을 뽑거나, 짧게 follow 한다. */
export async function resolvePublisherUrl(
  googleLink: string,
): Promise<string | null> {
  if (!googleLink) return null;
  if (!/news\.google\.com/i.test(googleLink)) {
    return googleLink;
  }

  try {
    const u = new URL(googleLink);
    for (const key of ["url", "q", "u"]) {
      const v = u.searchParams.get(key);
      if (v && /^https?:\/\//i.test(v) && !/news\.google\.com/i.test(v)) {
        return v;
      }
    }
  } catch {
    /* ignore */
  }

  const decoded = tryDecodeGoogleArticleId(googleLink);
  if (decoded) return decoded;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const articleUrl = googleLink
      .replace("/rss/articles/", "/articles/")
      .replace("/rss/search?", "/search?");
    const res = await fetch(articleUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      },
    });
    clearTimeout(timer);
    const finalUrl = res.url;
    if (finalUrl && !/news\.google\.com/i.test(finalUrl)) {
      return finalUrl;
    }

    const html = await res.text();
    const og =
      html.match(
        /property=["']og:url["']\s+content=["']([^"']+)["']/i,
      ) ||
      html.match(/content=["']([^"']+)["']\s+property=["']og:url["']/i);
    if (og?.[1] && !/news\.google\.com/i.test(og[1])) return og[1];

    const canonical =
      html.match(/rel=["']canonical["']\s+href=["']([^"']+)["']/i) ||
      html.match(/href=["']([^"']+)["']\s+rel=["']canonical["']/i);
    if (canonical?.[1] && !/news\.google\.com/i.test(canonical[1])) {
      return canonical[1];
    }

    const dataUrl = html.match(/data-n-au=["'](https?:\/\/[^"']+)["']/i);
    if (dataUrl?.[1] && !/news\.google\.com/i.test(dataUrl[1])) {
      return dataUrl[1];
    }

    const redirectMeta = html.match(
      /content=["']0;\s*url=["']?(https?:\/\/[^"'>\s]+)["']?/i,
    );
    if (redirectMeta?.[1] && !/news\.google\.com/i.test(redirectMeta[1])) {
      return redirectMeta[1];
    }

    const plain = extractHttpFromHtml(html);
    if (plain) return plain;
  } catch {
    /* keep google link */
  }

  return googleLink;
}

/** Google News article id(CBMi…) 안에 박힌 http URL을 느슨하게 추출 */
function tryDecodeGoogleArticleId(googleLink: string): string | null {
  try {
    const m = googleLink.match(/articles\/([A-Za-z0-9_\-]+)/);
    if (!m?.[1]) return null;
    let b64 = m[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    const raw = Buffer.from(b64, "base64").toString("latin1");
    const urls = raw.match(/https?:\/\/[^\x00-\x1f\s"<>]+/g) || [];
    for (const u of urls) {
      const cleaned = u.replace(/[.,;)\]]+$/, "");
      if (!/news\.google\.com/i.test(cleaned)) return cleaned;
    }
  } catch {
    /* ignore */
  }
  return null;
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
