import type { ConfirmationTag, GlobeLayer } from "@/types";
import occupiedUkraine from "./occupiedUkraine.json";
import { SAUDI_YEMEN_STRIKES } from "./yemenFront";

/** 보도·확인된 타격/전장 좌표. at = [lng, lat] */
export type WarSite = {
  id: string;
  label: string;
  /** [lng, lat] */
  at: [number, number];
  tag: ConfirmationTag;
  side:
    | "ru_on_ua"
    | "ua_on_ru"
    | "ua_on_occupied"
    | "ua_caspian"
    | "on_iran"
    | "other";
  note: string;
};

/** DeepState 기반 단순화 점령지역 (표시용, 전선은 변동) */
export const OCCUPIED_UKRAINE_FEATURE = occupiedUkraine as {
  type: "Feature";
  properties: Record<string, string>;
  geometry: { type: "MultiPolygon"; coordinates: number[][][][] };
};

export const OCCUPIED_LABELS: { lat: number; lng: number; text: string }[] = [
  { lat: 45.0, lng: 34.0, text: "점령 크림" },
  { lat: 47.05, lng: 37.55, text: "점령 마리우폴" },
  { lat: 48.0, lng: 37.8, text: "점령 도네츠크" },
  { lat: 48.57, lng: 39.31, text: "점령 루한스크" },
  { lat: 46.85, lng: 35.37, text: "점령 멜리토폴" },
  { lat: 47.5, lng: 34.6, text: "점령 에네르호다르" },
  { lat: 46.5, lng: 33.6, text: "점령 헤르손 좌안" },
];

/** 러시아→우크라이나: 반복 도시·인프라 타격이 보도된 지점 */
export const RU_ON_UA_SITES: WarSite[] = [
  {
    id: "kyiv",
    label: "키이우",
    at: [30.523, 50.45],
    tag: "확립",
    side: "ru_on_ua",
    note: "전력·주거 반복 타격 (BBC·Reuters 등)",
  },
  {
    id: "kharkiv",
    label: "하르키우",
    at: [36.231, 49.993],
    tag: "확립",
    side: "ru_on_ua",
    note: "에너지 시설 반복 피격 보도",
  },
  {
    id: "dnipro",
    label: "드니프로",
    at: [35.046, 48.464],
    tag: "확립",
    side: "ru_on_ua",
    note: "대규모 드론·미사일 공습 보도",
  },
  {
    id: "zaporizhzhia",
    label: "자포리자(시)",
    at: [35.14, 47.839],
    tag: "확립",
    side: "ru_on_ua",
    note: "시·전력망 타격. 시 자체는 우크 통제",
  },
  {
    id: "odesa",
    label: "오데사",
    at: [30.723, 46.482],
    tag: "보도",
    side: "ru_on_ua",
    note: "항만·에너지 타격 보도",
  },
  {
    id: "mykolaiv",
    label: "미콜라이우",
    at: [31.994, 46.975],
    tag: "보도",
    side: "ru_on_ua",
    note: "대규모 공습 대상 보도",
  },
  {
    id: "kremenchuk",
    label: "크레멘추크",
    at: [33.42, 49.068],
    tag: "보도",
    side: "ru_on_ua",
    note: "킨잘 등 에너지 타격 보도",
  },
  {
    id: "poltava",
    label: "폴타바",
    at: [34.551, 49.588],
    tag: "보도",
    side: "ru_on_ua",
    note: "가스·전력 타격 보도",
  },
  {
    id: "chernihiv",
    label: "체르니히우",
    at: [31.289, 51.498],
    tag: "보도",
    side: "ru_on_ua",
    note: "전력 시설 타격 보도",
  },
  {
    id: "pokrovsk",
    label: "포크로우스크 전선",
    at: [37.176, 48.282],
    tag: "보도",
    side: "ru_on_ua",
    note: "도네츠크 방면 주 격전지 (ISW 등)",
  },
];

