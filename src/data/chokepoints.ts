/** 호르무즈·바브엘만데브 — 해협 막힘 신호 (중앙 네온 + 양측 상선) + 아라비아해 미 항모 */

export type ChokepointMarker = {
  lat: number;
  lng: number;
  text: string;
  kind: "block" | "ship" | "carrier";
};

export type ChokepointZone = {
  id: string;
  name: string;
  /** 카메라 힌트 */
  camera: { lat: number; lng: number; altitude: number };
  markers: ChokepointMarker[];
};

/** 호르무즈 해협 중앙 + 페르시아만 쪽 / 오만만 쪽 상선 */
export const HORMUZ_CHOKE: ChokepointZone = {
  id: "hormuz",
  name: "호르무즈",
  camera: { lat: 26.55, lng: 56.35, altitude: 0.85 },
  markers: [
    {
      lat: 26.56,
      lng: 56.25,
      text: "호르무즈 통행 급감",
      kind: "block",
    },
    {
      lat: 26.95,
      lng: 55.35,
      text: "상선 (만 안쪽)",
      kind: "ship",
    },
    {
      lat: 25.55,
      lng: 57.55,
      text: "상선 (오만만)",
      kind: "ship",
    },
  ],
};

/** 바브엘만데브 / 홍해 남단 중앙 + 홍해 쪽 / 아덴만 쪽 상선 */
export const BAB_EL_MANDEB_CHOKE: ChokepointZone = {
  id: "bab-el-mandeb",
  name: "바브엘만데브",
  camera: { lat: 12.6, lng: 43.4, altitude: 0.8 },
  markers: [
    {
      lat: 12.58,
      lng: 43.33,
      text: "바브엘만데브 조임",
      kind: "block",
    },
    {
      lat: 13.55,
      lng: 42.55,
      text: "상선 (홍해)",
      kind: "ship",
    },
    {
      lat: 11.95,
      lng: 44.65,
      text: "상선 (아덴만)",
      kind: "ship",
    },
  ],
};

/**
 * 아라비아해 미 항모 2척 (배치 대략치).
 * 정확한 함명·좌표는 공개 오픈소스에 따라 달라질 수 있어 씬에는 위치만 표시.
 */
export const ARABIAN_SEA_CARRIERS: ChokepointMarker[] = [
  {
    lat: 21.4,
    lng: 62.6,
    text: "미 항모 (북)",
    kind: "carrier",
  },
  {
    lat: 18.9,
    lng: 65.1,
    text: "미 항모 (남)",
    kind: "carrier",
  },
];

export const CHOKEPOINT_ZONES: ChokepointZone[] = [
  HORMUZ_CHOKE,
  BAB_EL_MANDEB_CHOKE,
];

export function allChokepointMarkers(): ChokepointMarker[] {
  return [
    ...CHOKEPOINT_ZONES.flatMap((z) => z.markers),
    ...ARABIAN_SEA_CARRIERS,
  ];
}
