"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Claim, ConfirmationTag, NetworkCard } from "@/types";
import { CARD_COUNTRIES } from "@/data/marketLayers";
import {
  intelCountryColors,
  intelTagColor,
} from "@/lib/verificationTiers";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="globe-placeholder">벡터 지도를 그리는 중이에요…</div>
  ),
});

const COUNTRIES_URL =
  "https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson";

type Props = {
  cards: NetworkCard[];
  activeCard: NetworkCard | null;
  activeClaim: Claim | null;
  dimOthers: boolean;
  /** 인텔 모드: 레이어를 알록달록하게 */
  intelMode?: boolean;
};

type PointDatum = {
  lat: number;
  lng: number;
  label: string;
  tag: ConfirmationTag | "focus";
  active: boolean;
  size: number;
  alt: number;
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
};

type CountryFeat = {
  type: string;
  properties: { NAME?: string; ADMIN?: string; ISO_A3?: string };
  geometry: unknown;
  __active?: boolean;
};

const POLY_ALT_BASE = 0.0035;
const POLY_ALT_ACTIVE = 0.006;
const POLY_ALT_HOVER = 0.014;

function countryKey(f: CountryFeat | null | undefined) {
  if (!f?.properties) return "";
  return f.properties.ADMIN || f.properties.NAME || "";
}

function redPolygonColors(kind: "hover" | "active" | "idle", vivid: boolean) {
  if (kind === "hover") {
    return {
      cap: "rgba(220, 38, 38, 0.88)",
      side: "rgba(153, 27, 27, 0.75)",
      stroke: "rgba(254, 202, 202, 0.95)",
    };
  }
  if (kind === "active") {
    if (vivid) return intelCountryColors(true);
    return {
      cap: "rgba(185, 48, 48, 0.72)",
      side: "rgba(120, 30, 30, 0.55)",
      stroke: "rgba(220, 100, 100, 0.8)",
    };
  }
  if (vivid) return intelCountryColors(false);
  return {
    cap: "rgba(232, 214, 178, 0.92)",
    side: "rgba(160, 135, 95, 0.55)",
    stroke: "rgba(90, 65, 35, 0.55)",
  };
}

function parchmentTagColor(
  tag: ConfirmationTag | "focus",
  active: boolean,
): string {
  const alpha = active ? 1 : 0.4;
  switch (tag) {
    case "확립":
      return `rgba(122, 72, 28, ${alpha})`;
    case "보도":
      return `rgba(90, 70, 45, ${0.9 * alpha})`;
    case "당사자 주장":
      return `rgba(150, 70, 40, ${0.85 * alpha})`;
    case "추정":
    case "분석":
      return `rgba(110, 95, 70, ${0.75 * alpha})`;
    case "정황":
      return `rgba(130, 120, 100, ${0.65 * alpha})`;
    case "focus":
      return `rgba(100, 70, 35, 0.7)`;
    default:
      return `rgba(90, 70, 50, ${alpha})`;
  }
}

function matchCountry(name: string, targets: string[]) {
  const n = name.toLowerCase();
  return targets.some((t) => {
    const tt = t.toLowerCase();
    return n === tt || n.includes(tt) || tt.includes(n);
  });
}

