import {
  classifyMediaTier,
  siteQueryChunks,
  type MediaTier,
} from "@/lib/verificationTiers";
import { translateTitlesToKorean } from "@/lib/gemini";

export type GoogleNewsItem = {
  /** 화면용 — 가능하면 한글 번역 제목 */
  title: string;
  /** 원문 헤드라인 */
  titleOriginal?: string;
  link: string;
  /** 가능하면 언론사 원문 URL */
  url: string;
  source: string;
  publishedAt: string | null;
  mediaTier?: string;
};

/**
 * 검색은 영어 피드 중심. zh/ru/ar는 관영(T4) 보완용.
 */
const FEED = {
  en: "https://news.google.com/rss/search?hl=en-US&gl=US&ceid=US:en&q=",
  ko: "https://news.google.com/rss/search?hl=ko&gl=KR&ceid=KR:ko&q=",
  zh: "https://news.google.com/rss/search?hl=zh-CN&gl=CN&ceid=CN:zh-Hans&q=",
  ru: "https://news.google.com/rss/search?hl=ru&gl=RU&ceid=RU:ru&q=",
  ar: "https://news.google.com/rss/search?hl=ar&gl=AE&ceid=AE:ar&q=",
  de: "https://news.google.com/rss/search?hl=de&gl=DE&ceid=DE:de&q=",
} as const;

type FeedKey = keyof typeof FEED;

const TIER_ORDER: Exclude<MediaTier, "TX">[] = ["T1", "T2", "T3", "T4"];

/** site: 검색은 영어 색인 우선 (요청 수 절약) */
const TIER_WINDOWS: Record<Exclude<MediaTier, "TX">, FeedKey[]> = {
  T1: ["en"],
  T2: ["en"],
  T3: ["en"],
  T4: ["en", "ru", "ar", "zh"],
};

const TIER_CHUNK_CAP: Record<Exclude<MediaTier, "TX">, number> = {
  T1: 2,
  T2: 2,
  T3: 2,
  T4: 2,
};

/**
 * 한국어·약어 → 영문 검색어.
 * 카드 주장 문장 전체가 아니라 이 별칭으로 뒤진다.
 */
const TERM_ALIASES: Record<string, string[]> = {
  후티: ["Houthi", "Ansar Allah"],
  후티반군: ["Houthi rebels"],
  예멘: ["Yemen"],
  사우디: ["Saudi Arabia", "Saudi"],
  홍해: ["Red Sea"],
  바브엘만데브: ["Bab el-Mandeb"],
  페림: ["Perim Island", "Mayyun"],
  마윤: ["Mayyun", "Perim"],
  모카: ["Mocha Yemen", "Mokha"],
  타이즈: ["Taiz Yemen"],
  마리브: ["Marib"],
  호데이다: ["Hodeidah", "Hudaydah"],
  호르무즈: ["Strait of Hormuz"],
  이란: ["Iran"],
  이스라엘: ["Israel"],
  가자: ["Gaza"],
  레바논: ["Lebanon"],
  헤즈볼라: ["Hezbollah"],
  우크라이나: ["Ukraine"],
  러시아: ["Russia"],
  북한: ["North Korea", "DPRK"],
  중국: ["China"],
  대만: ["Taiwan"],
  나타즈: ["Natanz"],
  포르도: ["Fordow"],
  이스파한: ["Isfahan"],
  샤헤드: ["Shahed drone", "Shahed"],
  게란: ["Geran drone", "Geran-2"],
  옐라부가: ["Yelabuga", "Alabuga"],
  크림: ["Crimea"],
  페오도시야: ["Feodosia"],
  카스피해: ["Caspian Sea"],
  아미라바드: ["Amirabad"],
  안잘리: ["Anzali", "Bandar Anzali"],
  반다르안잘리: ["Bandar Anzali"],
  아스트라한: ["Astrakhan"],
  볼가: ["Volga"],
  키이우: ["Kyiv"],
  하르키우: ["Kharkiv"],
  정유: ["oil refinery"],
  드론: ["drone"],
  미사일: ["missile"],
  나포: ["tanker seizure"],
  마리네라: ["Marinera tanker", "Bella 1 tanker"],
  그림자: ["shadow fleet"],
  함대: ["shadow fleet"],
  티팟: ["teapot refinery", "Shandong refinery"],
  산둥: ["Shandong China oil"],
  송유관: ["oil pipeline Saudi"],
  동서: ["East West Pipeline Saudi"],
  쇄빙: ["icebreaker Arctic"],
  북동항로: ["Northern Sea Route", "NSR Arctic"],
  그린란드: ["Greenland"],
  희토류: ["rare earth"],
  수출통제: ["export control China"],
  남오세티아: ["South Ossetia MRB"],
  루블: ["ruble banking North Korea"],
  파병: ["North Korea troops Russia"],
  노동자: ["North Korean workers Russia"],
  조약: ["North Korea Russia treaty"],
  방공: ["air defense North Korea"],
  부품: ["drone components China"],
  영국해협: ["English Channel tanker"],
  유조선: ["oil tanker"],
  핵: ["nuclear Iran"],
  재보급: ["Iran Russia resupply"],
  INSTC: ["INSTC corridor", "International North South Transport Corridor"],
  NSR: ["Northern Sea Route"],
  MRB: ["MRB bank South Ossetia"],
  MSMT: ["North Korea Russia military"],
  KN: ["KN-23 missile"],
  TNT: ["munitions Caspian"],
  HESA: ["HESA Isfahan"],
  Bella: ["Bella 1 tanker", "Marinera"],
  Anna: ["Iran ship Caspian Anna"],
};

