import type { ConfirmationTag, EvidenceGrade } from "@/types";

/** 매체 티어 T1~T4 (PRD 11장) — 사람이 알아볼 배지용 */
export type MediaTier = "T1" | "T2" | "T3" | "T4" | "TX";

/** 교차검증 확인 상태 */
export type ConfirmStatus = "확인됨" | "전달됨" | "미확인" | "반박됨" | "추정";

export const MEDIA_TIER_META: Record<
  MediaTier,
  { label: string; short: string; color: string; tip: string }
> = {
  T1: {
    label: "T1 · 신뢰 매체",
    short: "T1",
    color: "#1b8a4a",
    tip: "편집·정정 체계가 탄탄한 편. 그래도 기사마다 다를 수 있어요.",
  },
  T2: {
    label: "T2 · 성향 주의",
    short: "T2",
    color: "#2f6fed",
    tip: "사실 보도는 되지만 프레이밍이 한쪽으로 기울 수 있어요.",
  },
  T3: {
    label: "T3 · 영향 가능",
    short: "T3",
    color: "#d4891a",
    tip: "국가·자본 영향이나 데스크가 약한 편. 미확인으로 시작해요.",
  },
  T4: {
    label: "T4 · 관영·준관영",
    short: "T4",
    color: "#c62828",
    tip: "국가가 편집에 개입하는 매체. 당사자 주장 신호로만 봐요.",
  },
  TX: {
    label: "TX · 티어 미정",
    short: "TX",
    color: "#7a6548",
    tip: "아직 목록에 없는 출처예요. 이름으로만 참고하세요.",
  },
};

export const CONFIRM_STATUS_META: Record<
  ConfirmStatus,
  { label: string; color: string; tip: string }
> = {
  확인됨: {
    label: "확인됨",
    color: "#1b8a4a",
    tip: "독립 출처가 여러 곳이거나, 공식으로 맞춰진 편이에요.",
  },
  전달됨: {
    label: "전달됨",
    color: "#2f6fed",
    tip: "다른 곳 말을 옮긴 수준. 인용만으로는 확인이 아니에요.",
  },
  미확인: {
    label: "미확인",
    color: "#d4891a",
    tip: "아직 교차로 굳지 않았어요. 단정하지 마세요.",
  },
  반박됨: {
    label: "반박됨",
    color: "#c62828",
    tip: "다른 신뢰 출처가 부인하거나 다른 사실을 말해요.",
  },
  추정: {
    label: "추정",
    color: "#8e24aa",
    tip: "위성·추산·분석 수준. 숫자·단정에 특히 조심해요.",
  },
};

export const GRADE_META: Record<
  EvidenceGrade,
  { label: string; tip: string }
> = {
  A: { label: "A · 원문 확인", tip: "공식 문서 원문을 직접 본 수준" },
  B: { label: "B · 복수 일치", tip: "독립 주요 매체가 같이 말하거나 같은 성명" },
  C: { label: "C · 소수 보도", tip: "주요 매체 1~2곳" },
  D: { label: "D · 2차·분석", tip: "2차·집계·분석 사이트 위주" },
  X: { label: "X · 못 찾음/충돌", tip: "못 찾았거나 출처끼리 엇갈림" },
};

/** 고리 확인 태그 → 교차검증 상태 */
export function tagToConfirmStatus(tag: ConfirmationTag): ConfirmStatus {
  switch (tag) {
    case "확립":
      return "확인됨";
    case "보도":
      return "전달됨";
    case "당사자 주장":
      return "미확인";
    case "추정":
    case "분석":
    case "정황":
      return "추정";
    default:
      return "미확인";
  }
}

/**
 * 4티어 매체 카탈로그 (PRD 11장).
 * T4는 권위주의·관영까지 포함한다. 티어는 올리거나 내리지 않는다.
 */
export type MediaOutlet = {
  id: string;
  label: string;
  tier: Exclude<MediaTier, "TX">;
  /** Google News site: 검색용 */
  domains: string[];
  /** 매체명 매칭용 (소문자) */
  aliases: string[];
};

