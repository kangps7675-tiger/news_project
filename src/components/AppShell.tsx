"use client";

import { useCallback, useState } from "react";
import { cards, getCardById } from "@/data/cards";
import type { AnalysisResult, Claim, NetworkCard } from "@/types";
import GlobeView from "@/components/GlobeView";
import SidePanel, { type PanelLevel } from "@/components/SidePanel";

export default function AppShell() {
  const [level, setLevel] = useState<PanelLevel>("L0");
  const [activeCard, setActiveCard] = useState<NetworkCard | null>(null);
  const [activeClaim, setActiveClaim] = useState<Claim | null>(null);
  const [newsText, setNewsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

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
    <div className="shell">
      <div className="globe-pane">
        <GlobeView
          cards={cards}
          activeCard={activeCard}
          activeClaim={activeClaim}
          dimOthers={!!activeClaim}
        />
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