export default function GlobeView({
  cards,
  activeCard,
  activeClaim,
  dimOthers,
  intelMode = false,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [countries, setCountries] = useState<CountryFeat[]>([]);
  const [hoveredKey, setHoveredKey] = useState("");

  const vivid = intelMode || !!activeClaim;

  const colorFor = (tag: ConfirmationTag | "focus", active: boolean) =>
    vivid ? intelTagColor(tag, active) : parchmentTagColor(tag, active);

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
        mat.color?.set?.(vivid ? "#1a1430" : "#d7c4a0");
        if (mat.emissive?.set) {
          mat.emissive.set(vivid ? "#2a1a4a" : "#c4ae86");
        }
        mat.emissiveIntensity = vivid ? 0.25 : 0.12;
        mat.shininess = vivid ? 18 : 4;
      }
    } catch {
      /* ignore */
    }
  }, [size.w, size.h, countries.length, vivid]);

  const activeCountryNames = useMemo(() => {
    if (!activeCard) return Object.values(CARD_COUNTRIES).flat();
    return CARD_COUNTRIES[activeCard.id] || [];
  }, [activeCard]);

  const polygonData = useMemo(() => {
    if (!countries.length) return [];
    return countries.map((f) => {
      const name = f.properties.ADMIN || f.properties.NAME || "";
      const active = matchCountry(name, activeCountryNames);
      return { ...f, __active: active };
    });
  }, [countries, activeCountryNames]);

  const { points, arcs, htmlLabels } = useMemo(() => {
    const points: PointDatum[] = [];
    const arcs: ArcDatum[] = [];
    const htmlLabels: HtmlLabel[] = [];

    const pushLabel = (
      lat: number,
      lng: number,
      text: string,
      tag: ConfirmationTag | "focus",
    ) => {
      htmlLabels.push({ lat, lng, text, tag });
    };

    if (!activeCard) {
      for (const card of cards) {
        for (const p of card.focusPoints) {
          points.push({
            lat: p.lat,
            lng: p.lng,
            label: p.label,
            tag: "focus",
            active: true,
            size: vivid ? 0.55 : 0.45,
            alt: 0.05,
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
          size: 0.65,
          alt: 0.07,
        });
        pushLabel(p.lat, p.lng, p.label, "확립");
      }
    }

    if (scene) {
      for (const layer of scene.layers) {
        if (layer.type === "point" && layer.at) {
          points.push({
            lat: layer.at[1],
            lng: layer.at[0],
            label: layer.label,
            tag: layer.tag,
            active: true,
            size: 0.7,
            alt: 0.08,
          });
          pushLabel(layer.at[1], layer.at[0], layer.label, layer.tag);
        } else if (layer.type === "arc" && layer.from && layer.to) {
          arcs.push({
            startLat: layer.from[1],
            startLng: layer.from[0],
            endLat: layer.to[1],
            endLng: layer.to[0],
            label: layer.label,
            tag: layer.tag,
            active: true,
            dash: layer.tag !== "확립" && layer.tag !== "보도",
            alt: vivid ? 0.36 : 0.3,
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
              dash: layer.tag !== "확립" && layer.tag !== "보도",
              alt: vivid ? 0.28 : 0.24,
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
          size: 0.55,
          alt: 0.09,
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
            size: 0.22,
            alt: 0.015,
          });
        }
      }
    }

    return { points, arcs, htmlLabels };
  }, [cards, activeCard, activeClaim, dimOthers, vivid]);

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    if (activeClaim?.scene) {
      const { lat, lng, altitude } = activeClaim.scene.camera;
      g.pointOfView({ lat, lng, altitude }, 1100);
    } else if (activeCard?.focusPoints[0]) {
      const p = activeCard.focusPoints[0];
      g.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.55 }, 900);
    } else {
      g.pointOfView({ lat: 28, lng: 55, altitude: 2.05 }, 900);
    }
  }, [activeCard, activeClaim, size.w]);

  const ready = size.w > 0 && size.h > 0;

  return (
    <div className={vivid ? "globe-wrap intel" : "globe-wrap"} ref={wrapRef}>
      {!ready && (
        <div className="globe-placeholder">벡터 지도를 펼치는 중이에요…</div>
      )}
      {ready && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          globeImageUrl={undefined}
          bumpImageUrl={undefined}
          backgroundColor={vivid ? "#0d0818" : "#ebe0c8"}
          showAtmosphere
          atmosphereColor={vivid ? "#7c4dff" : "#c9b896"}
          atmosphereAltitude={vivid ? 0.2 : 0.14}
          polygonsData={polygonData}
          polygonAltitude={(d: object) => {
            const feat = d as CountryFeat;
            const key = countryKey(feat);
            if (hoveredKey && key === hoveredKey) return POLY_ALT_HOVER;
            if (feat.__active) return POLY_ALT_ACTIVE;
            return POLY_ALT_BASE;
          }}
          polygonCapColor={(d: object) => {
            const feat = d as CountryFeat;
            const key = countryKey(feat);
            const kind =
              hoveredKey && key === hoveredKey
                ? "hover"
                : feat.__active
                  ? "active"
                  : "idle";
            return redPolygonColors(kind, vivid).cap;
          }}
          polygonSideColor={(d: object) => {
            const feat = d as CountryFeat;
            const key = countryKey(feat);
            const kind =
              hoveredKey && key === hoveredKey
                ? "hover"
                : feat.__active
                  ? "active"
                  : "idle";
            return redPolygonColors(kind, vivid).side;
          }}
          polygonStrokeColor={(d: object) => {
            const feat = d as CountryFeat;
            const key = countryKey(feat);
            const kind =
              hoveredKey && key === hoveredKey
                ? "hover"
                : feat.__active
                  ? "active"
                  : "idle";
            return redPolygonColors(kind, vivid).stroke;
          }}
          polygonsTransitionDuration={280}
          onPolygonHover={(d: object | null) => {
            setHoveredKey(countryKey(d as CountryFeat | null));
          }}
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={(d: object) => (d as PointDatum).alt}
          pointRadius={(d: object) => (d as PointDatum).size}
          pointColor={(d: object) => {
            const p = d as PointDatum;
            return colorFor(p.tag, p.active);
          }}
          pointLabel={(d: object) => (d as PointDatum).label}
          arcsData={arcs}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcAltitude={(d: object) => (d as ArcDatum).alt}
          arcStroke={vivid ? 1.7 : 1.45}
          arcColor={(d: object) => {
            const a = d as ArcDatum;
            const c = colorFor(a.tag, a.active);
            return [c, c];
          }}
          arcDashLength={(d: object) => ((d as ArcDatum).dash ? 0.35 : 0.9)}
          arcDashGap={(d: object) => ((d as ArcDatum).dash ? 0.14 : 0.05)}
          arcDashAnimateTime={(d: object) =>
            (d as ArcDatum).dash ? 2200 : 3600
          }
          arcLabel={(d: object) => (d as ArcDatum).label}
          htmlElementsData={htmlLabels}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.12}
          htmlElement={(d: object) => {
            const item = d as HtmlLabel;
            const el = document.createElement("div");
            el.className = vivid ? "globe-html-label intel" : "globe-html-label";
            el.textContent = item.text;
            el.style.borderColor = colorFor(item.tag, true);
            return el;
          }}
        />
      )}
      <div className="globe-legend" aria-hidden>
        <span className="lg block">
          {vivid ? "인텔 · 호버 시 붉은 면" : "나라 위에 올리면 붉게 살짝 뜸"}
        </span>
        <span className="lg arrow">
          {vivid ? "알록달록 화살표 = 흐름" : "먹선 화살표 = 흐름"}
        </span>
      </div>
    </div>
  );
}