export const MEDIA_OUTLETS: MediaOutlet[] = [
  // —— T1 ——
  {
    id: "reuters",
    label: "Reuters",
    tier: "T1",
    domains: ["reuters.com"],
    aliases: ["reuters", "로이터"],
  },
  {
    id: "ap",
    label: "AP",
    tier: "T1",
    domains: ["apnews.com", "ap.org"],
    aliases: ["associated press", "ap news", "ap"],
  },
  {
    id: "bbc",
    label: "BBC",
    tier: "T1",
    domains: ["bbc.com", "bbc.co.uk"],
    aliases: ["bbc"],
  },
  {
    id: "nyt",
    label: "NYT",
    tier: "T1",
    domains: ["nytimes.com"],
    aliases: ["new york times", "nytimes", "nyt"],
  },
  {
    id: "wapo",
    label: "Washington Post",
    tier: "T1",
    domains: ["washingtonpost.com"],
    aliases: ["washington post", "wapo"],
  },
  {
    id: "wsj",
    label: "WSJ",
    tier: "T1",
    domains: ["wsj.com"],
    aliases: ["wall street journal", "wsj"],
  },
  {
    id: "ft",
    label: "FT",
    tier: "T1",
    domains: ["ft.com"],
    aliases: ["financial times", "ft"],
  },
  {
    id: "afp",
    label: "AFP",
    tier: "T1",
    domains: ["afp.com", "france24.com"],
    aliases: ["afp", "agence france", "france 24"],
  },
  {
    id: "nhk",
    label: "NHK",
    tier: "T1",
    domains: ["nhk.or.jp"],
    aliases: ["nhk"],
  },
  // —— T2 ——
  {
    id: "cnn",
    label: "CNN",
    tier: "T2",
    domains: ["cnn.com"],
    aliases: ["cnn"],
  },
  {
    id: "nbc",
    label: "NBC",
    tier: "T2",
    domains: ["nbcnews.com"],
    aliases: ["nbc"],
  },
  {
    id: "bloomberg",
    label: "Bloomberg",
    tier: "T2",
    domains: ["bloomberg.com"],
    aliases: ["bloomberg", "블룸버그"],
  },
  {
    id: "guardian",
    label: "The Guardian",
    tier: "T2",
    domains: ["theguardian.com"],
    aliases: ["guardian", "가디언"],
  },
  {
    id: "aljazeera",
    label: "Al Jazeera",
    tier: "T2",
    domains: ["aljazeera.com"],
    aliases: ["al jazeera", "알자지라"],
  },
  {
    id: "yonhap",
    label: "연합뉴스",
    tier: "T2",
    domains: ["yna.co.kr", "yonhapnews.co.kr"],
    aliases: ["yonhap", "연합뉴스"],
  },
  {
    id: "hani",
    label: "한겨레",
    tier: "T2",
    domains: ["hani.co.kr"],
    aliases: ["hankyoreh", "한겨레"],
  },
  {
    id: "chosun",
    label: "조선일보",
    tier: "T2",
    domains: ["chosun.com"],
    aliases: ["chosun", "조선일보", "조선"],
  },
  {
    id: "joongang",
    label: "중앙일보",
    tier: "T2",
    domains: ["joins.com", "joongang.co.kr"],
    aliases: ["joongang", "중앙일보", "중앙"],
  },
  {
    id: "donga",
    label: "동아일보",
    tier: "T2",
    domains: ["donga.com"],
    aliases: ["donga", "동아일보", "동아"],
  },
  {
    id: "rferl",
    label: "RFE/RL",
    tier: "T2",
    domains: ["rferl.org"],
    aliases: ["rferl", "radio free europe", "radio free"],
  },
  {
    id: "asahi",
    label: "Asahi",
    tier: "T2",
    domains: ["asahi.com"],
    aliases: ["asahi", "아사히"],
  },
  {
    id: "abc",
    label: "ABC News",
    tier: "T2",
    domains: ["abcnews.go.com"],
    aliases: ["abc news"],
  },
  {
    id: "cbs",
    label: "CBS News",
    tier: "T2",
    domains: ["cbsnews.com"],
    aliases: ["cbs news", "cbs"],
  },
  // —— T3 ——
  {
    id: "scmp",
    label: "SCMP",
    tier: "T3",
    domains: ["scmp.com"],
    aliases: ["south china morning", "scmp"],
  },
  {
    id: "diplomat",
    label: "The Diplomat",
    tier: "T3",
    domains: ["thediplomat.com"],
    aliases: ["the diplomat", "diplomat"],
  },
  {
    id: "newsweek",
    label: "Newsweek",
    tier: "T3",
    domains: ["newsweek.com"],
    aliases: ["newsweek"],
  },
  {
    id: "upi",
    label: "UPI",
    tier: "T3",
    domains: ["upi.com"],
    aliases: ["upi"],
  },
  {
    id: "cnbc",
    label: "CNBC",
    tier: "T3",
    domains: ["cnbc.com"],
    aliases: ["cnbc"],
  },
  {
    id: "fox",
    label: "Fox News",
    tier: "T3",
    domains: ["foxnews.com"],
    aliases: ["fox news", "fox"],
  },
  {
    id: "cna",
    label: "CNA",
    tier: "T3",
    domains: ["channelnewsasia.com"],
    aliases: ["channel news asia", "cna"],
  },
  {
    id: "arabnews",
    label: "Arab News",
    tier: "T3",
    domains: ["arabnews.com"],
    aliases: ["arab news"],
  },
  {
    id: "kyodo",
    label: "Kyodo",
    tier: "T3",
    domains: ["kyodonews.net"],
    aliases: ["kyodo", "교도"],
  },
  {
    id: "nknews",
    label: "NK News",
    tier: "T3",
    domains: ["nknews.org"],
    aliases: ["nk news", "nknews"],
  },
  // —— T4 관영·준관영 (권위주의 포함) ——
  {
    id: "xinhua",
    label: "Xinhua",
    tier: "T4",
    domains: ["xinhuanet.com", "news.cn"],
    aliases: ["xinhua", "신화사", "신화"],
  },
  {
    id: "globaltimes",
    label: "Global Times",
    tier: "T4",
    domains: ["globaltimes.cn"],
    aliases: ["global times", "환구시보", "환구"],
  },
  {
    id: "people",
    label: "People's Daily",
    tier: "T4",
    domains: ["people.cn", "people.com.cn"],
    aliases: ["people's daily", "인민일보"],
  },
  {
    id: "cctv",
    label: "CGTN/CCTV",
    tier: "T4",
    domains: ["cgtn.com", "cctv.com"],
    aliases: ["cgtn", "cctv"],
  },
  {
    id: "tass",
    label: "TASS",
    tier: "T4",
    domains: ["tass.com", "tass.ru"],
    aliases: ["tass", "타스"],
  },
  {
    id: "ria",
    label: "RIA Novosti",
    tier: "T4",
    domains: ["ria.ru"],
    aliases: ["ria novosti", "ria", "리아노보스티"],
  },
  {
    id: "rt",
    label: "RT",
    tier: "T4",
    domains: ["rt.com"],
    aliases: ["rt ", " russia today", "russia today"],
  },
  {
    id: "sputnik",
    label: "Sputnik",
    tier: "T4",
    domains: ["sputniknews.com", "sputnikglobe.com"],
    aliases: ["sputnik", "스푸트니크"],
  },
  {
    id: "kcna",
    label: "KCNA",
    tier: "T4",
    domains: ["kcna.kp", "kcna.co.jp"],
    aliases: ["kcna", "조선중앙통신", "조선중앙"],
  },
  {
    id: "rodong",
    label: "Rodong Sinmun",
    tier: "T4",
    domains: ["rodong.rep.kp"],
    aliases: ["rodong", "로동신문"],
  },
  {
    id: "irna",
    label: "IRNA",
    tier: "T4",
    domains: ["irna.ir"],
    aliases: ["irna"],
  },
  {
    id: "presstv",
    label: "Press TV",
    tier: "T4",
    domains: ["presstv.ir", "presstv.com"],
    aliases: ["press tv", "presstv"],
  },
  {
    id: "fars",
    label: "Fars News",
    tier: "T4",
    domains: ["farsnews.ir"],
    aliases: ["fars news", "fars"],
  },
  {
    id: "mehr",
    label: "Mehr News",
    tier: "T4",
    domains: ["mehrnews.com"],
    aliases: ["mehr news", "mehr"],
  },
  {
    id: "sana",
    label: "SANA",
    tier: "T4",
    domains: ["sana.sy"],
    aliases: ["sana"],
  },
];

