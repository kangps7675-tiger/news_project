"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Claim, ConfirmationTag, NetworkCard } from "@/types";
import { CARD_COUNTRIES } from "@/data/marketLayers";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => <div className="globe-placeholder">지구본 그리는 중…</div>,
});

const EARTH =
  "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg";
const TOPO =
  "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png";
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

type LabelDatum = {
  lat: number;
  lng: number;
  text: string;
  tag: ConfirmationTag;
  active: boolean;
};

type CountryFeat = {
  type: string;
  properties: { NAME?: string; ADMIN?: string; ISO_A3?: string };
  geometry: unknown;
  __active?: boolean;
};

function tagColor(tag: ConfirmationTag | "focus", active: boolean): string {
  const alpha = active ? 1 : 0.35;
  switch (tag) {
    case "확립":
      return `rgba(201, 140, 40, ${alpha})`;
    case "보도":
      return `rgba(50, 120, 180, ${0.85 * alpha})`;
    case "당사자 주장":
      return `rgba(200, 100, 60, ${0.8 * alpha})`;
    case "추정":
    case "분석":
      return `rgba(70, 140, 160, ${0.7 * alpha})`;
    case "정황":
      return `rgba(120, 120, 130, ${0.6 * alpha})`;
    case "focus":
      return `rgba(40, 110, 170, 0.65)`;
    default:
      return `rgba(80, 80, 90, ${alpha})`;
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
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [countries, setCountries] = useState<CountryFeat[]>([]);
  const [rise, setRise] = useState(0.01);

  useEffect(() => {
    let cancelled = false;
    fetch(COUNTRIES_URL)
      .then((r) => r.json())
      .then((geo) => {
        if (!cancelled) setCountries(geo.features || []);
      })
      .catch(() => {
        /* ignore — globe still works without borders */
      });
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

  // 블록처럼 위로 솟아오르는 애니메이션
  useEffect(() => {
    setRise(0.008);
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - t, 3);
      setRise(0.008 + eased * 0.085);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [activeCard?.id, activeClaim?.id]);

  const activeCountryNames = useMemo(() => {
    if (!activeCard) {
      return Object.values(CARD_COUNTRIES).flat();
    }
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

  const { points, arcs, labels } = useMemo(() => {
    const points: PointDatum[] = [];
    const arcs: ArcDatum[] = [];
    const labels: LabelDatum[] = [];

    if (!activeCard) {
      for (const card of cards) {
        for (const p of card.focusPoints) {
          points.push({
            lat: p.lat,
            lng: p.lng,
            label: p.label,
            tag: "focus",
            active: true,
            size: 0.5,
            alt: 0.04,
          });
        }
      }
      return { points, arcs, labels };
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
          alt: 0.06,
        });
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
            alt: 0.07,
          });
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
            alt: 0.28,
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
              alt: 0.22,
            });
          }
        }
      }
      for (const c of scene.callouts) {
        labels.push({
          lat: c.anchor[1],
          lng: c.anchor[0],
          text: c.title,
          tag: c.tag,
          active: true,
        });
        points.push({
          lat: c.anchor[1],
          lng: c.anchor[0],
          label: c.title,
          tag: c.tag,
          active: true,
          size: 0.55,
          alt: 0.08,
        });
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
            size: 0.25,
            alt: 0.01,
          });
        }
      }
    }

    return { points, arcs, labels };
  }, [cards, activeCard, activeClaim, dimOthers]);

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
    <div className="globe-wrap" ref={wrapRef}>
      {!ready && (
        <div className="globe-placeholder">
          지구본을 크게 그리는 중이에요…
        </div>
      )}
      {ready && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          globeImageUrl={EARTH}
          bumpImageUrl={TOPO}
          backgroundColor="#d8e6f2"
          showAtmosphere
          atmosphereColor="#7eb6e8"
          atmosphereAltitude={0.16}
          polygonsData={polygonData}
          polygonAltitude={(d: object) =>
            (d as CountryFeat).__active ? rise : 0.003
          }
          polygonCapColor={(d: object) =>
            (d as CountryFeat).__active
              ? "rgba(232, 170, 70, 0.72)"
              : "rgba(180, 200, 210, 0.12)"
          }
          polygonSideColor={(d: object) =>
            (d as CountryFeat).__active
              ? "rgba(180, 120, 40, 0.85)"
              : "rgba(140, 160, 170, 0.15)"
          }
          polygonStrokeColor={() => "rgba(90, 110, 120, 0.35)"}
          polygonsTransitionDuration={700}
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={(d: object) => (d as PointDatum).alt * (rise / 0.09)}
          pointRadius={(d: object) => (d as PointDatum).size}
          pointColor={(d: object) => {
            const p = d as PointDatum;
            return tagColor(p.tag, p.active);
          }}
          pointLabel={(d: object) => (d as PointDatum).label}
          arcsData={arcs}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcAltitude={(d: object) => (d as ArcDatum).alt}
          arcStroke={1.35}
          arcColor={(d: object) => {
            const a = d as ArcDatum;
            return [
              tagColor(a.tag, a.active),
              tagColor(a.tag, a.active),
            ];
          }}
          arcDashLength={(d: object) => ((d as ArcDatum).dash ? 0.4 : 0.85)}
          arcDashGap={(d: object) => ((d as ArcDatum).dash ? 0.18 : 0.08)}
          arcDashAnimateTime={(d: object) =>
            (d as ArcDatum).dash ? 2800 : 4200
          }
          arcLabel={(d: object) => `➡️ ${(d as ArcDatum).label}`}
          labelsData={labels}
          labelLat="lat"
          labelLng="lng"
          labelText="text"
          labelSize={1.25}
          labelDotRadius={0.4}
          labelAltitude={0.09}
          labelColor={(d: object) => {
            const l = d as LabelDatum;
            return tagColor(l.tag, l.active);
          }}
        />
      )}
      <div className="globe-legend" aria-hidden>
        <span className="lg block">솟은 나라 = 지금 보는 이야기</span>
        <span className="lg arrow">움직이는 선 = 화살표(흐름)</span>
      </div>
    </div>
  );
}
