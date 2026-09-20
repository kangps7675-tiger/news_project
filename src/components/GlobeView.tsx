"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Claim, ConfirmationTag, NetworkCard } from "@/types";
import { CARD_COUNTRIES } from "@/data/marketLayers";
import { intelTagColor } from "@/lib/verificationTiers";
import {
  allChokepointMarkers,
} from "@/data/chokepoints";
import {
  OCCUPIED_LABELS,
  OCCUPIED_UKRAINE_FEATURE,
  WAR_FIRE_CARD_IDS,
  warFireSitesForCard,
} from "@/data/warSites";
import {
  GOV_ADVANCE_ZONES,
  HOUTHI_EXPAND_STAGES,
  SAUDI_YEMEN_STRIKES,
  YEMEN_EXPAND_STAGE_COUNT,
  YEMEN_FRONT_LABELS,
  YEMEN_GOV_STAGE_COUNT,
  type YemenZoneFeat,
} from "@/data/yemenFront";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="globe-placeholder">인텔 맵을 그리는 중이에요…</div>
  ),
});

const COUNTRIES_URL =
  "https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson";

type Props = {
  cards: NetworkCard[];
  activeCard: NetworkCard | null;
  activeClaim: Claim | null;
  dimOthers: boolean;
};

type PointDatum = {
  lat: number;
  lng: number;
  label: string;
  tag: ConfirmationTag | "focus";
  active: boolean;
  size: number;
  alt: number;
  marker?: "dot" | "fire";
};

type ArcDatum = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  label: string;
  tag: ConfirmationTag;
  active: boolean;
  dash: boolean;
  alt: number;
};

type HtmlLabel = {
  lat: number;
  lng: number;
  text: string;
  tag: ConfirmationTag | "focus";
  marker?:
    | "dot"
    | "fire"
    | "occupied"
    | "houthi"
    | "gov"
    | "chokepoint"
    | "ship"
    | "carrier";
};

type CountryFeat = {
  type: string;
  properties: { NAME?: string; ADMIN?: string; ISO_A3?: string; name?: string };
  geometry: unknown;
  __active?: boolean;
  __occupied?: boolean;
  /** 해당국끼리 미세 단차 (계단식) */
  __step?: number;
  __yemen?: boolean;
  __side?: "houthi" | "gov";
  __stage?: number;
  /** 0=본채, 1=바깥 안쪽, 2=바깥 먼쪽, 3=영토 안 번짐 */
  __bleed?: 0 | 1 | 2 | 3;
};

/** 거의 붙음 → 해당국만 아주 살짝 단을 올려 계단 느낌 */
const POLY_ALT_IDLE = 0.0006;
const POLY_ALT_STEP_BASE = 0.0032;
const POLY_ALT_STEP_GAP = 0.00055;
const POLY_ALT_HOVER_BUMP = 0.0014;
const POLY_ALT_OCCUPIED = 0.0048;
const POLY_ALT_YEMEN = 0.0065;
const POLY_ALT_BLEED_IN = 0.0024;
const POLY_ALT_BLEED_1 = 0.0011;
const POLY_ALT_BLEED_2 = 0.0004;

type PolyKind =
  | "hover"
  | "active"
  | "idle"
  | "occupied"
  | "houthi"
  | "gov"
  | "bleed-active"
  | "bleed-hover"
  | "bleed-idle"
  | "bleed-occupied"
  | "bleed-houthi"
  | "bleed-gov"
  | "fill-active"
  | "fill-hover"
  | "fill-idle"
  | "fill-occupied"
  | "fill-houthi"
  | "fill-gov";

/** 링을 중심에서 살짝 키워/줄여 번짐용 외·내곽 생성 */
function expandRing(ring: number[][], factor: number): number[][] {
  if (ring.length < 3) return ring;
  const n = ring.length - 1;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < n; i++) {
    cx += ring[i][0];
    cy += ring[i][1];
  }
  cx /= n;
  cy /= n;
  const out: number[][] = [];
  for (let i = 0; i < n; i++) {
    const lng = ring[i][0];
    const lat = ring[i][1];
    out.push([cx + (lng - cx) * factor, cy + (lat - cy) * factor]);
  }
  out.push([...out[0]]);
  return out;
}