/** 우크라이나→러시아 본토: 정유·드론공장 등 확인·반복 보도 지점 */
export const UA_ON_RU_SITES: WarSite[] = [
  {
    id: "ryazan",
    label: "랴잔 정유",
    at: [39.696, 54.629],
    tag: "확립",
    side: "ua_on_ru",
    note: "Rosneft 랴잔. 2025 다수 피격",
  },
  {
    id: "volgograd",
    label: "볼고그라드 정유",
    at: [44.517, 48.52],
    tag: "확립",
    side: "ua_on_ru",
    note: "Lukoil-Volgograd. 반복 타격",
  },
  {
    id: "saratov",
    label: "사라토프 정유",
    at: [45.998, 51.53],
    tag: "확립",
    side: "ua_on_ru",
    note: "가동 중단 보도 포함",
  },
  {
    id: "novokuibyshevsk",
    label: "노보쿠이비셰프스크",
    at: [49.947, 53.096],
    tag: "확립",
    side: "ua_on_ru",
    note: "사마라주 정유",
  },
  {
    id: "kuibyshev",
    label: "쿠이비셰프 정유",
    at: [50.15, 53.2],
    tag: "보도",
    side: "ua_on_ru",
    note: "사마라 시내 정유",
  },
  {
    id: "syzran",
    label: "시즈란 정유",
    at: [48.468, 53.158],
    tag: "확립",
    side: "ua_on_ru",
    note: "Volga 연안. 1차 처리 장치 피해 보도",
  },
  {
    id: "moscow-kapotnya",
    label: "모스크바 카포트냐 정유",
    at: [37.797, 55.637],
    tag: "보도",
    side: "ua_on_ru",
    note: "수도 정유. 2026-09 재타격 보도",
  },
  {
    id: "yelabuga",
    label: "옐라부가(알라부가)",
    at: [52.052, 55.788],
    tag: "확립",
    side: "ua_on_ru",
    note: "샤헤드/게란 생산. 2024-04·2025 타격",
  },
  {
    id: "nizhnekamsk",
    label: "니즈네캄스크 정유",
    at: [51.817, 55.637],
    tag: "보도",
    side: "ua_on_ru",
    note: "2024-04 옐라부가와 동시권 타격 보도",
  },
  {
    id: "tuapse",
    label: "투압세 정유",
    at: [39.08, 44.105],
    tag: "확립",
    side: "ua_on_ru",
    note: "흑해 연안. 가동 중단 보도",
  },
  {
    id: "afipsky",
    label: "아핍스키 정유",
    at: [38.8, 44.9],
    tag: "보도",
    side: "ua_on_ru",
    note: "크라스노다르 지방",
  },
  {
    id: "ilsky",
    label: "일스키 정유",
    at: [38.57, 44.85],
    tag: "보도",
    side: "ua_on_ru",
    note: "크라스노다르 지방",
  },
  {
    id: "ufa",
    label: "우파 Bashneft-Novoil",
    at: [56.012, 54.743],
    tag: "보도",
    side: "ua_on_ru",
    note: "바시코르토스탄",
  },
  {
    id: "salavat",
    label: "살라바트 정유",
    at: [55.925, 53.361],
    tag: "보도",
    side: "ua_on_ru",
    note: "Gazprom Neftekhim Salavat",
  },
  {
    id: "astrakhan-gpp",
    label: "아스트라한 가스처리",
    at: [48.05, 46.35],
    tag: "보도",
    side: "ua_on_ru",
    note: "가스 처리 시설 타격 보도",
  },
  {
    id: "kirishi",
    label: "키리시 정유",
    at: [32.02, 59.449],
    tag: "보도",
    side: "ua_on_ru",
    note: "레닌그라드주 Kirishinefteorgsintez",
  },
  {
    id: "yaroslavl",
    label: "야로슬라블 정유",
    at: [39.87, 57.63],
    tag: "보도",
    side: "ua_on_ru",
    note: "모스크바 북동 정유 인프라",
  },
];

