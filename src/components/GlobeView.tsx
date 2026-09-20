"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Claim, ConfirmationTag, NetworkCard } from "@/types";
import { CARD_COUNTRIES } from "@/data/marketLayers";

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

  // 벡터 구면: 사진 텍스처 없이 단색 + 국경 폴리곤만
  useEffect(() => {
    const g = globeRef.current;
    if (!g || size.w === 0) return;
    try {
      const mat = g.globeMaterial();
      if (mat) {
        mat.color?.set?.("#d7c4a0");
        if (mat.emissive?.set) mat.emissive.set("#c4ae86");
        mat.emissiveIntensity = 0.12;
        mat.shininess = 4;
      }
    } catch {
      /* ignore */
    }
  }, [size.w, size.h, countries.length]);

  useEffect(() => {
    setRise(0.006);
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 950);
      const eased = 1 - Math.pow(1 - t, 3);
      setRise(0.006 + eased * 0.09);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [activeCard?.id, activeClaim?.id]);

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
            size: 0.45,
            alt: 0.05,
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
          size: 0.65,
          alt: 0.07,
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
            size: 0.65,
            alt: 0.08,
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
            alt: 0.3,
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
              alt: 0.24,
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
          size: 0.5,
          alt: 0.09,
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
            size: 0.22,
            alt: 0.015,
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
        <div className="globe-placeholder">벡터 지도를 펼치는 중이에요…</div>
      )}
      {ready && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          globeImageUrl={undefined}
          bumpImageUrl={undefined}
          backgroundColor="#ebe0c8"
          showAtmosphere
          atmosphereColor="#c9b896"
          atmosphereAltitude={0.14}
          polygonsData={polygonData}
          polygonAltitude={(d: object) =>
            (d as CountryFeat).__active ? rise : 0.004
          }
          polygonCapColor={(d: object) =>
            (d as CountryFeat).__active
              ? "rgba(176, 120, 56, 0.88)"
              : "rgba(232, 214, 178, 0.92)"
          }
          polygonSideColor={(d: object) =>
            (d as CountryFeat).__active
              ? "rgba(110, 70, 30, 0.95)"
              : "rgba(160, 135, 95, 0.55)"
          }
          polygonStrokeColor={(d: object) =>
            (d as CountryFeat).__active
              ? "rgba(70, 42, 18, 0.95)"
              : "rgba(90, 65, 35, 0.55)"
          }
          polygonCapCurvatureResolution={4}
          polygonsTransitionDuration={750}
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
          arcStroke={1.45}
          arcColor={(d: object) => {
            const a = d as ArcDatum;
            const c = tagColor(a.tag, a.active);
            return [c, c];
          }}
          arcDashLength={(d: object) => ((d as ArcDatum).dash ? 0.38 : 0.9)}
          arcDashGap={(d: object) => ((d as ArcDatum).dash ? 0.16 : 0.06)}
          arcDashAnimateTime={(d: object) =>
            (d as ArcDatum).dash ? 2600 : 4000
          }
          arcLabel={(d: object) => (d as ArcDatum).label}
          labelsData={labels}
          labelLat="lat"
          labelLng="lng"
          labelText="text"
          labelSize={1.2}
          labelDotRadius={0.35}
          labelAltitude={0.1}
          labelColor={(d: object) => {
            const l = d as LabelDatum;
            return tagColor(l.tag, l.active);
          }}
        />
      )}
      <div className="globe-legend" aria-hidden>
        <span className="lg block">솟은 나라 = 지금 이야기</span>
        <span className="lg arrow">먹선 화살표 = 흐름</span>
      </div>
    </div>
  );
}
