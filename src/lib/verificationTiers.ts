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

const T1 = [
  "reuters",
  "로이터",
  "ap ",
  "associated press",
  "bbc",
  "nyt",
  "new york times",
  "washington post",
  "wsj",
  "wall street",
  "ft ",
  "financial times",
  "afp",
  "nhk",
  "crs",
  "의회조사국",
  "msmt",
];
const T2 = [
  "cnn",
  "nbc",
  "abc",
  "cbs",
  "bloomberg",
  "guardian",
  "al jazeera",
  "알자지라",
  "연합뉴스",
  "yonhap",
  "hankyoreh",
  "한겨레",
  "chosun",
  "조선",
  "joongang",
  "중앙",
  "donga",
  "동아",
  "rferl",
  "radio free",
];
const T3 = [
  "scmp",
  "south china morning",
  "the diplomat",
  "newsweek",
  "upi",
  "cnbc",
  "fox",
];
const T4 = [
  "xinhua",
  "신화",
  "tass",
  "rt ",
  "sputnik",
  "kcna",
  "조선중앙",
  "irna",
  "press tv",
  "globaltimes",
  "환구",
];

export function classifyMediaTier(sourceName: string): MediaTier {
  const s = ` ${sourceName.toLowerCase()} `;
  if (T4.some((k) => s.includes(k))) return "T4";
  if (T1.some((k) => s.includes(k))) return "T1";
  if (T2.some((k) => s.includes(k))) return "T2";
  if (T3.some((k) => s.includes(k))) return "T3";
  return "TX";
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
      cap: "rgba(255, 64, 129, 0.85)",
      side: "rgba(124, 77, 255, 0.9)",
      stroke: "rgba(0, 229, 255, 0.95)",
    };
  }
  return {
    cap: "rgba(232, 214, 178, 0.75)",
    side: "rgba(160, 135, 95, 0.45)",
    stroke: "rgba(90, 65, 35, 0.45)",
  };
}
