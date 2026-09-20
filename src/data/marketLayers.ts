/** 카드(사안)별 맞닿는 자산 → FRED 시계열. 눈으로 움직임 확인용. 투자 조언 아님. */

export type MarketInstrument = {
  /** FRED series_id */
  symbol: string;
  label: string;
  /** 이 사안과 왜 맞닿는지 */
  why: string;
  kind: "index" | "bond" | "fx" | "commodity" | "rate";
  unit?: string;
  digits?: number;
};

export type CardMarketLayer = {
  cardId: string;
  title: string;
  blurb: string;
  instruments: MarketInstrument[];
};

/** 전역 배경 온도계 */
export const GLOBAL_INDICATORS: MarketInstrument[] = [
  {
    symbol: "DGS10",
    label: "미국 국채 10년",
    why: "세계 금리 분위기.",
    kind: "bond",
    unit: "%",
    digits: 2,
  },
  {
    symbol: "VIXCLS",
    label: "VIX (공포지수)",
    why: "시장 긴장도.",
    kind: "index",
    digits: 2,
  },
  {
    symbol: "DEXKOUS",
    label: "원·달러",
    why: "한국 환율.",
    kind: "fx",
    unit: "원/$",
    digits: 2,
  },
];

export const CARD_MARKET_LAYERS: CardMarketLayer[] = [
  {
    cardId: "c1",
    title: "이 사안과 맞닿는 자산",
    blurb: "드론·무기 네트워크 뉴스가 나오면 긴장·유가·금리가 흔들릴 수 있어요.",
    instruments: [
      {
        symbol: "VIXCLS",
        label: "VIX",
        why: "지정학 긴장이 불안 지수로 번지는지.",
        kind: "index",
        digits: 2,
      },
      {
        symbol: "DCOILWTICO",
        label: "WTI 원유",
        why: "분쟁·제재 뉴스와 자주 같이 움직임.",
        kind: "commodity",
        unit: "$/bbl",
        digits: 2,
      },
      {
        symbol: "DGS10",
        label: "미 국채 10년",
        why: "위험 자산 ↔ 안전자산 분위기.",
        kind: "bond",
        unit: "%",
        digits: 2,
      },
    ],
  },
  {
    cardId: "c2",
    title: "이 사안과 맞닿는 자산",
    blurb: "카스피해·INSTC 교역망은 환율·달러·단기금리 흐름과 같이 봐요.",
    instruments: [
      {
        symbol: "DEXKOUS",
        label: "원·달러",
        why: "한국 교역·수입 비용 쪽.",
        kind: "fx",
        unit: "원/$",
        digits: 2,
      },
      {
        symbol: "DTWEXBGS",
        label: "달러 지수",
        why: "달러가 세면 교역·원자재 이야기가 달라짐.",
        kind: "index",
        digits: 2,
      },
      {
        symbol: "DGS2",
        label: "미 국채 2년",
        why: "단기 자금·금리 기대.",
        kind: "bond",
        unit: "%",
        digits: 2,
      },
    ],
  },
  {
    cardId: "c3",
    title: "이 사안과 맞닿는 자산",
    blurb: "러우전·중동전이 이어지면 에너지 가격이 먼저 움직일 수 있어요.",
    instruments: [
      {
        symbol: "DCOILWTICO",
        label: "WTI 원유",
        why: "미국 기준 유가.",
        kind: "commodity",
        unit: "$/bbl",
        digits: 2,
      },
      {
        symbol: "DCOILBRENTEU",
        label: "브렌트 원유",
        why: "유럽·중동 쪽 기준 유가.",
        kind: "commodity",
        unit: "$/bbl",
        digits: 2,
      },
      {
        symbol: "DHHNGSP",
        label: "헨리허브 가스",
        why: "천연가스 가격.",
        kind: "commodity",
        unit: "$/MMBtu",
        digits: 2,
      },
    ],
  },
  {
    cardId: "c4",
    title: "이 사안과 맞닿는 자산",
    blurb: "그림자 함대·제재 우회 해운은 유가·달러와 맞닿아 있어요.",
    instruments: [
      {
        symbol: "DCOILWTICO",
        label: "WTI 원유",
        why: "제재 원유·운송 뉴스 옆.",
        kind: "commodity",
        unit: "$/bbl",
        digits: 2,
      },
      {
        symbol: "DCOILBRENTEU",
        label: "브렌트 원유",
        why: "해상 원유 거래 기준.",
        kind: "commodity",
        unit: "$/bbl",
        digits: 2,
      },
      {
        symbol: "DTWEXBGS",
        label: "달러 지수",
        why: "달러 강도가 원자재 달러 가격에 영향.",
        kind: "index",
        digits: 2,
      },
    ],
  },
  {
    cardId: "c5",
    title: "이 사안과 맞닿는 자산",
    blurb: "호르무즈·바브엘만데브가 흔들리면 유가·금리가 먼저 보일 수 있어요.",
    instruments: [
      {
        symbol: "DCOILWTICO",
        label: "WTI 원유",
        why: "해협 리스크 → 유가.",
        kind: "commodity",
        unit: "$/bbl",
        digits: 2,
      },
      {
        symbol: "DCOILBRENTEU",
        label: "브렌트 원유",
        why: "중동 공급 이슈와 자주 같이.",
        kind: "commodity",
        unit: "$/bbl",
        digits: 2,
      },
      {
        symbol: "DGS10",
        label: "미 국채 10년",
        why: "공급 충격이 금리 기대로 번지는지.",
        kind: "bond",
        unit: "%",
        digits: 2,
      },
    ],
  },
  {
    cardId: "c6",
    title: "이 사안과 맞닿는 자산",
    blurb: "북극·그린란드·희토류는 가스·산업금속 가격 움직임으로 가늠해요.",
    instruments: [
      {
        symbol: "DHHNGSP",
        label: "헨리허브 가스",
        why: "LNG·가스 쪽.",
        kind: "commodity",
        unit: "$/MMBtu",
        digits: 2,
      },
      {
        symbol: "PCOPPUSDM",
        label: "구리",
        why: "산업·전기·공급망 온도계.",
        kind: "commodity",
        unit: "$/mt",
        digits: 0,
      },
      {
        symbol: "PALUMUSDM",
        label: "알루미늄",
        why: "산업금속·소재 공급망 참고.",
        kind: "commodity",
        unit: "$/mt",
        digits: 0,
      },
    ],
  },
  {
    cardId: "c7",
    title: "이 사안과 맞닿는 자산",
    blurb: "북러 협력·한반도 뉴스는 원화·공포지수·금리와 같이 봐요.",
    instruments: [
      {
        symbol: "DEXKOUS",
        label: "원·달러",
        why: "한반도 긴장이 환율에 닿는지.",
        kind: "fx",
        unit: "원/$",
        digits: 2,
      },
      {
        symbol: "VIXCLS",
        label: "VIX",
        why: "글로벌 위험 회피.",
        kind: "index",
        digits: 2,
      },
      {
        symbol: "DGS10",
        label: "미 국채 10년",
        why: "안전자산으로 돈이 몰리는지.",
        kind: "bond",
        unit: "%",
        digits: 2,
      },
    ],
  },
];

export function getMarketLayerForCard(cardId: string | null | undefined) {
  if (!cardId) return null;
  return CARD_MARKET_LAYERS.find((l) => l.cardId === cardId) ?? null;
}

export const CARD_COUNTRIES: Record<string, string[]> = {
  c1: ["Russia", "Iran", "North Korea"],
  c2: [
    "Russia",
    "Iran",
    "Kazakhstan",
    "Azerbaijan",
    "Turkmenistan",
    "Belarus",
  ],
  c3: ["Ukraine", "Iran", "Russia", "United States of America", "Israel"],
  c4: ["Russia", "Iran", "Venezuela", "China"],
  c5: ["Iran", "Saudi Arabia", "Yemen", "United Arab Emirates", "Oman"],
  c6: ["Greenland", "Russia", "China", "United States of America", "Denmark"],
  c7: ["North Korea", "Russia", "Iran", "Georgia"],
};