/** @deprecated 호환용 — 영문 쿼리 빌더 사용 */
export function buildSearchQuery(text: string, maxLen = 110): string {
  const qs = buildEnglishQueries(text);
  return (qs[0] || text).slice(0, maxLen).trim();
}

/** @deprecated */
export function buildSearchQueries(text: string): string[] {
  return buildEnglishQueries(text);
}

/**
 * 카드·주장 텍스트 → 짧은 영문 검색어 목록 (넓은 것 → 좁은 것).
 */
export function buildEnglishQueries(text: string): string[] {
  const tokens = extractKeywords(text);
  const enTerms = collectEnglishTerms(text, tokens);

  const out: string[] = [];
  const push = (q: string) => {
    const t = q.replace(/\s+/g, " ").trim();
    if (t.length < 2) return;
    if (!out.some((u) => u.toLowerCase() === t.toLowerCase())) out.push(t);
  };

  // 넓은 조합 → 짧은 단어 (폴백용)
  if (enTerms.length >= 2) push(enTerms.slice(0, 4).join(" "));
  if (enTerms.length >= 2) push(enTerms.slice(0, 2).join(" "));
  for (const t of enTerms.slice(0, 6)) push(t);

  // 본문에 이미 있는 영문 토큰 (INSTC, NSR…)
  for (const t of tokens) {
    if (/^[A-Za-z][A-Za-z0-9.\-]{1,24}$/.test(t)) push(t);
  }

  if (!out.length) {
    push("geopolitics conflict");
    push("international news");
  }
  return out;
}

function collectEnglishTerms(text: string, tokens: string[]): string[] {
  const hay = text.toLowerCase();
  const found: string[] = [];

  // 긴 키부터 매칭 (바브엘만데브 > 만데브)
  const keys = Object.keys(TERM_ALIASES).sort((a, b) => b.length - a.length);
  for (const ko of keys) {
    const hit =
      hay.includes(ko.toLowerCase()) ||
      tokens.some(
        (t) =>
          t.toLowerCase().includes(ko.toLowerCase()) ||
          ko.toLowerCase().includes(t.toLowerCase()),
      );
    if (!hit) continue;
    for (const en of TERM_ALIASES[ko].slice(0, 2)) {
      if (!found.some((f) => f.toLowerCase() === en.toLowerCase())) {
        found.push(en);
      }
    }
  }

  for (const t of tokens) {
    if (/^[A-Za-z][A-Za-z0-9.\-]{1,24}$/.test(t)) {
      if (!found.some((f) => f.toLowerCase() === t.toLowerCase())) {
        found.push(t);
      }
    }
  }
  return found;
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
    "보도",
    "주장",
    "분석",
    "등",
    "쪽",
    "측",
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
    .filter((p) => !/^(은|는|이|가|을|를|의|와|과|도|만|까지|부터|년|월|일)$/.test(p));

  const uniq: string[] = [];
  for (const p of scored) {
    if (!uniq.some((u) => u.toLowerCase() === p.toLowerCase())) uniq.push(p);
  }
  return uniq;
}

/** @deprecated */
export async function fetchGoogleNewsRss(
  query: string,
  limit = 12,
): Promise<GoogleNewsItem[]> {
  const { items } = await fetchRelatedNews(query, limit);
  return items;
}

/**
 * 영문 검색어로 RSS를 긁고, 비면 단계적으로 넓힌 뒤
 * 제목을 한글로 번역해 돌려준다.
 */
