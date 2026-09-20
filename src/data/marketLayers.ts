/** 카드별 시장 접점 → 토스 심볼 매핑 (주식·ETF·지표). 투자 조언 아님. */

export type MarketInstrument = {
  symbol: string;
  /** 사람에게 보이는 쉬운 이름 */
  label: string;
  /** 왜 이 카드를 보는지 한 줄 */
  why: string;
  kind: "stock" | "etf" | "index" | "bond" | "fx";
};

export type CardMarketLayer = {
  cardId: string;
  title: string;
  blurb: string;
  instruments: MarketInstrument[];
  /** 호가창을 열어볼 대표 심볼 */
  orderbookSymbol?: string;
};

/** 전역으로 항상 보여주는 지표 */
export const GLOBAL_INDICATORS: MarketInstrument[] = [
  {
    symbol: "KOSPI",
    label: "코스피",
    why: "한국 주식시장 전체의 기분 온도계예요.",
    kind: "index",
  },
  {
    symbol: "KOSDAQ",
    label: "코스닥",
    why: "작은·성장 기업 쪽 온도계예요.",
    kind: "index",
  },
  {
    symbol: "KR_BOND_10Y",
    label: "국채 10년",
    why: "금리 분위기. 숫자가 커지면 이자 부담이 커진다는 뜻에 가깝아요.",
    kind: "bond",
  },
];

export const CARD_MARKET_LAYERS: CardMarketLayer[] = [
  {
    cardId: "c1",
    title: "드론·방산 쪽 시세",
    blurb: "무기·드론 뉴스가 나오면 방산 관련 종목 분위기를 같이 봐요.",
    orderbookSymbol: "012450",
    instruments: [
      {
        symbol: "012450",
        label: "한화에어로스페이스",
        why: "방산·항공 쪽 대표 종목 중 하나예요.",
        kind: "stock",
      },
      {
        symbol: "LMT",
        label: "록히드마틴",
        why: "미국 방산 큰 회사예요.",
        kind: "stock",
      },
      {
        symbol: "RTX",
        label: "RTX",
        why: "미사일·항공 엔진 쪽 회사예요.",
        kind: "stock",
      },
    ],
  },
  {
    cardId: "c2",
    title: "물류·해운 쪽 시세",
    blurb: "카스피해·북남 회랑은 ‘물건이 어디로 지나가는지’ 이야기예요.",
    orderbookSymbol: "011200",
    instruments: [
      {
        symbol: "011200",
        label: "HMM",
        why: "한국 큰 해운 회사예요. 배 운임 분위기를 엿볼 때 봐요.",
        kind: "stock",
      },
      {
        symbol: "028260",
        label: "삼성물산",
        why: "건설·무역이 섞여 있어 교역 뉴스와 같이 보기도 해요.",
        kind: "stock",
      },
    ],
  },
  {
    cardId: "c3",
    title: "에너지·방산 시세",
    blurb: "두 전쟁이 이어지면 기름값·방산 쪽 관심이 같이 커질 수 있어요.",
    orderbookSymbol: "261220",
    instruments: [
      {
        symbol: "261220",
        label: "KODEX WTI원유선물",
        why: "원유 가격 분위기를 따라가는 ETF예요. (선물을 직접 사는 건 아니에요)",
        kind: "etf",
      },
      {
        symbol: "XLE",
        label: "에너지 ETF (XLE)",
        why: "석유·가스 회사들을 묶은 미국 ETF예요.",
        kind: "etf",
      },
      {
        symbol: "012450",
        label: "한화에어로스페이스",
        why: "방산 쪽 분위기 참고용이에요.",
        kind: "stock",
      },
    ],
  },
  {
    cardId: "c4",
    title: "원유·해운 시세",
    blurb: "그림자 함대 뉴스는 ‘제재 원유가 어떻게 움직이는지’와 맞닿아 있어요.",
    orderbookSymbol: "261220",
    instruments: [
      {
        symbol: "261220",
        label: "KODEX WTI원유선물",
        why: "원유 가격 분위기를 보는 창구예요.",
        kind: "etf",
      },
      {
        symbol: "USO",
        label: "원유 ETF (USO)",
        why: "미국 쪽에서 보는 원유 관련 ETF예요.",
        kind: "etf",
      },
      {
        symbol: "011200",
        label: "HMM",
        why: "배 운임·해운 분위기 참고용이에요.",
        kind: "stock",
      },
    ],
  },
  {
    cardId: "c5",
    title: "호르무즈·유가 시세",
    blurb: "해협이 막히면 기름값·운임이 먼저 흔들릴 수 있어요. 단정은 금지!",
    orderbookSymbol: "261220",
    instruments: [
      {
        symbol: "261220",
        label: "KODEX WTI원유선물",
        why: "유가 분위기를 가장 직관적으로 봐요.",
        kind: "etf",
      },
      {
        symbol: "XLE",
        label: "에너지 ETF (XLE)",
        why: "에너지 회사들 묶음이에요.",
        kind: "etf",
      },
      {
        symbol: "011200",
        label: "HMM",
        why: "배가 우회하면 운임 이야기가 나와요.",
        kind: "stock",
      },
    ],
  },
  {
    cardId: "c6",
    title: "희토류·LNG 시세",
    blurb: "북극·그린란드·희토류는 ‘재료와 에너지 길’ 이야기예요.",
    orderbookSymbol: "MP",
    instruments: [
      {
        symbol: "MP",
        label: "MP Materials",
        why: "희토류 채굴 쪽 미국 회사예요.",
        kind: "stock",
      },
      {
        symbol: "LNG",
        label: "Cheniere (LNG)",
        why: "액화천연가스(LNG) 쪽 회사예요.",
        kind: "stock",
      },
      {
        symbol: "005930",
        label: "삼성전자",
        why: "희토류·자석은 전자·배터리 공급망과도 맞닿아요.",
        kind: "stock",
      },
    ],
  },
  {
    cardId: "c7",
    title: "방산·한반도 관련 시세",
    blurb: "북러 협력 뉴스는 방산·한반도 위험 프리미엄과 같이 보곤 해요.",
    orderbookSymbol: "012450",
    instruments: [
      {
        symbol: "012450",
        label: "한화에어로스페이스",
        why: "방산 분위기 참고용이에요.",
        kind: "stock",
      },
      {
        symbol: "047810",
        label: "한국항공우주",
        why: "항공·방산 쪽 회사예요.",
        kind: "stock",
      },
      {
        symbol: "KOSPI",
        label: "코스피",
        why: "한반도 긴장이 시장 전체 기분에 닿는지 볼 때 써요.",
        kind: "index",
      },
    ],
  },
];

export function getMarketLayerForCard(cardId: string | null | undefined) {
  if (!cardId) return null;
  return CARD_MARKET_LAYERS.find((l) => l.cardId === cardId) ?? null;
}

/** 카드에 강조할 국가 이름 (GeoJSON NAME/ADMIN 매칭용) */
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