function expandGeometry(geometry: unknown, factor: number): unknown {
  if (!geometry || typeof geometry !== "object") return geometry;
  const g = geometry as {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
  if (g.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: (g.coordinates as number[][][]).map((ring, i) =>
        i === 0 ? expandRing(ring, factor) : ring,
      ),
    };
  }
  if (g.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: (g.coordinates as number[][][][]).map((poly) =>
        poly.map((ring, i) => (i === 0 ? expandRing(ring, factor) : ring)),
      ),
    };
  }
  return geometry;
}

/** 바깥 번짐 1장만 (성능: 예전엔 3장×전세계 국가) */
function makeBleedCopies(feat: CountryFeat): CountryFeat[] {
  return [
    {
      ...feat,
      geometry: expandGeometry(feat.geometry, 1.03),
      __bleed: 1,
    },
  ];
}

/** 해당 국가 / 점령 / 후티·정부 / 테두리·내부 번짐 */
function bleedPolygon(kind: PolyKind) {
  if (kind === "fill-active" || kind === "fill-hover") {
    return {
      cap: "rgba(255, 70, 50, 0.28)",
      side: "rgba(180, 20, 20, 0.06)",
      stroke: "rgba(255, 120, 100, 0.08)",
    };
  }
  if (kind === "fill-idle") {
    return {
      cap: "rgba(90, 120, 150, 0.14)",
      side: "rgba(20, 30, 40, 0.03)",
      stroke: "rgba(120, 160, 200, 0.05)",
    };
  }
  if (kind === "fill-occupied") {
    return {
      cap: "rgba(255, 150, 50, 0.26)",
      side: "rgba(160, 60, 10, 0.05)",
      stroke: "rgba(255, 190, 80, 0.08)",
    };
  }
  if (kind === "fill-houthi") {
    return {
      cap: "rgba(255, 70, 80, 0.24)",
      side: "rgba(140, 10, 25, 0.05)",
      stroke: "rgba(255, 120, 90, 0.06)",
    };
  }
  if (kind === "fill-gov") {
    return {
      cap: "rgba(70, 210, 140, 0.22)",
      side: "rgba(20, 90, 55, 0.04)",
      stroke: "rgba(120, 230, 170, 0.06)",
    };
  }
  if (kind === "bleed-active" || kind === "bleed-hover") {
    return {
      cap: "rgba(255, 55, 40, 0.16)",
      side: "rgba(180, 20, 20, 0.08)",
      stroke: "rgba(255, 90, 70, 0.22)",
    };
  }
  if (kind === "bleed-idle") {
    return {
      cap: "rgba(70, 100, 130, 0.1)",
      side: "rgba(20, 30, 40, 0.04)",
      stroke: "rgba(120, 160, 200, 0.12)",
    };
  }
  if (kind === "bleed-occupied") {
    return {
      cap: "rgba(255, 140, 40, 0.14)",
      side: "rgba(160, 60, 10, 0.06)",
      stroke: "rgba(255, 190, 80, 0.2)",
    };
  }
  if (kind === "bleed-houthi") {
    return {
      cap: "rgba(255, 60, 70, 0.14)",
      side: "rgba(140, 10, 25, 0.06)",
      stroke: "rgba(255, 120, 90, 0.18)",
    };
  }
  if (kind === "bleed-gov") {
    return {
      cap: "rgba(60, 200, 130, 0.12)",
      side: "rgba(20, 90, 55, 0.05)",
      stroke: "rgba(120, 230, 170, 0.16)",
    };
  }
  if (kind === "houthi") {
    return {
      cap: "rgba(210, 40, 55, 0.32)",
      side: "rgba(140, 10, 25, 0.35)",
      stroke: "rgba(255, 140, 110, 0.35)",
    };
  }
  if (kind === "gov") {
    return {
      cap: "rgba(40, 140, 90, 0.28)",
      side: "rgba(20, 90, 55, 0.32)",
      stroke: "rgba(140, 230, 180, 0.32)",
    };
  }
  if (kind === "occupied") {
    return {
      cap: "rgba(180, 70, 20, 0.38)",
      side: "rgba(120, 40, 10, 0.35)",
      stroke: "rgba(255, 200, 80, 0.35)",
    };
  }
  if (kind === "hover") {
    return {
      cap: "rgba(255, 48, 48, 0.32)",
      side: "rgba(180, 16, 16, 0.22)",
      stroke: "rgba(255, 170, 150, 0.28)",
    };
  }
  if (kind === "active") {
    return {
      cap: "rgba(220, 28, 28, 0.22)",
      side: "rgba(90, 8, 8, 0.28)",
      stroke: "rgba(255, 110, 90, 0.28)",
    };
  }
  return {
    cap: "rgba(12, 18, 26, 0.55)",
    side: "rgba(4, 6, 10, 0.28)",
    stroke: "rgba(90, 120, 150, 0.16)",
  };
}