const DOMAIN_TO_TIER = new Map<string, Exclude<MediaTier, "TX">>();
const ALIAS_ENTRIES: { alias: string; tier: Exclude<MediaTier, "TX"> }[] = [];

for (const o of MEDIA_OUTLETS) {
  for (const d of o.domains) {
    DOMAIN_TO_TIER.set(d.toLowerCase(), o.tier);
  }
  for (const a of o.aliases) {
    ALIAS_ENTRIES.push({ alias: a.toLowerCase(), tier: o.tier });
  }
}
// 긴 alias 우선 (ap vs associated press)
ALIAS_ENTRIES.sort((a, b) => b.alias.length - a.alias.length);

export function outletsByTier(
  tier: Exclude<MediaTier, "TX">,
): MediaOutlet[] {
  return MEDIA_OUTLETS.filter((o) => o.tier === tier);
}

export function hostFromUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return host || null;
  } catch {
    return null;
  }
}

function tierFromHost(host: string | null): MediaTier | null {
  if (!host) return null;
  if (DOMAIN_TO_TIER.has(host)) return DOMAIN_TO_TIER.get(host)!;
  for (const [domain, tier] of DOMAIN_TO_TIER) {
    if (host === domain || host.endsWith(`.${domain}`)) return tier;
  }
  return null;
}

