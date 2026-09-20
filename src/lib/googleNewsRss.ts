import {
  classifyMediaTier,
  siteQueryChunks,
  type MediaTier,
} from "@/lib/verificationTiers";

export type GoogleNewsItem = {
  title: string;
  link: string;
  /** 가능하면 언론사 원문 URL */
  url: string;
  source: string;
  publishedAt: string | null;
  mediaTier?: string;
};

/**
 * 티어 검색용 로케일. 국가 나열이 아니라 T1~T4 매체가 색인되는 창구.
 * zh/ru/ar는 관영·권위주의(T4) 노출용.
 */
const FEED = {
  en: "https://news.google.com/rss/search?hl=en-US&gl=US&ceid=US:en&q=",
  ko: "https://news.google.com/rss/search?hl=ko&gl=KR&ceid=KR:ko&q=",
  ja: "https://news.google.com/rss/search?hl=ja&gl=JP&ceid=JP:ja&q=",
  zh: "https://news.google.com/rss/search?hl=zh-CN&gl=CN&ceid=CN:zh-Hans&q=",
  ru: "https://news.google.com/rss/search?hl=ru&gl=RU&ceid=RU:ru&q=",
  ar: "https://news.google.com/rss/search?hl=ar&gl=AE&ceid=AE:ar&q=",
} as const;

const TIER_ORDER: Exclude<MediaTier, "TX">[] = ["T1", "T2", "T3", "T4"];

/** 티어별로 어느 색인 창을 칠지 (요청 수 제한) */
const TIER_WINDOWS: Record<Exclude<MediaTier, "TX">, (keyof typeof FEED)[]> = {
  T1: ["en", "ko"],
  T2: ["en", "ko", "ja"],
  T3: ["en", "zh"],
  T4: ["en", "zh", "ru", "ar"],
};