function countryKey(f: CountryFeat | null | undefined) {
  if (!f?.properties) return "";
  return f.properties.ADMIN || f.properties.NAME || "";
}

function matchCountry(name: string, targets: string[]) {
  const n = name.toLowerCase();
  return targets.some((t) => {
    const tt = t.toLowerCase();
    return n === tt || n.includes(tt) || tt.includes(n);
  });
}

/** 공습·타격 = 실선, 교류·협력·공급 = 점선 */
function isStrikeArcLabel(label: string) {
  return /공습|타격|딥스트라이크|폭격|피격|요격|게란→|미사일 공격|드론 공격/.test(
    label,
  );
}

function arcDashed(layer: { label: string; dashed?: boolean }) {
  if (typeof layer.dashed === "boolean") return layer.dashed;
  return !isStrikeArcLabel(layer.label);
}

export default function GlobeView({
  cards,
  activeCard,
  activeClaim,
  dimOthers,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [countries, setCountries] = useState<CountryFeat[]>([]);
  const [hoveredKey, setHoveredKey] = useState("");
  /** 후티 연안 확장 단계 (0…N-1 누적) — c8 포커스일 때만 애니 */
  const [houthiStage, setHouthiStage] = useState(
    YEMEN_EXPAND_STAGE_COUNT - 1,
  );
  /** 정부군 반격 구역 단계 */
  const [govStage, setGovStage] = useState(YEMEN_GOV_STAGE_COUNT - 1);

  useEffect(() => {
    let cancelled = false;
    fetch(COUNTRIES_URL)
      .then((r) => r.json())
      .then((geo) => {
        if (!cancelled) setCountries(geo.features || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      setSize({ w, h });
      const g = globeRef.current;
      if (g) {
        g.width(w);
        g.height(h);
      }
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  useEffect(() => {
    const g = globeRef.current;
    if (!g || size.w === 0) return;
    try {
      const mat = g.globeMaterial();
      if (mat) {
        mat.color?.set?.("#05080c");
        if (mat.emissive?.set) mat.emissive.set("#0a1520");
        mat.emissiveIntensity = 0.35;
        mat.shininess = 8;
      }
    } catch {
      /* ignore */
    }
  }, [size.w, size.h, countries.length]);

  const activeCountryNames = useMemo(() => {
    // L0에서 전 카드 국가를 한꺼번에 올리면 폴리곤·번짐이 폭증 → 카드 선택 시에만
    if (!activeCard) return [];
    return CARD_COUNTRIES[activeCard.id] || [];
  }, [activeCard]);

  const showOccupied =
    activeCard?.id === "c1" ||
    activeCard?.id === "c3" ||
    (!!activeCard &&
      (CARD_COUNTRIES[activeCard.id] || []).includes("Ukraine"));

  /** 예멘 확장: c5/c8만. L0에서는 끔 */
  const showYemenFront =
    activeCard?.id === "c8" || activeCard?.id === "c5";

  const showChokepoints =
    activeCard?.id === "c5" ||
    activeClaim?.id?.startsWith("c5-") === true;

  /** 전쟁 화염: 카드 선택 시에만 (L0 전체 덤프 금지) */
  const showWarFires = !!activeCard && WAR_FIRE_CARD_IDS.has(activeCard.id);

  const yemenFocus =
    activeCard?.id === "c8" ||
    activeClaim?.id?.startsWith("c8-") === true;

  useEffect(() => {
    if (!showYemenFront) {
      setHouthiStage(YEMEN_EXPAND_STAGE_COUNT - 1);
      setGovStage(YEMEN_GOV_STAGE_COUNT - 1);
      return;
    }
    if (!yemenFocus) {
      setHouthiStage(YEMEN_EXPAND_STAGE_COUNT - 1);
      setGovStage(YEMEN_GOV_STAGE_COUNT - 1);
      return;
    }
    setHouthiStage(0);
    setGovStage(0);
    let tick = 0;
    const id = window.setInterval(() => {
      tick += 1;
      setHouthiStage((s) =>
        s < YEMEN_EXPAND_STAGE_COUNT - 1 ? s + 1 : s,
      );
      if (tick >= 2) {
        setGovStage((s) =>
          s < YEMEN_GOV_STAGE_COUNT - 1 ? s + 1 : s,
        );
      }
      if (tick > 0 && tick % (YEMEN_EXPAND_STAGE_COUNT + 6) === 0) {
        setHouthiStage(0);
        setGovStage(0);
        tick = 0;
      }
    }, 1600);
    return () => window.clearInterval(id);
  }, [showYemenFront, yemenFocus, activeCard?.id, activeClaim?.id]);

  const polygonData = useMemo(() => {
    if (!countries.length) return [];
    let step = 0;
    const base = countries.map((f) => {
      const name = f.properties.ADMIN || f.properties.NAME || "";
      const active = matchCountry(name, activeCountryNames);
      const feat: CountryFeat = {
        ...f,
        __active: active,
        __occupied: false,
        __yemen: false,
        __step: active ? step : 0,
        __bleed: 0,
      };
      if (active) step += 1;
      return feat;
    });

    const out: CountryFeat[] = [];
    for (const feat of base) {
      out.push(feat);
      if (feat.__active) out.push(...makeBleedCopies(feat));
    }

    if (showOccupied) {
      out.push({
        type: "Feature",
        properties: {
          NAME: "Occupied Ukraine",
          ADMIN: "Occupied Ukraine",
          name: OCCUPIED_UKRAINE_FEATURE.properties.name,
        },
        geometry: OCCUPIED_UKRAINE_FEATURE.geometry,
        __active: false,
        __occupied: true,
        __step: 0,
        __bleed: 0,
      } as CountryFeat);
    }

    if (showYemenFront) {
      for (const z of HOUTHI_EXPAND_STAGES) {
        if ((z.__stage ?? z.properties.stage) <= houthiStage) {
          out.push({ ...(z as YemenZoneFeat), __bleed: 0 } as CountryFeat);
        }
      }
      for (const z of GOV_ADVANCE_ZONES) {
        if ((z.__stage ?? z.properties.stage) <= govStage) {
          out.push({ ...(z as YemenZoneFeat), __bleed: 0 } as CountryFeat);
        }
      }
    }

    return out;
  }, [
    countries,
    activeCountryNames,
    showOccupied,
    showYemenFront,
    houthiStage,
    govStage,
  ]);

  const { points, arcs, htmlLabels } = useMemo(() => {
    const points: PointDatum[] = [];
    const arcs: ArcDatum[] = [];
    const htmlLabels: HtmlLabel[] = [];

    const pushLabel = (
      lat: number,
      lng: number,
      text: string,
      tag: ConfirmationTag | "focus",
      marker?:
        | "dot"
        | "fire"
        | "occupied"
        | "houthi"
        | "gov"
        | "chokepoint"
        | "ship"
        | "carrier",
    ) => {
      htmlLabels.push({ lat, lng, text, tag, marker });
    };

    if (showChokepoints) {
      for (const m of allChokepointMarkers()) {
        const marker =
          m.kind === "block"
            ? "chokepoint"
            : m.kind === "carrier"
              ? "carrier"
              : "ship";
        pushLabel(m.lat, m.lng, m.text, "보도", marker);
      }
    }

    if (showOccupied) {
      for (const o of OCCUPIED_LABELS) {
        pushLabel(o.lat, o.lng, o.text, "보도", "occupied");
      }
    }

    /** 장면 레이어에 화염이 없어도, 전쟁 카드/전체 맵에서는 타격지 화염을 깐다 */
    if (showWarFires) {
      const fires = warFireSitesForCard(activeCard?.id ?? null);
      const seen = new Set<string>();
      // HTML 화염은 비쌈 → 카드당 최대 18개
      let n = 0;
      for (const s of fires) {
        if (n >= 18) break;
        const key = `${s.at[0].toFixed(3)},${s.at[1].toFixed(3)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        n += 1;
        pushLabel(s.at[1], s.at[0], s.label, s.tag, "fire");
      }
    }

    if (showYemenFront) {
      for (const y of YEMEN_FRONT_LABELS) {
        pushLabel(
          y.lat,
          y.lng,
          y.text,
          y.kind === "gov" ? "보도" : "확립",
          y.kind === "strike" ? "fire" : y.kind,
        );
      }
      if (yemenFocus || activeCard?.id === "c8") {
        for (const s of SAUDI_YEMEN_STRIKES) {
          pushLabel(s.at[1], s.at[0], s.label, s.tag, "fire");
          if (s.from) {
            arcs.push({
              startLat: s.from[1],
              startLng: s.from[0],
              endLat: s.at[1],
              endLng: s.at[0],
              label: s.label,
              tag: s.tag,
              active: true,
              dash: false,
              alt: 0.42,
            });
          }
        }
      }
    }

    if (!activeCard) {
      for (const card of cards) {
        for (const p of card.focusPoints) {
          points.push({
            lat: p.lat,
            lng: p.lng,
            label: p.label,
            tag: "focus",
            active: true,
            size: 0.55,
            alt: 0.06,
          });
          pushLabel(p.lat, p.lng, p.label, "focus");
        }
      }
      return { points, arcs, htmlLabels };
    }

    const scene = activeClaim?.scene;
    if (!scene) {
      for (const p of activeCard.focusPoints) {
        points.push({
          lat: p.lat,
          lng: p.lng,
          label: p.label,
          tag: "확립",
          active: true,
          size: 0.7,
          alt: 0.08,
        });
        pushLabel(p.lat, p.lng, p.label, "확립");
      }
    }

    if (scene) {
      for (const layer of scene.layers) {
        if (layer.type === "point" && layer.at) {
          // 해협 봉쇄·상선·항모는 showChokepoints HTML로만 (중복 점 방지)
          if (
            layer.marker === "chokepoint" ||
            layer.marker === "ship" ||
            layer.marker === "carrier"
          ) {
            continue;
          }
          const isFire = layer.marker === "fire";
          if (!isFire) {
            points.push({
              lat: layer.at[1],
              lng: layer.at[0],
              label: layer.label,
              tag: layer.tag,
              active: true,
              size: 0.75,
              alt: 0.09,
              marker: "dot",
            });
          }
          pushLabel(
            layer.at[1],
            layer.at[0],
            layer.label,
            layer.tag,
            isFire ? "fire" : "dot",
          );
        } else if (layer.type === "arc" && layer.from && layer.to) {
          arcs.push({
            startLat: layer.from[1],
            startLng: layer.from[0],
            endLat: layer.to[1],
            endLng: layer.to[0],
            label: layer.label,
            tag: layer.tag,
            active: true,
            dash: arcDashed(layer),
            alt: 0.38,
          });
        } else if (layer.type === "line" && layer.path && layer.path.length > 1) {
          for (let i = 0; i < layer.path.length - 1; i++) {
            const a = layer.path[i];
            const b = layer.path[i + 1];
            arcs.push({
              startLat: a[1],
              startLng: a[0],
              endLat: b[1],
              endLng: b[0],
              label: layer.label,
              tag: layer.tag,
              active: true,
              dash: arcDashed(layer),
              alt: 0.3,
            });
          }
        }
      }
      for (const c of scene.callouts) {
        points.push({
          lat: c.anchor[1],
          lng: c.anchor[0],
          label: c.title,
          tag: c.tag,
          active: true,
          size: 0.58,
          alt: 0.1,
        });
        pushLabel(c.anchor[1], c.anchor[0], c.title, c.tag);
      }
    }

    if (dimOthers) {
      for (const card of cards) {
        if (card.id === activeCard.id) continue;
        for (const p of card.focusPoints) {
          points.push({
            lat: p.lat,
            lng: p.lng,
            label: p.label,
            tag: "focus",
            active: false,
            size: 0.2,
            alt: 0.015,
          });
        }
      }
    }

    return { points, arcs, htmlLabels };
  }, [
    cards,
    activeCard,
    activeClaim,
    dimOthers,
    showOccupied,
    showYemenFront,
    showWarFires,
    showChokepoints,
    yemenFocus,
  ]);

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    if (activeClaim?.scene) {
      const { lat, lng, altitude } = activeClaim.scene.camera;
      g.pointOfView({ lat, lng, altitude }, 1100);
    } else if (activeCard?.id === "c5") {
      g.pointOfView({ lat: 20, lng: 56, altitude: 2.0 }, 900);
    } else if (activeCard?.focusPoints[0]) {
      const p = activeCard.focusPoints[0];
      g.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.55 }, 900);
    } else {
      g.pointOfView({ lat: 24, lng: 58, altitude: 2.2 }, 900);
    }
  }, [activeCard, activeClaim, size.w]);

  const ready = size.w > 0 && size.h > 0;

  const polyKind = (feat: CountryFeat): PolyKind => {
    const bleed = feat.__bleed ?? 0;
    let base: PolyKind = "idle";
    if (feat.__yemen && feat.__side === "houthi") base = "houthi";
    else if (feat.__yemen && feat.__side === "gov") base = "gov";
    else if (feat.__occupied) base = "occupied";
    else {
      const key = countryKey(feat);
      if (hoveredKey && key === hoveredKey) base = "hover";
      else if (feat.__active) base = "active";
    }
    if (bleed === 3) {
      if (base === "hover") return "fill-hover";
      if (base === "active") return "fill-active";
      if (base === "occupied") return "fill-occupied";
      if (base === "houthi") return "fill-houthi";
      if (base === "gov") return "fill-gov";
      return "fill-idle";
    }
    if (bleed > 0) {
      if (base === "hover") return "bleed-hover";
      if (base === "active") return "bleed-active";
      if (base === "occupied") return "bleed-occupied";
      if (base === "houthi") return "bleed-houthi";
      if (base === "gov") return "bleed-gov";
      return "bleed-idle";
    }
    return base;
  };

  return (
    <div className="globe-wrap intel" ref={wrapRef}>
      {!ready && (
        <div className="globe-placeholder">인텔 맵을 펼치는 중이에요…</div>
      )}
      {ready && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          globeImageUrl={undefined}
          bumpImageUrl={undefined}
          backgroundColor="#020406"
          showAtmosphere
          atmosphereColor="#ff3b2f"
          atmosphereAltitude={0.12}
          rendererConfig={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
          waitForGlobeReady
          animateIn={false}
          polygonsData={polygonData}
          polygonAltitude={(d: object) => {
            const feat = d as CountryFeat;
            const kind = polyKind(feat);
            const bleed = feat.__bleed ?? 0;
            if (bleed === 3) return POLY_ALT_BLEED_IN;
            if (bleed === 1) return POLY_ALT_BLEED_1;
            if (bleed === 2) return POLY_ALT_BLEED_2;
            if (kind === "houthi" || kind === "gov") return POLY_ALT_YEMEN;
            if (kind === "occupied") return POLY_ALT_OCCUPIED;
            if (kind === "idle") return POLY_ALT_IDLE;
            const step = feat.__step ?? 0;
            const terrace =
              POLY_ALT_STEP_BASE + Math.min(step, 8) * POLY_ALT_STEP_GAP;
            if (kind === "hover") return terrace + POLY_ALT_HOVER_BUMP;
            return terrace;
          }}
          polygonCapColor={(d: object) =>
            bleedPolygon(polyKind(d as CountryFeat)).cap
          }
          polygonSideColor={(d: object) =>
            bleedPolygon(polyKind(d as CountryFeat)).side
          }
          polygonStrokeColor={(d: object) =>
            bleedPolygon(polyKind(d as CountryFeat)).stroke
          }
          polygonsTransitionDuration={0}
          onPolygonHover={(d: object | null) => {
            const feat = d as CountryFeat | null;
            if (!feat || feat.__occupied || feat.__yemen || (feat.__bleed ?? 0) > 0) {
              if (hoveredKey) setHoveredKey("");
              return;
            }
            const key = countryKey(feat);
            if (key !== hoveredKey) setHoveredKey(key);
          }}
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={(d: object) => (d as PointDatum).alt}
          pointRadius={(d: object) => (d as PointDatum).size}
          pointColor={(d: object) => {
            const p = d as PointDatum;
            return intelTagColor(p.tag, p.active);
          }}
          pointLabel={(d: object) => (d as PointDatum).label}
          arcsData={arcs}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcAltitude={(d: object) => (d as ArcDatum).alt}
          arcStroke={1.85}
          arcColor={(d: object) => {
            const a = d as ArcDatum;
            const c = intelTagColor(a.tag, a.active);
            return [c, c];
          }}
          arcDashLength={(d: object) => ((d as ArcDatum).dash ? 0.22 : 0.95)}
          arcDashGap={(d: object) => ((d as ArcDatum).dash ? 0.16 : 0.02)}
          arcDashAnimateTime={(d: object) =>
            (d as ArcDatum).dash ? 2800 : 3600
          }
          arcLabel={(d: object) => (d as ArcDatum).label}
          htmlElementsData={htmlLabels}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={(d: object) => {
            const m = (d as HtmlLabel).marker;
            if (m === "fire") return 0.028;
            if (m === "occupied") return 0.028;
            if (m === "chokepoint") return 0.04;
            if (m === "ship") return 0.032;
            if (m === "carrier") return 0.038;
            return 0.13;
          }}
          htmlElement={(d: object) => {
            const item = d as HtmlLabel;
            if (item.marker === "chokepoint") {
              const wrap = document.createElement("div");
              wrap.className = "globe-chokepoint";
              wrap.title = item.text;
              const core = document.createElement("span");
              core.className = "choke-core";
              core.setAttribute("aria-hidden", "true");
              const ring = document.createElement("span");
              ring.className = "choke-ring";
              ring.setAttribute("aria-hidden", "true");
              const caption = document.createElement("span");
              caption.className = "choke-caption";
              caption.textContent = item.text;
              wrap.append(ring, core, caption);
              return wrap;
            }
            if (item.marker === "carrier") {
              const wrap = document.createElement("div");
              wrap.className = "globe-carrier";
              wrap.title = item.text;
              const icon = document.createElement("span");
              icon.className = "carrier-icon";
              icon.setAttribute("aria-hidden", "true");
              const island = document.createElement("span");
              island.className = "carrier-island";
              icon.append(island);
              const caption = document.createElement("span");
              caption.className = "carrier-caption";
              caption.textContent = item.text;
              wrap.append(icon, caption);
              return wrap;
            }
            if (item.marker === "ship") {
              const wrap = document.createElement("div");
              wrap.className = "globe-ship";
              wrap.title = item.text;
              const icon = document.createElement("span");
              icon.className = "ship-icon";
              icon.setAttribute("aria-hidden", "true");
              const caption = document.createElement("span");
              caption.className = "ship-caption";
              caption.textContent = "상선";
              wrap.append(icon, caption);
              return wrap;
            }
            if (item.marker === "fire") {
              const wrap = document.createElement("div");
              wrap.className = "globe-strike";
              wrap.title = item.text;
              const flame = document.createElement("span");
              flame.className = "strike-flame";
              flame.setAttribute("aria-hidden", "true");
              wrap.append(flame);
              return wrap;
            }
            if (item.marker === "occupied") {
              const el = document.createElement("div");
              el.className = "globe-occupied-label";
              el.textContent = item.text;
              return el;
            }
            if (item.marker === "houthi" || item.marker === "gov") {
              const el = document.createElement("div");
              el.className =
                item.marker === "houthi"
                  ? "globe-yemen-label houthi"
                  : "globe-yemen-label gov";
              el.textContent = item.text;
              return el;
            }
            const el = document.createElement("div");
            el.className = "globe-html-label intel";
            el.textContent = item.text;
            el.style.borderColor = intelTagColor(item.tag, true);
            return el;
          }}
        />
      )}
      <div className="globe-legend" aria-hidden>
        <span className="lg block">해당국 · 안·밖 번짐</span>
        <span className="lg choke">네온 점 · 해협 막힘</span>
        <span className="lg ship">상선 · 양측 대기</span>
        <span className="lg carrier">미 항모 · 아라비아해</span>
        <span className="lg occupied">주황 · 러 점령지</span>
        <span className="lg houthi">빨강 확장 · 후티 연안</span>
        <span className="lg gov">초록 · 정부군 반격</span>
        <span className="lg arrow">점선 · 교류·협력</span>
        <span className="lg fire">불 표지 · 타격지</span>
      </div>
      {showYemenFront && (
        <div className="yemen-expand-hud" aria-hidden>
          <span className="yemen-expand-title">홍해 전선 확장</span>
          <span className="yemen-expand-bar">
            후티 {houthiStage + 1}/{YEMEN_EXPAND_STAGE_COUNT}
            {" · "}
            정부군 {Math.min(govStage + 1, YEMEN_GOV_STAGE_COUNT)}/
            {YEMEN_GOV_STAGE_COUNT}
          </span>
        </div>
      )}
    </div>
  );
}