/**
 * 티어 판정은 철저하게.
 * 1) URL 도메인 2) 매체명 alias. T4는 절대 T1/T2로 올리지 않는다.
 */
export function classifyMediaTier(
  sourceName: string,
  url?: string | null,
): MediaTier {
  const fromUrl = tierFromHost(hostFromUrl(url));
  if (fromUrl) return fromUrl;

  const s = ` ${sourceName.toLowerCase()} `;
  for (const { alias, tier } of ALIAS_ENTRIES) {
    if (alias === "ap") {
      if (/\bap\b/.test(s) || s.includes(" associated press ")) return tier;
      continue;
    }
    if (alias === "ft") {
      if (/\bft\b/.test(s) || s.includes(" financial times ")) return tier;
      continue;
    }
    if (alias === "rt ") {
      if (/\brt\b/.test(s) || s.includes(" russia today ")) return tier;
      continue;
    }
    if (s.includes(alias)) return tier;
  }
  return "TX";
}

/** site: 검색용 — 티어별 도메인 묶음 */
export function siteQueryChunks(
  tier: Exclude<MediaTier, "TX">,
  chunkSize = 5,
): string[] {
  const domains = outletsByTier(tier).flatMap((o) => o.domains);
  const chunks: string[] = [];
  for (let i = 0; i < domains.length; i += chunkSize) {
    const slice = domains.slice(i, i + chunkSize);
    const or = slice.map((d) => `site:${d}`).join(" OR ");
    chunks.push(`(${or})`);
  }
  return chunks;
}

/** 인텔 모드 알록달록 팔레트 */
export function intelTagColor(
  tag: ConfirmationTag | "focus",
  active: boolean,
): string {
  const a = active ? 1 : 0.35;
  switch (tag) {
    case "확립":
      return `rgba(0, 200, 120, ${a})`;
    case "보도":
      return `rgba(41, 121, 255, ${a})`;
    case "당사자 주장":
      return `rgba(255, 109, 0, ${a})`;
    case "추정":
      return `rgba(224, 64, 251, ${a})`;
    case "분석":
      return `rgba(0, 188, 212, ${a})`;
    case "정황":
      return `rgba(255, 214, 0, ${a})`;
    case "focus":
      return `rgba(255, 64, 129, ${0.75 * a})`;
    default:
      return `rgba(158, 158, 158, ${a})`;
  }
}

export function intelCountryColors(active: boolean): {
  cap: string;
  side: string;
  stroke: string;
} {
  if (active) {
    return {
      cap: "rgba(220, 28, 28, 0.48)",
      side: "rgba(140, 8, 8, 0.62)",
      stroke: "rgba(255, 70, 55, 0.92)",
    };
  }
  return {
    cap: "rgba(8, 12, 18, 0.92)",
    side: "rgba(4, 6, 10, 0.7)",
    stroke: "rgba(40, 55, 70, 0.35)",
  };
}