/** 점령지(크림 등) 내 우크 타격 보도 */
export const UA_ON_OCCUPIED_SITES: WarSite[] = [
  {
    id: "feodosiia",
    label: "페오도시야 유류터미널",
    at: [35.379, 45.049],
    tag: "보도",
    side: "ua_on_occupied",
    note: "점령 크림. 유류 터미널 화재 보도",
  },
];

/** 2026-07 카스피해: 볼가 하구 인근(아스트라한 쪽) 이란 선박 등 */
export const CASPIAN_STRIKE: WarSite = {
  id: "caspian-volga-mouth",
  label: "카스피해·볼가 하구",
  at: [48.55, 45.85],
  tag: "보도",
  side: "ua_caspian",
  note: "이란 선박 Anna 등. 볼가 하구 ~5km 정박 중 피격(BBC·로이터)",
};

/**
 * 이란전 타격 지점 (미·이스라엘 작전 보도 권역).
 * 우크라이나 소행으로 읽히지 않게 — 별도 side.
 */
export const IRAN_STRIKE_SITES: WarSite[] = [
  {
    id: "natanz",
    label: "나타즈",
    at: [51.726, 33.725],
    tag: "확립",
    side: "on_iran",
    note: "우라늄 농축. 미·이스라엘 타격 보도(IAEA·AP 등)",
  },
  {
    id: "fordow",
    label: "포르도",
    at: [50.995, 34.885],
    tag: "확립",
    side: "on_iran",
    note: "지하 농축. 미 벙커버스터 타격 보도",
  },
  {
    id: "isfahan-nuclear",
    label: "이스파한 핵단지",
    at: [51.82, 32.58],
    tag: "확립",
    side: "on_iran",
    note: "변환·연료 시설. 미·이스라엘 타격 보도",
  },
  {
    id: "isfahan-hesa",
    label: "이스파한 HESA",
    at: [51.55, 32.85],
    tag: "보도",
    side: "on_iran",
    note: "샤헤드 관련 항공산업. 미·이스라엘 작전 보도",
  },
  {
    id: "tehran-military",
    label: "테헤란 일대 군사·지휘",
    at: [51.42, 35.72],
    tag: "보도",
    side: "on_iran",
    note: "수도 권역 타격·지휘부 관련 보도. 개별 시설 GPS는 공개 범위만",
  },
];

export function sitesToFireLayers(sites: WarSite[]): GlobeLayer[] {
  return sites.map((s) => ({
    type: "point" as const,
    label: s.label,
    tag: s.tag,
    at: s.at,
    marker: "fire" as const,
  }));
}

/** 카드/전역에 깔 전쟁 화염 지점 */
export function warFireSitesForCard(
  cardId: string | null | undefined,
): WarSite[] {
  const yemenAsWar: WarSite[] = SAUDI_YEMEN_STRIKES.map((s) => ({
    id: s.id,
    label: s.label,
    at: s.at,
    tag: s.tag,
    side: "other" as const,
    note: "예멘 전선 공습 보도 권역",
  }));

  if (!cardId) {
    return [
      ...RU_ON_UA_SITES,
      ...UA_ON_RU_SITES,
      ...UA_ON_OCCUPIED_SITES,
      CASPIAN_STRIKE,
      ...IRAN_STRIKE_SITES,
      ...yemenAsWar,
    ];
  }
  switch (cardId) {
    case "c1":
      return [
        ...UA_ON_RU_SITES.filter((s) => s.id === "yelabuga"),
        ...RU_ON_UA_SITES.filter((s) => s.id === "kyiv"),
        ...IRAN_STRIKE_SITES.filter((s) => s.id === "isfahan-hesa"),
      ];
    case "c3":
      return [
        ...RU_ON_UA_SITES,
        ...UA_ON_RU_SITES,
        ...UA_ON_OCCUPIED_SITES,
        CASPIAN_STRIKE,
        ...IRAN_STRIKE_SITES,
      ];
    case "c5":
    case "c8":
      return [...IRAN_STRIKE_SITES, ...yemenAsWar];
    default:
      return [];
  }
}

export const WAR_FIRE_CARD_IDS = new Set(["c1", "c3", "c5", "c8"]);
