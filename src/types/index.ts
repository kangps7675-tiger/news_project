export type ConfirmationTag =
  | "확립"
  | "보도"
  | "당사자 주장"
  | "추정"
  | "분석"
  | "정황";

export type EvidenceGrade = "A" | "B" | "C" | "D" | "X";

export type LayerType = "polygon" | "line" | "arc" | "point";

export interface SourceRef {
  id: string;
  label: string;
  url?: string;
}

export type GlobeMarker = "dot" | "fire" | "chokepoint" | "ship" | "carrier";

export interface GlobeLayer {
  type: LayerType;
  label: string;
  tag: ConfirmationTag;
  /** [lng, lat][] for line/polygon; single [lng, lat] for point */
  path?: [number, number][];
  at?: [number, number];
  /** for arc: start and end */
  from?: [number, number];
  to?: [number, number];
  /** 전장·폭격 지점 도장 (기본 dot) */
  marker?: GlobeMarker;
  /**
   * 아크/선 스타일.
   * true = 점선(교류·협력·공급), false = 실선(공습·타격).
   * 생략 시 라벨로 추론.
   */
  dashed?: boolean;
}

export interface Callout {
  anchor: [number, number];
  title: string;
  tag: ConfirmationTag;
  note: string;
  sourceIds?: string[];
}

export interface Scene {
  camera: { lat: number; lng: number; altitude: number };
  layers: GlobeLayer[];
  callouts: Callout[];
  asOf?: string;
}

export interface Claim {
  id: string;
  text: string;
  tag: ConfirmationTag;
  grade: EvidenceGrade;
  sources: SourceRef[];
  counterClaim?: string;
  caveat: string;
  scene: Scene;
}

export interface NetworkCard {
  id: string;
  name: string;
  summary: string;
  triggers: string[];
  doNotAssert: string[];
  marketTouchpoints: string[];
  relatedCardIds: string[];
  asOf: string;
  /** L0 faint markers */
  focusPoints: { lat: number; lng: number; label: string }[];
  claims: Claim[];
}

export interface GoogleNewsHit {
  title: string;
  link: string;
  /** 원문 URL (가능하면 Google 리다이렉트가 아닌 주소) */
  url?: string;
  source: string;
  publishedAt: string | null;
  mediaTier?: string;
}

export interface AnalysisResult {
  isNews: boolean;
  rejectionReason?: string;
  sections: {
    whatNow: string;
    roots: string;
    motives: string;
    marketPaths: string;
  };
  networkPositions: {
    cardId: string | null;
    oneLiner: string;
  }[];
  credibility: {
    source: string;
    claimType: string;
    opposingViews: string;
  };
  /** Google News RSS로 모은 관련 보도(헤드라인·링크만) */
  relatedSources?: GoogleNewsHit[];
  relatedSourcesQuery?: string;
}
