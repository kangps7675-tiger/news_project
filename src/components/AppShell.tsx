"use client";

import { Component, useCallback, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { cards, getCardById } from "@/data/cards";
import type { Claim, NetworkCard } from "@/types";
import SidePanel, { type PanelLevel } from "@/components/SidePanel";

const GlobeView = dynamic(() => import("@/components/GlobeView"), {
  ssr: false,
  loading: () => (
    <div className="globe-placeholder">인텔 맵을 그리는 중이에요…</div>
  ),
});

class GlobeErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };

  static getDerivedStateFromError(err: Error) {
    return { error: err.message || "인텔 맵을 표시할 수 없습니다." };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="globe-placeholder">
          <p>인텔 맵이 잠깐 말을 안 들어요.</p>
          <p className="muted">새로고침해 보거나, 잠시 뒤 다시 와 주세요.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppShell() {
  const [level, setLevel] = useState<PanelLevel>("L0");
  const [activeCard, setActiveCard] = useState<NetworkCard | null>(null);
  const [activeClaim, setActiveClaim] = useState<Claim | null>(null);

  const selectCard = useCallback((card: NetworkCard) => {
    setActiveCard(card);
    setActiveClaim(null);
    setLevel("L1");
  }, []);

  const selectClaim = useCallback((claim: Claim) => {
    setActiveClaim(claim);
    setLevel("L2");
  }, []);

  const goRelated = useCallback((cardId: string) => {
    const card = getCardById(cardId);
    if (!card) return;
    setActiveCard(card);
    setActiveClaim(null);
    setLevel("L1");
  }, []);

  const back = useCallback(() => {
    if (level === "L4") setLevel("L3");
    else if (level === "L3") setLevel("L2");
    else if (level === "L2") setLevel("L1");
    else if (level === "L1") {
      setActiveCard(null);
      setActiveClaim(null);
      setLevel("L0");
    }
  }, [level]);

  return (
    <div className="shell intel-on">
      <div className="globe-pane">
        <GlobeErrorBoundary>
          <GlobeView
            cards={cards}
            activeCard={activeCard}
            activeClaim={activeClaim}
            dimOthers={!!activeClaim}
          />
        </GlobeErrorBoundary>
      </div>
      <SidePanel
        cards={cards}
        level={level}
        activeCard={activeCard}
        activeClaim={activeClaim}
        onSelectCard={selectCard}
        onSelectClaim={selectClaim}
        onSetLevel={setLevel}
        onBack={back}
        onGoRelated={goRelated}
      />
    </div>
  );
}
