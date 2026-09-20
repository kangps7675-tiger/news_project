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
};

/** 거의 붙음 → 해당국만 아주 살짝 단을 올려 계단 느낌 */
const POLY_ALT_IDLE = 0.0006;
const POLY_ALT_STEP_BASE = 0.0032;
const POLY_ALT_STEP_GAP = 0.00055;
const POLY_ALT_HOVER_BUMP = 0.0014;
const POLY_ALT_OCCUPIED = 0.0048;
const POLY_ALT_YEMEN = 0.0065;

/** 해당 국가 / 점령 / 후티·정부 구역 */
function bleedPolygon(
  kind: "hover" | "active" | "idle" | "occupied" | "houthi" | "gov",
) {
  if (kind === "houthi") {
    return {
      cap: "rgba(210, 40, 55, 0.62)",
      side: "rgba(140, 10, 25, 0.82)",
      stroke: "rgba(255, 120, 90, 0.95)",
    };
  }
  if (kind === "gov") {
    return {
      cap: "rgba(40, 140, 90, 0.55)",
      side: "rgba(20, 90, 55, 0.78)",
      stroke: "rgba(120, 230, 170, 0.92)",
    };
  }
  if (kind === "occupied") {
    return {
      cap: "rgba(180, 70, 20, 0.78)",
      side: "rgba(120, 40, 10, 0.85)",
      stroke: "rgba(255, 200, 80, 0.95)",
    };
  }
  if (kind === "hover") {
    return {
      cap: "rgba(255, 48, 48, 0.72)",
      side: "rgba(180, 16, 16, 0.55)",
      stroke: "rgba(255, 160, 140, 0.95)",
    };
  }
  if (kind === "active") {
    return {
      cap: "rgba(220, 28, 28, 0.42)",
      side: "rgba(90, 8, 8, 0.88)",
      stroke: "rgba(255, 90, 70, 0.85)",
    };
  }
  return {
    cap: "rgba(8, 12, 18, 0.92)",
    side: "rgba(4, 6, 10, 0.7)",
    stroke: "rgba(40, 55, 70, 0.35)",
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
  /** 후티 연안 확장 단계 (0…N-1 누적) */
  const [houthiStage, setHouthiStage] = useState(0);
  /** 정부군 반격 구역 단계 */
  const [govStage, setGovStage] = useState(0);
  const [expandPulse, setExpandPulse] = useState(0);

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
    if (!activeCard) return Object.values(CARD_COUNTRIES).flat();
    return CARD_COUNTRIES[activeCard.id] || [];
  }, [activeCard]);

  const showOccupied =
    !activeCard ||
    activeCard.id === "c1" ||
    activeCard.id === "c3" ||
    (CARD_COUNTRIES[activeCard.id] || []).includes("Ukraine");

  const showYemenFront =
    !activeCard ||
    activeCard.id === "c8" ||
    activeCard.id === "c5";

  /** 호르무즈·바브엘만데브 봉쇄 신호 (c5 또는 초크포인트 관련 고리) */
  const showChokepoints =
    !activeCard ||
    activeCard.id === "c5" ||
    activeClaim?.id?.startsWith("c5-") === true;

  /** 러우·카스피해·이란·예멘 등 전쟁 타격지 → 화염 통일 */
  const showWarFires =
    !activeCard || WAR_FIRE_CARD_IDS.has(activeCard.id);

  const yemenFocus =
    activeCard?.id === "c8" ||
    activeClaim?.id?.startsWith("c8-") === true;

  useEffect(() => {
    if (!showYemenFront) {
      setHouthiStage(0);
      setGovStage(0);
      setExpandPulse(0);
      return;
    }
    setHouthiStage(0);
    setGovStage(0);
    let tick = 0;
    const id = window.setInterval(() => {
      tick += 1;
      setExpandPulse((p) => (p + 1) % 48);
      setHouthiStage((s) =>
        s < YEMEN_EXPAND_STAGE_COUNT - 1 ? s + 1 : s,
      );
      if (tick >= 2) {
        setGovStage((s) =>
          s < YEMEN_GOV_STAGE_COUNT - 1 ? s + 1 : s,
        );
      }
      if (tick > 0 && tick % (YEMEN_EXPAND_STAGE_COUNT + 5) === 0) {
        setHouthiStage(0);
        setGovStage(0);
        tick = 0;
      }
    }, yemenFocus ? 850 : 1300);
    return () => window.clearInterval(id);
  }, [showYemenFront, yemenFocus, activeCard?.id, activeClaim?.id]);

  const polygonData = useMemo(() => {
    if (!countries.length) return [];
    let step = 0;
    const base = countries.map((f) => {
      const name = f.properties.ADMIN || f.properties.NAME || "";
      const active = matchCountry(name, activeCountryNames);
      const feat = {
        ...f,
        __active: active,
        __occupied: false,
        __yemen: false,
        __step: active ? step : 0,
      };
      if (active) step += 1;
      return feat;
    });
    const extras: CountryFeat[] = [];
    if (showOccupied) {
      extras.push({
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
      } as CountryFeat);
    }
    if (showYemenFront) {
      for (const z of HOUTHI_EXPAND_STAGES) {
        if ((z.__stage ?? z.properties.stage) <= houthiStage) {
          extras.push({ ...(z as YemenZoneFeat) } as CountryFeat);
        }
      }
      for (const z of GOV_ADVANCE_ZONES) {
        if ((z.__stage ?? z.properties.stage) <= govStage) {
          extras.push({ ...(z as YemenZoneFeat) } as CountryFeat);
        }
      }
    }
    return [...base, ...extras];
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
      for (const s of fires) {
        const key = `${s.at[0].toFixed(3)},${s.at[1].toFixed(3)}`;
        if (seen.has(key)) continue;
        seen.add(key);
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

  const polyKind = (feat: CountryFeat) => {
    if (feat.__yemen && feat.__side === "houthi") return "houthi" as const;
    if (feat.__yemen && feat.__side === "gov") return "gov" as const;
    if (feat.__occupied) return "occupied" as const;
    const key = countryKey(feat);
    if (hoveredKey && key === hoveredKey) return "hover" as const;
    if (feat.__active) return "active" as const;
    return "idle" as const;
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
          atmosphereAltitude={0.18}
          polygonsData={polygonData}
          polygonAltitude={(d: object) => {
            const feat = d as CountryFeat;
            const kind = polyKind(feat);
            if (kind === "houthi" || kind === "gov") {
              const newest =
                kind === "houthi"
                  ? (feat.__stage ?? 0) === houthiStage
                  : (feat.__stage ?? 0) === govStage;
              const pulse = newest ? (expandPulse % 8) * 0.00035 : 0;
              return POLY_ALT_YEMEN + pulse;
            }
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
          polygonsTransitionDuration={720}
          onPolygonHover={(d: object | null) => {
            const feat = d as CountryFeat | null;
            if (feat?.__occupied || feat?.__yemen) {
              setHoveredKey("");
              return;
            }
            setHoveredKey(countryKey(feat));
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
            if (m === "fire") return 0.05;
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
              const stamp = document.createElement("div");
              stamp.className = "globe-blast-stamp intel";
              stamp.title = item.text;

              const blast = document.createElement("div");
              blast.className = "blast-visual";
              blast.setAttribute("aria-hidden", "true");

              const smokeL = document.createElement("span");
              smokeL.className = "smoke smoke-l";
              const smokeC = document.createElement("span");
              smokeC.className = "smoke smoke-c";
              const smokeR = document.createElement("span");
              smokeR.className = "smoke smoke-r";
              const flash = document.createElement("span");
              flash.className = "blast-flash";
              const core = document.createElement("span");
              core.className = "blast-core";
              const ember = document.createElement("span");
              ember.className = "blast-ember";

              const tongues = document.createElement("span");
              tongues.className = "fire-tongues";
              for (const name of ["tongue-a", "tongue-b", "tongue-c"]) {
                const t = document.createElement("span");
                t.className = `tongue ${name}`;
                tongues.append(t);
              }

              blast.append(
                smokeL,
                smokeC,
                smokeR,
                flash,
                core,
                ember,
                tongues,
              );

              const caption = document.createElement("span");
              caption.className = "blast-caption";
              caption.textContent = item.text;
              stamp.append(blast, caption);
              return stamp;
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
        <span className="lg block">해당국 · 미세 계단 단</span>
        <span className="lg choke">네온 점 · 해협 막힘</span>
        <span className="lg ship">상선 · 양측 대기</span>
        <span className="lg carrier">미 항모 · 아라비아해</span>
        <span className="lg occupied">주황 · 러 점령지</span>
        <span className="lg houthi">빨강 확장 · 후티 연안</span>
        <span className="lg gov">초록 · 정부군 반격</span>
        <span className="lg arrow">점선 · 교류·협력</span>
        <span className="lg fire">폭발→연기→불혀 · 타격지</span>
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
