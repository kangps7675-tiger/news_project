"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import type { Claim, ConfirmationTag, NetworkCard } from "@/types";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

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
};

type LabelDatum = {
  lat: number;
  lng: number;
  text: string;
  tag: ConfirmationTag;
  active: boolean;
};

function tagColor(tag: ConfirmationTag | "focus", active: boolean): string {
  const alpha = active ? 1 : 0.28;
  switch (tag) {
    case "확립":
      return `rgba(232, 196, 120, ${alpha})`;
    case "보도":
      return `rgba(180, 200, 220, ${0.75 * alpha})`;
    case "당사자 주장":
      return `rgba(220, 160, 120, ${0.7 * alpha})`;
    case "추정":
    case "분석":
      return `rgba(140, 180, 200, ${0.55 * alpha})`;
    case "정황":
      return `rgba(160, 160, 160, ${0.5 * alpha})`;
    case "focus":
      return `rgba(200, 210, 220, ${0.35})`;
    default:
      return `rgba(200, 200, 200, ${alpha})`;
  }
}

export default function GlobeView({
  cards,
  activeCard,
  activeClaim,
  dimOthers,
}: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);

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
            size: 0.35,
          });
        }
      }
      return { points, arcs, labels };
    }

    const scene = activeClaim?.scene;
    const focusActive = !scene;

    if (focusActive) {
      for (const p of activeCard.focusPoints) {
        points.push({
          lat: p.lat,
          lng: p.lng,
          label: p.label,
          tag: "확립",
          active: true,
          size: 0.55,
        });
      }
    }

    if (scene) {
      for (const layer of scene.layers) {
        const active = true;
        if (layer.type === "point" && layer.at) {
          points.push({
            lat: layer.at[1],
            lng: layer.at[0],
            label: layer.label,
            tag: layer.tag,
            active,
            size: 0.6,
          });
        } else if (layer.type === "arc" && layer.from && layer.to) {
          arcs.push({
            startLat: layer.from[1],
            startLng: layer.from[0],
            endLat: layer.to[1],
            endLng: layer.to[0],
            label: layer.label,
            tag: layer.tag,
            active,
            dash: layer.tag !== "확립" && layer.tag !== "보도",
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
              active,
              dash: layer.tag !== "확립" && layer.tag !== "보도",
            });
          }
        }
      }
      for (const c of scene.callouts) {
        labels.push({
          lat: c.anchor[1],
          lng: c.anchor[0],
          text: `${c.title}`,
          tag: c.tag,
          active: true,
        });
        points.push({
          lat: c.anchor[1],
          lng: c.anchor[0],
          label: c.title,
          tag: c.tag,
          active: true,
          size: 0.45,
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
            size: 0.2,
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
      g.pointOfView({ lat, lng, altitude }, 1200);
    } else if (activeCard?.focusPoints[0]) {
      const p = activeCard.focusPoints[0];
      g.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.6 }, 1000);
    } else {
      g.pointOfView({ lat: 30, lng: 50, altitude: 2.2 }, 1000);
    }
  }, [activeCard, activeClaim]);

  return (
    <div className="globe-wrap">
      <Globe
        ref={globeRef}
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.01}
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
        arcColor={(d: object) => {
          const a = d as ArcDatum;
          return tagColor(a.tag, a.active);
        }}
        arcDashLength={(d: object) => ((d as ArcDatum).dash ? 0.35 : 1)}
        arcDashGap={(d: object) => ((d as ArcDatum).dash ? 0.2 : 0)}
        arcDashAnimateTime={(d: object) => ((d as ArcDatum).dash ? 4000 : 0)}
        arcStroke={0.6}
        arcLabel={(d: object) => (d as ArcDatum).label}
        labelsData={labels}
        labelLat="lat"
        labelLng="lng"
        labelText="text"
        labelSize={1.1}
        labelDotRadius={0.3}
        labelColor={(d: object) => {
          const l = d as LabelDatum;
          return tagColor(l.tag, l.active);
        }}
        labelAltitude={0.02}
        atmosphereColor="#7a8fa8"
        atmosphereAltitude={0.12}
      />
      <div className="globe-legend">
        <span className="lg established">확립</span>
        <span className="lg report">보도</span>
        <span className="lg claim">당사자 주장</span>
        <span className="lg estimate">추정·분석</span>
        <span className="lg context">정황</span>
      </div>
    </div>
  );
}