export async function fetchRelatedNews(
  text: string,
  limit = 24,
): Promise<{ query: string; items: GoogleNewsItem[] }> {
  const queries = buildEnglishQueries(text);
  const topic = queries[0] || "geopolitics";
  if (!topic) return { query: "", items: [] };

  let raw: Omit<GoogleNewsItem, "url">[] = [];

  // 1) 열린 영문 검색 (when 없음) — 가장 잘 붙음
  raw = await mergeRaw(
    raw,
    runJobs(
      queries.slice(0, 4).flatMap((q) => [
        { base: FEED.en, q, n: 10, tag: `open-en/${q.slice(0, 24)}` },
      ]),
    ),
  );

  // 2) 결과 부족하면 site: T1~T4 (영문 색인)
  if (raw.length < 10) {
    const siteJobs: FeedJob[] = [];
    for (const tier of TIER_ORDER) {
      const chunks = siteQueryChunks(tier, 5).slice(0, TIER_CHUNK_CAP[tier]);
      for (const sitePart of chunks) {
        for (const win of TIER_WINDOWS[tier]) {
          siteJobs.push({
            base: FEED[win],
            q: `${topic} ${sitePart}`,
            n: 8,
            tag: `site-${tier}/${win}`,
          });
        }
      }
    }
    raw = await mergeRaw(raw, runJobs(siteJobs));
  }

  // 3) 다른 로케일에 같은 영문 쿼리
  if (raw.length < 8) {
    const locales: FeedKey[] = ["de", "ko", "ar", "ru", "zh"];
    raw = await mergeRaw(
      raw,
      runJobs(
        queries.slice(0, 2).flatMap((q) =>
          locales.map((win) => ({
            base: FEED[win],
            q,
            n: 6,
            tag: `locale/${win}`,
          })),
        ),
      ),
    );
  }

  // 4) 한 단어씩 폴백
  if (raw.length < 6) {
    for (const q of queries) {
      if (raw.length >= 12) break;
      raw = await mergeRaw(
        raw,
        runJobs([{ base: FEED.en, q, n: 10, tag: `word/${q.slice(0, 20)}` }]),
      );
    }
  }

  // 5) 최후 — 그래도 비면 넓은 영문 주제
  if (raw.length === 0) {
    const resorts = [
      topic,
      ...queries.slice(0, 3),
      "Middle East conflict",
      "Ukraine Russia war",
      "Red Sea shipping",
    ];
    for (const q of resorts) {
      raw = await mergeRaw(
        raw,
        runJobs([{ base: FEED.en, q, n: 12, tag: `last/${q.slice(0, 20)}` }]),
      );
      if (raw.length >= 6) break;
    }
  }

  raw = sortByPublishedDesc(raw).slice(0, 48);

  const resolved = await mapPool(raw, 10, async (item, index) => {
    const real =
      index < 24
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

  let balanced = balanceByTier(resolved, limit);

  // 제목 한글 번역 (실패 시 원문 유지)
  const originals = balanced.map((i) => i.title);
  const translated = await translateTitlesToKorean(originals).catch(() => originals);
  balanced = balanced.map((item, i) => ({
    ...item,
    titleOriginal: originals[i],
    title: translated[i]?.trim() || originals[i],
  }));

  return { query: topic, items: balanced };
}

type FeedJob = { base: string; q: string; n: number; tag: string };

async function runJobs(
  jobs: FeedJob[],
): Promise<Omit<GoogleNewsItem, "url">[]> {
  if (!jobs.length) return [];
  const batches = await Promise.all(
    jobs.map(({ base, q, n, tag }) =>
      fetchOneFeedRaw(base, q, n).catch((err) => {
        console.warn(`[google-news] ${tag}`, err);
        return [] as Omit<GoogleNewsItem, "url">[];
      }),
    ),
  );
  return batches.flat();
}

async function mergeRaw(
  prev: Omit<GoogleNewsItem, "url">[],
  next: Promise<Omit<GoogleNewsItem, "url">[]> | Omit<GoogleNewsItem, "url">[],
): Promise<Omit<GoogleNewsItem, "url">[]> {
  const added = await next;
  return dedupeRaw([...prev, ...added]);
}

/** 티어 균형. 비면 TX로라도 채움 → 빈 목록 최소화 */
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

  for (const t of Object.keys(buckets) as MediaTier[]) {
    buckets[t] = sortByPublishedDesc(buckets[t]);
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
  // TX로 나머지 전부 채움 (빈 결과 방지)
  if (out.length < limit) {
    take(buckets.TX, limit - out.length);
  }
  // 그래도 부족하면 티어 무시하고 전체에서
  if (out.length < Math.min(6, limit)) {
    take(sortByPublishedDesc(items), limit - out.length);
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
  const workers = Array.from(
    { length: Math.min(concurrency, items.length || 1) },
    async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    },
  );
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
        "Mozilla/5.0 (compatible; news-context/0.5; +https://localhost)",
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
    const timer = setTimeout(() => controller.abort(), 2500);
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
