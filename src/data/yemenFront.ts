import type { ConfirmationTag } from "@/types";

/** 표시용 단순화 폴리곤. 전선은 변동 — 확정 국경 아님. */
export type YemenZoneFeat = {
  type: "Feature";
  properties: {
    name: string;
    side: "houthi" | "gov";
    stage: number;
  };
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  __yemen?: true;
  __side?: "houthi" | "gov";
  __stage?: number;
};

/** ring: [lng, lat][] 닫힌 고리 */
function poly(
  name: string,
  side: "houthi" | "gov",
  stage: number,
  ring: [number, number][],
): YemenZoneFeat {
  const closed = [...ring];
  if (
    closed[0][0] !== closed[closed.length - 1][0] ||
    closed[0][1] !== closed[closed.length - 1][1]
  ) {
    closed.push(closed[0]);
  }
  return {
    type: "Feature",
    properties: { name, side, stage },
    geometry: { type: "Polygon", coordinates: [closed] },
    __yemen: true,
    __side: side,
    __stage: stage,
  };
}

/**
 * 후티 홍해 연안 확장 단계 (북→남).
 * stage 0부터 누적 표시하며 애니메이션.
 */
export const HOUTHI_EXPAND_STAGES: YemenZoneFeat[] = [
  // 0: 호데이다 일대 (장기 장악권)
  poly("호데이다 연안", "houthi", 0, [
    [42.7, 15.6],
    [43.35, 15.6],
    [43.4, 14.55],
    [42.85, 14.55],
  ]),
  // 1: 남하 — 타이즈 서부·해안
  poly("타이즈 서부 해안", "houthi", 1, [
    [42.85, 14.55],
    [43.45, 14.55],
    [43.5, 13.55],
    [42.95, 13.55],
  ]),
  // 2: 모카항 장악
  poly("모카항 일대", "houthi", 2, [
    [42.95, 13.55],
    [43.55, 13.55],
    [43.55, 12.95],
    [42.95, 12.95],
  ]),
  // 3: 바브엘만데브·페림 접근
  poly("바브엘만데브 접근", "houthi", 3, [
    [42.95, 12.95],
    [43.65, 12.95],
    [43.7, 12.35],
    [43.15, 12.35],
  ]),
  // 4: 페림·하니시 섬 세력권 (해상)
  poly("페림·하니시 세력권", "houthi", 4, [
    [43.15, 12.85],
    [43.95, 12.85],
    [43.95, 12.35],
    [43.15, 12.35],
  ]),
];

/** 정부군 연속 승리·반격이 보도된 내륙·산악 (표시용) */
export const GOV_ADVANCE_ZONES: YemenZoneFeat[] = [
  poly("타이즈 동부 반격", "gov", 0, [
    [43.85, 13.7],
    [44.35, 13.7],
    [44.35, 13.25],
    [43.85, 13.25],
  ]),
  poly("마리브 전선", "gov", 1, [
    [45.0, 15.7],
    [45.55, 15.7],
    [45.55, 15.25],
    [45.0, 15.25],
  ]),
  poly("자우프 진격", "gov", 2, [
    [44.6, 16.4],
    [45.2, 16.4],
    [45.2, 15.95],
    [44.6, 15.95],
  ]),
];

export const YEMEN_FRONT_LABELS: {
  lat: number;
  lng: number;
  text: string;
  kind: "houthi" | "gov" | "strike";
}[] = [
  { lat: 14.8, lng: 42.95, text: "후티 연안 확장", kind: "houthi" },
  { lat: 13.32, lng: 43.25, text: "모카항", kind: "houthi" },
  { lat: 12.65, lng: 43.4, text: "페림섬", kind: "houthi" },
  { lat: 12.6, lng: 43.3, text: "바브엘만데브", kind: "houthi" },
  { lat: 13.45, lng: 44.1, text: "정부군 반격", kind: "gov" },
  { lat: 15.45, lng: 45.3, text: "마리브", kind: "gov" },
  { lat: 16.15, lng: 44.9, text: "자우프", kind: "gov" },
];

/** 사우디·정부 공습이 보도된 지점 [lng, lat] */
export type YemenStrike = {
  id: string;
  label: string;
  at: [number, number];
  tag: ConfirmationTag;
  from?: [number, number];
};

export const SAUDI_YEMEN_STRIKES: YemenStrike[] = [
  {
    id: "strike-taiz-east",
    label: "타이즈 동부 공습",
    at: [44.15, 13.55],
    tag: "보도",
    from: [44.8, 18.2],
  },
  {
    id: "strike-hodeidah",
    label: "호데이다 일대 타격",
    at: [43.0, 14.8],
    tag: "보도",
    from: [42.5, 18.0],
  },
  {
    id: "strike-mocha-road",
    label: "모카 접근로 타격",
    at: [43.4, 13.4],
    tag: "보도",
    from: [44.8, 18.2],
  },
  {
    id: "strike-kahbub",
    label: "카흐부브 전선 공습",
    at: [43.5, 12.75],
    tag: "당사자 주장",
    from: [44.8, 18.2],
  },
];

export const YEMEN_EXPAND_STAGE_COUNT = HOUTHI_EXPAND_STAGES.length;
export const YEMEN_GOV_STAGE_COUNT = GOV_ADVANCE_ZONES.length;
