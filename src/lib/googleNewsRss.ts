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
 * zh/ru/ar는 관영·권위주의(T4) 노출용. de/fr/es는 유럽·중남미 심층 보도용.
 */
const FEED = {
  en: "https://news.google.com/rss/search?hl=en-US&gl=US&ceid=US:en&q=",
  ko: "https://news.google.com/rss/search?hl=ko&gl=KR&ceid=KR:ko&q=",
  ja: "https://news.google.com/rss/search?hl=ja&gl=JP&ceid=JP:ja&q=",
  zh: "https://news.google.com/rss/search?hl=zh-CN&gl=CN&ceid=CN:zh-Hans&q=",
  ru: "https://news.google.com/rss/search?hl=ru&gl=RU&ceid=RU:ru&q=",
  ar: "https://news.google.com/rss/search?hl=ar&gl=AE&ceid=AE:ar&q=",
  de: "https://news.google.com/rss/search?hl=de&gl=DE&ceid=DE:de&q=",
  fr: "https://news.google.com/rss/search?hl=fr&gl=FR&ceid=FR:fr&q=",
  es: "https://news.google.com/rss/search?hl=es&gl=ES&ceid=ES:es&q=",
} as const;

type FeedKey = keyof typeof FEED;

const TIER_ORDER: Exclude<MediaTier, "TX">[] = ["T1", "T2", "T3", "T4"];

/** 티어별로 어느 색인 창을 칠지 (요청 수·포괄성 균형) */
const TIER_WINDOWS: Record<Exclude<MediaTier, "TX">, FeedKey[]> = {
  T1: ["en", "ko", "de"],
  T2: ["en", "ko", "ja"],
  T3: ["en", "zh", "es"],
  T4: ["en", "zh", "ru", "ar"],
};

/** 티어별 site: 묶음 상한 */
const TIER_CHUNK_CAP: Record<Exclude<MediaTier, "TX">, number> = {
  T1: 2,
  T2: 2,
  T3: 2,
  T4: 2,
};

/**
 * 카드·지정학 키워드 → 영·아랍 등 교차 검색어.
 * 본문에 한국어만 있어도 해외 심층 보도를 잡기 위함.
 */
const TERM_ALIASES: Record<string, string[]> = {
  후티: ["Houthi", "Ansar Allah", "Huthi"],
  후티반군: ["Houthi rebels", "Ansar Allah"],
  예멘: ["Yemen", "Yemeni"],
  사우디: ["Saudi Arabia", "Saudi"],
  홍해: ["Red Sea", "Bab el-Mandeb"],
  바브엘만데브: ["Bab el-Mandeb", "Bab al-Mandab"],
  페림: ["Perim Island", "Mayyun"],
  모카: ["Mocha Yemen", "Mokha"],
  호르무즈: ["Strait of Hormuz", "Hormuz Strait"],
  이란: ["Iran", "Islamic Republic of Iran"],
  이스라엘: ["Israel", "IDF"],
  가자: ["Gaza", "Gaza Strip"],
  레바논: ["Lebanon", "Hezbollah"],
  헤즈볼라: ["Hezbollah", "Hizballah"],
  우크라이나: ["Ukraine", "Ukrainian"],
  러시아: ["Russia", "Russian"],
  북한: ["North Korea", "DPRK", "Kim Jong Un"],
  중국: ["China", "Beijing", "PLA"],
  대만: ["Taiwan", "Taiwan Strait"],
  남중국해: ["South China Sea"],
  나타즈: ["Natanz"],
  포르도: ["Fordow", "Fordo"],
  이스파한: ["Isfahan"],
  부셰흐르: ["Bushehr"],
  샤헤드: ["Shahed drone", "Shahed-136"],
  게란: ["Geran-2", "Geran drone"],
  옐라부가: ["Yelabuga", "Alabuga"],
  크림: ["Crimea"],
  돈바스: ["Donbas", "Donbass"],
  흑해: ["Black Sea"],
  수에즈: ["Suez Canal"],
  말라카: ["Strait of Malacca", "Malacca Strait"],
  대만해협: ["Taiwan Strait"],
  원유: ["crude oil", "oil price"],
  금값: ["gold price", "bullion"],
  달러: ["US dollar", "DXY"],
};

