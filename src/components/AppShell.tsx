"use client";

import { Component, useCallback, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { cards, getCardById } from "@/data/cards";
import type { AnalysisResult, Claim, NetworkCard } from "@/types";
import SidePanel, { type PanelLevel } from "@/components/SidePanel";

const GlobeView = dynamic(() => import("@/components/GlobeView"), {
  ssr: false,
  loading: () => <div className="globe-placeholder">지구본을 그리는 중이에요…</div>,
});

class GlobeErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };

  static getDerivedStateFromError(err: Error) {
    return { error: err.message || "지구본을 표시할 수 없습니다." };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="globe-placeholder">
          <p>지구본이 잠깐 말을 안 들어요.</p>
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
  const [newsText, setNewsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [intelMode, setIntelMode] = useState(false);

  const selectCard = useCallback((card: NetworkCard) => {
    setActiveCard(card);
    setActiveClaim(null);
    setLevel("L1");
    setIntelMode(true);
  }, []);

  const selectClaim = useCallback((claim: Claim) => {
    setActiveClaim(claim);
    setLevel("L2");
    setIntelMode(true);
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
      setIntelMode(false);
    }
  }, [level]);

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newsText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "요청에 실패했습니다.");
        setAnalysis(null);
        return;
      }
      setAnalysis(data.analysis);
      const firstMatch = data.analysis?.networkPositions?.find(
        (p: { cardId: string | null }) => p.cardId,
      );
      if (firstMatch?.cardId) {
        const card = getCardById(firstMatch.cardId);
        if (card) {
          setActiveCard(card);
          setActiveClaim(null);
          setLevel("L1");
        }
      }
    } catch {
      setError("네트워크 오류가 났습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, [newsText]);

  return (
    <div className={intelMode ? "shell intel-on" : "shell"}>
      <div className="globe-pane">
        <div className="intel-toggle-bar">
          <button
            type="button"
            className={intelMode ? "intel-toggle on" : "intel-toggle"}
            onClick={() => setIntelMode((v) => !v)}
          >
            {intelMode ? "인텔 모드 ON" : "인텔 모드"}
          </button>
        </div>
        <GlobeErrorBoundary>
          <GlobeView
            cards={cards}
            activeCard={activeCard}
            activeClaim={activeClaim}
            dimOthers={!!activeClaim}
            intelMode={intelMode}
          />
        </GlobeErrorBoundary>
      </div>
      <SidePanel
        cards={cards}
        level={level}
        activeCard={activeCard}
        activeClaim={activeClaim}
        analysis={analysis}
        newsText={newsText}
        loading={loading}
        error={error}
        onNewsChange={setNewsText}
        onAnalyze={analyze}
        onSelectCard={selectCard}
        onSelectClaim={selectClaim}
        onSetLevel={setLevel}
        onBack={back}
        onGoRelated={goRelated}
        onClearAnalysis={() => setAnalysis(null)}
      />
    </div>
  );
}