/** 뉴스/주장 텍스트에서 RSS 검색어를 짧게 뽑는다. */
export function buildSearchQuery(text: string, maxLen = 96): string {
  const cleaned = text
    .replace(/[→←↔⇒⇐]/g, " ")
    .replace(/["""'']/g, "")
    .replace(/[·•|/\\]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const firstSentence =
    cleaned.split(/(?<=[.!?。])\s+|:\s+/)[0] || cleaned;
  return firstSentence.slice(0, maxLen).trim();
}

/**
 * 같은 본문으로 여러 검색어를 만든다.
 * 첫 문장 → 핵심 고유명사/숫자 → 짧은 키워드 순으로 넓혀 빈 결과를 줄인다.
 */
export function buildSearchQueries(text: string): string[] {
  const primary = buildSearchQuery(text);
  const tokens = extractKeywords(text);
  const keywordQuery = tokens.slice(0, 6).join(" ");
  const shortQuery = tokens.slice(0, 3).join(" ");

  const out: string[] = [];
  for (const q of [primary, keywordQuery, shortQuery]) {
    const t = q.trim();
    if (t.length >= 2 && !out.includes(t)) out.push(t);
  }
  return out.length ? out : [primary || text.slice(0, 40)].filter(Boolean);
}

function extractKeywords(text: string): string[] {
  const raw = text
    .replace(/[→←↔⇒⇐:：]/g, " ")
    .replace(/["""'']/g, "")
    .replace(/[()[\]{}]/g, " ")
    .replace(/[,.;!?。·•|/\\]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const parts = raw.split(" ").filter(Boolean);
  const stop = new Set([
    "그리고",
    "또는",
    "및",
    "으로",
    "에서",
    "하는",
    "했다",
    "한다",
    "있다",
    "없는",
    "대한",
    "관련",
    "통해",
    "따르면",
    "것이다",
    "것이",
    "the",
    "and",
    "for",
    "with",
    "from",
    "that",
    "this",
    "are",
    "was",
    "were",
    "a",
    "an",
    "of",
    "to",
    "in",
    "on",
  ]);

  const scored = parts
    .map((p) => p.trim())
    .filter((p) => p.length >= 2 && !stop.has(p.toLowerCase()))
    .filter((p) => !/^(은|는|이|가|을|를|의|와|과|도|만|까지|부터)$/.test(p));

  const uniq: string[] = [];
  for (const p of scored) {
    if (!uniq.some((u) => u.toLowerCase() === p.toLowerCase())) uniq.push(p);
  }
  return uniq;
}

/** @deprecated 티어 검색 사용. 호환용으로 남김. */
export async function fetchGoogleNewsRss(
  query: string,
  limit = 12,
): Promise<GoogleNewsItem[]> {
  const { items } = await fetchRelatedNews(query, limit);
  return items;
}

/**
 * T1~T4 매체 도메인(site:)으로 각국·관영까지 긁고,
 * 티어 균형을 맞춰 돌려준다. 티어는 절대 바꾸지 않는다.
 */
export async function fetchRelatedNews(
  text: string,
  limit = 16,
): Promise<{ query: string; items: GoogleNewsItem[] }> {
  const queries = buildSearchQueries(text);
  const topic = queries[0] || text.slice(0, 80).trim();
  if (!topic) return { query: "", items: [] };

  const jobs: Promise<Omit<GoogleNewsItem, "url">[]>[] = [];

  for (const tier of TIER_ORDER) {
    // T4·T2는 매체가 많아 site: 묶음 2개까지
    const maxChunks = tier === "T4" || tier === "T2" ? 2 : 1;
    const chunks = siteQueryChunks(tier, 5).slice(0, maxChunks);
    for (const sitePart of chunks) {
      const q = `${topic} ${sitePart}`;
      for (const win of TIER_WINDOWS[tier]) {
        jobs.push(
          fetchOneFeedRaw(FEED[win], q, 8).catch((err) => {
            console.warn(`[google-news] ${tier}/${win}`, err);
            return [];
          }),
        );
      }
    }
  }

  // 주제 보조 검색 (목록 밖 TX 보완용). 분류는 classify가 엄격히 처리.
  for (const win of ["en", "ko", "zh", "ru"] as const) {
    jobs.push(
      fetchOneFeedRaw(FEED[win], topic, 4).catch((err) => {
        console.warn(`[google-news] open/${win}`, err);
        return [];
      }),
    );
  }

  const batches = await Promise.all(jobs);
  const raw = dedupeRaw(batches.flat());

  const resolved = await Promise.all(
    raw.map(async (item) => {
      const real = await resolvePublisherUrlFast(item.link);
      const url = real || item.link;
      const mediaTier = classifyMediaTier(item.source, url);
      return {
        ...item,
        url,
        link: url,
        mediaTier,
      };
    }),
  );

  const balanced = balanceByTier(resolved, limit);
  return { query: topic, items: balanced };
}

/** 티어별 균등 배분. T4도 반드시 자리 확보. TX는 남는 칸만. */
function balanceByTier(
  items: GoogleNewsItem[],
  limit: number,
): GoogleNewsItem[] {
  const buckets: Record<MediaTier, GoogleNewsItem[]> = {
    T1: [],
    T2: [],
    T3: [],
    T4: [],
    TX: [],
  };
  for (const item of items) {
    const t = (item.mediaTier as MediaTier) || "TX";
    buckets[t]?.push(item);
  }

  const perCore = Math.max(2, Math.floor(limit / 4));
  const out: GoogleNewsItem[] = [];
  const used = new Set<string>();

  const take = (list: GoogleNewsItem[], n: number) => {
    let added = 0;
    for (const item of list) {
      if (added >= n || out.length >= limit) break;
      const key = normalizeKey(item.url || item.link) || item.title;
      if (used.has(key)) continue;
      used.add(key);
      out.push(item);
      added++;
    }
  };

  for (const tier of TIER_ORDER) {
    take(buckets[tier], perCore);
  }
  for (const tier of TIER_ORDER) {
    if (out.length >= limit) break;
    take(buckets[tier], limit - out.length);
  }
  if (out.length < limit) {
    take(buckets.TX, Math.min(2, limit - out.length));
  }

  const rank: Record<string, number> = {
    T1: 0,
    T2: 1,
    T3: 2,
    T4: 3,
    TX: 4,
  };
  out.sort(
    (a, b) =>
      (rank[a.mediaTier || "TX"] ?? 9) - (rank[b.mediaTier || "TX"] ?? 9),
  );
  return out;
}

async function fetchOneFeedRaw(
  base: string,
  query: string,
  limit: number,
): Promise<Omit<GoogleNewsItem, "url">[]> {
  const url = `${base}${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; news-context/0.3; +https://localhost)",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
    next: { revalidate: 180 },
  });

  if (!res.ok) {
    throw new Error(`Google News RSS 요청 실패 (${res.status})`);
  }

  const xml = await res.text();
  return parseRssItems(xml).slice(0, limit);
}

function dedupeRaw(
  items: Omit<GoogleNewsItem, "url">[],
): Omit<GoogleNewsItem, "url">[] {
  const seen = new Set<string>();
  const out: Omit<GoogleNewsItem, "url">[] = [];
  for (const item of items) {
    const key = normalizeKey(item.link) || normalizeKey(item.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function dedupeItems(items: GoogleNewsItem[]): GoogleNewsItem[] {
  const seen = new Set<string>();
  const out: GoogleNewsItem[] = [];
  for (const item of items) {
    const key = normalizeKey(item.url || item.link) || normalizeKey(item.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function normalizeKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "");
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

/** 빠른 경로: 파라미터·article id만. HTTP follow 없음. */
async function resolvePublisherUrlFast(
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

  return tryDecodeGoogleArticleId(googleLink) || googleLink;
}

/** Google News 리다이렉트/파라미터에서 원문 URL을 뽑거나, 짧게 follow 한다. */
export async function resolvePublisherUrl(
  googleLink: string,
): Promise<string | null> {
  const fast = await resolvePublisherUrlFast(googleLink);
  if (fast && !/news\.google\.com/i.test(fast)) return fast;
  if (!googleLink || !/news\.google\.com/i.test(googleLink)) {
    return googleLink;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2200);
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