/** 뉴스/주장 텍스트에서 RSS 검색어를 짧게 뽑는다. */
export function buildSearchQuery(text: string, maxLen = 110): string {
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
 * 첫 문장 → 키워드 → 영문 별칭 → 짧은 핵심어 순으로 넓혀 빈·얕은 결과를 줄인다.
 */
export function buildSearchQueries(text: string): string[] {
  const primary = buildSearchQuery(text);
  const tokens = extractKeywords(text);
  const keywordQuery = tokens.slice(0, 8).join(" ");
  const shortQuery = tokens.slice(0, 4).join(" ");
  const aliasQueries = expandAliasQueries(text, tokens);

  const out: string[] = [];
  for (const q of [primary, keywordQuery, ...aliasQueries, shortQuery]) {
    const t = q.trim();
    if (t.length >= 2 && !out.includes(t)) out.push(t);
  }
  return out.length ? out : [primary || text.slice(0, 40)].filter(Boolean);
}

function expandAliasQueries(text: string, tokens: string[]): string[] {
  const lower = text.toLowerCase();
  const enTerms: string[] = [];
  for (const [ko, enList] of Object.entries(TERM_ALIASES)) {
    if (lower.includes(ko.toLowerCase()) || tokens.some((t) => t.includes(ko))) {
      enTerms.push(...enList.slice(0, 2));
    }
  }
  const uniqEn: string[] = [];
  for (const t of enTerms) {
    if (!uniqEn.some((u) => u.toLowerCase() === t.toLowerCase())) uniqEn.push(t);
  }
  if (!uniqEn.length) return [];

  const queries: string[] = [];
  // 핵심 영문 묶음 (최대 2개 쿼리)
  queries.push(uniqEn.slice(0, 4).join(" "));
  if (uniqEn.length > 4) {
    queries.push(uniqEn.slice(4, 8).join(" "));
  }
  // 단일 고유명사 심층 (따옴표로 정확 매칭)
  for (const t of uniqEn.slice(0, 3)) {
    if (t.includes(" ")) queries.push(`"${t}"`);
  }
  return queries;
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
 * T1~T4 매체 도메인(site:) + 다국어·다검색어로 긁고,
 * 티어 균형을 맞춰 돌려준다. 티어는 절대 바꾸지 않는다.
 */
export async function fetchRelatedNews(
  text: string,
  limit = 28,
): Promise<{ query: string; items: GoogleNewsItem[] }> {
  const queries = buildSearchQueries(text);
  const topic = queries[0] || text.slice(0, 80).trim();
  if (!topic) return { query: "", items: [] };

  const jobs: Promise<Omit<GoogleNewsItem, "url">[]>[] = [];
  const pushJob = (base: string, q: string, n: number, tag: string) => {
    jobs.push(
      fetchOneFeedRaw(base, q, n).catch((err) => {
        console.warn(`[google-news] ${tag}`, err);
        return [];
      }),
    );
  };

  // 1) 티어별 site: + when:30d — 최근 한 달 심층 보도
  const enAlias = queries.find((q) => /^[A-Za-z"']/.test(q.trim())) || null;

  for (const tier of TIER_ORDER) {
    const chunks = siteQueryChunks(tier, 5).slice(0, TIER_CHUNK_CAP[tier]);
    for (const sitePart of chunks) {
      for (const win of TIER_WINDOWS[tier]) {
        pushJob(
          FEED[win],
          `${topic} ${sitePart} when:30d`,
          10,
          `${tier}/${win}`,
        );
      }
      // T1·T4는 영문 별칭으로 한 번 더 (해외·관영 심층)
      if (enAlias && (tier === "T1" || tier === "T4")) {
        pushJob(
          FEED.en,
          `${enAlias} ${sitePart} when:30d`,
          10,
          `${tier}/en-alias`,
        );
      }
    }
  }

  // 2) 열린 검색 — 검색어 변형 × 로케일 (지역·TX 보완)
  const openWindows: FeedKey[] = ["en", "ko", "zh", "ru", "ar", "de"];
  for (const q of queries.slice(0, 2)) {
    for (const win of openWindows) {
      pushJob(FEED[win], `${q} when:30d`, 6, `open/${win}`);
    }
  }

  // 3) 단기 속보 (when:7d)
  for (const win of ["en", "ko"] as const) {
    pushJob(FEED[win], `${topic} when:7d`, 8, `flash/${win}`);
  }

  const batches = await Promise.all(jobs);
  let raw = dedupeRaw(batches.flat());
  raw = sortByPublishedDesc(raw).slice(0, 56);

  // 상위는 HTTP follow로 원문, 나머지는 빠른 해석
  const resolved = await mapPool(raw, 10, async (item, index) => {
    const real =
      index < 28
        ? await resolvePublisherUrlDeep(item.link)
        : await resolvePublisherUrlFast(item.link);
    const url = real || item.link;
    const mediaTier = classifyMediaTier(item.source, url);
    return {
      ...item,
      url,
      link: url,
      mediaTier,
    };
  });

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

  // 티어 안에서 최신 보도 우선
  for (const t of Object.keys(buckets) as MediaTier[]) {
    buckets[t] = sortByPublishedDesc(buckets[t]);
  }

  const perCore = Math.max(3, Math.floor(limit / 4));
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
    take(buckets.TX, Math.min(4, limit - out.length));
  }

  const rank: Record<string, number> = {
    T1: 0,
    T2: 1,
    T3: 2,
    T4: 3,
    TX: 4,
  };
  out.sort((a, b) => {
    const tr =
      (rank[a.mediaTier || "TX"] ?? 9) - (rank[b.mediaTier || "TX"] ?? 9);
    if (tr !== 0) return tr;
    return publishedMs(b.publishedAt) - publishedMs(a.publishedAt);
  });
  return out;
}

function sortByPublishedDesc<T extends { publishedAt: string | null }>(
  items: T[],
): T[] {
  return [...items].sort(
    (a, b) => publishedMs(b.publishedAt) - publishedMs(a.publishedAt),
  );
}

function publishedMs(pub: string | null | undefined): number {
  if (!pub) return 0;
  const t = Date.parse(pub);
  return Number.isFinite(t) ? t : 0;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
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
        "Mozilla/5.0 (compatible; news-context/0.4; +https://localhost)",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
    next: { revalidate: 120 },
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

/** 빠른 경로 후, 구글 링크면 HTTP follow로 원문 확보 */
async function resolvePublisherUrlDeep(
  googleLink: string,
): Promise<string | null> {
  const fast = await resolvePublisherUrlFast(googleLink);
  if (fast && !/news\.google\.com/i.test(fast)) return fast;
  if (!googleLink || !/news\.google\.com/i.test(googleLink)) {
    return googleLink || fast;
  }
  return resolvePublisherUrl(googleLink);
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
    const timer = setTimeout(() => controller.abort(), 2800);
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
