"use client";

import { useState } from "react";
import type {
  AnalysisResult,
  Claim,
  GoogleNewsHit,
  NetworkCard,
} from "@/types";
import { EXAMPLE_NEWS } from "@/data/cards";

export type PanelLevel = "L0" | "L1" | "L2" | "L3" | "L4";

type Props = {
  cards: NetworkCard[];
  level: PanelLevel;
  activeCard: NetworkCard | null;
  activeClaim: Claim | null;
  analysis: AnalysisResult | null;
  newsText: string;
  loading: boolean;
  error: string | null;
  onNewsChange: (v: string) => void;
  onAnalyze: () => void;
  onSelectCard: (card: NetworkCard) => void;
  onSelectClaim: (claim: Claim) => void;
  onSetLevel: (level: PanelLevel) => void;
  onBack: () => void;
  onGoRelated: (cardId: string) => void;
  onClearAnalysis: () => void;
};

const TAG_CLASS: Record<string, string> = {
  확립: "tag tag-ok",
  보도: "tag tag-report",
  "당사자 주장": "tag tag-claim",
  추정: "tag tag-est",
  분석: "tag tag-est",
  정황: "tag tag-context",
};

export default function SidePanel(props: Props) {
  const {
    cards,
    level,
    activeCard,
    activeClaim,
    analysis,
    newsText,
    loading,
    error,
    onNewsChange,
    onAnalyze,
    onSelectCard,
    onSelectClaim,
    onSetLevel,
    onBack,
    onGoRelated,
    onClearAnalysis,
  } = props;

  const len = newsText.trim().length;
  const lenHint =
    len > 0 && (len < 100 || len > 5000)
      ? `뉴스 본문은 최소 100자, 최대 5,000자입니다. (현재 ${len}자)`
      : null;

  return (
    <aside className="panel">
      <header className="panel-head">
        <div className="brand">
          <p className="brand-name">뉴스 뒷맥락</p>
          <p className="brand-sub">사건의 뿌리와 지정학 고리</p>
        </div>
        {level !== "L0" && (
          <button type="button" className="btn-ghost" onClick={onBack}>
            ← 뒤로
          </button>
        )}
      </header>

      {level !== "L0" && activeCard && (
        <nav className="level-nav" aria-label="심화 단계">
          {(
            [
              ["L1", "개요"],
              ["L2", "고리"],
              ["L3", "근거"],
              ["L4", "연결"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={level === id ? "level-btn on" : "level-btn"}
              onClick={() => onSetLevel(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      <div className="panel-body">
        {level === "L0" && (
          <>
            <section className="block">
              <h2>뉴스 붙여넣기</h2>
              <p className="muted block-lead">
                본문을 넣으면 4단 해설과 맞는 네트워크 카드로 연결합니다.
              </p>
              <textarea
                value={newsText}
                onChange={(e) => onNewsChange(e.target.value)}
                placeholder="뉴스 본문을 붙여넣어 주세요 (100~5,000자)"
                rows={6}
                maxLength={5000}
              />
              <p className="char-count">{len} / 5,000</p>
              {lenHint && <p className="warn">{lenHint}</p>}
              {error && <p className="warn">{error}</p>}
              <div className="row">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={loading || !!lenHint || len === 0}
                  onClick={onAnalyze}
                >
                  {loading ? "해설 생성 중…" : "해설 생성"}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => onNewsChange(EXAMPLE_NEWS)}
                >
                  예시 뉴스
                </button>
              </div>
              {loading && (
                <p className="muted loading-hint">
                  배경을 푸는 중입니다. 최대 30초 걸릴 수 있습니다.
                </p>
              )}
            </section>

            {analysis && analysis.isNews && (
              <AnalysisBlock
                analysis={analysis}
                cards={cards}
                onOpenCard={onSelectCard}
                onClear={onClearAnalysis}
              />
            )}
            {analysis && !analysis.isNews && (
              <p className="warn">
                {analysis.rejectionReason || "뉴스 본문을 붙여넣어 주세요"}
              </p>
            )}

            <section className="block">
              <h2>네트워크 카드</h2>
              <p className="muted block-lead">
                카드 {cards.length}개 · 골라서 지구본에서 고리를 따라가 보세요.
              </p>
              <ul className="card-list">
                {cards.map((c, i) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="card-btn"
                      onClick={() => onSelectCard(c)}
                    >
                      <span className="card-index">{String(i + 1).padStart(2, "0")}</span>
                      <span className="card-copy">
                        <span className="card-title">{c.name}</span>
                        <span className="card-sum">{c.summary}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {level === "L1" && activeCard && (
          <section className="block">
            <h2>{activeCard.name}</h2>
            <p className="lead">{activeCard.summary}</p>
            {analysis?.isNews &&
              analysis.networkPositions.some(
                (p) => p.cardId === activeCard.id,
              ) && (
                <div className="callout-box">
                  <strong>이 뉴스의 위치</strong>
                  <p>
                    {
                      analysis.networkPositions.find(
                        (p) => p.cardId === activeCard.id,
                      )?.oneLiner
                    }
                  </p>
                </div>
              )}
            {analysis?.isNews && (
              <div className="four-sections">
                <article>
                  <h3>1. 지금 무슨 일이야</h3>
                  <p>{analysis.sections.whatNow}</p>
                </article>
                <article>
                  <h3>2. 뿌리</h3>
                  <p>{analysis.sections.roots}</p>
                </article>
                <article>
                  <h3>3. 누가 뭘 원하나</h3>
                  <p>{analysis.sections.motives}</p>
                </article>
                <article>
                  <h3>4. 시장에 닿는 경로</h3>
                  <p>{analysis.sections.marketPaths}</p>
                </article>
              </div>
            )}
            {!analysis?.isNews && (
              <div className="four-sections">
                <article>
                  <h3>네트워크 요약</h3>
                  <p>{activeCard.summary}</p>
                </article>
                <article>
                  <h3>단정 금지</h3>
                  <ul>
                    {activeCard.doNotAssert.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <h3>시장 접점 후보</h3>
                  <p>{activeCard.marketTouchpoints.join(" · ")}</p>
                </article>
              </div>
            )}
            {analysis?.isNews && (
              <div className="cred">
                <h3>기사 신뢰도 점검</h3>
                <p>
                  <span>원천</span> {analysis.credibility.source}
                </p>
                <p>
                  <span>주장 구분</span> {analysis.credibility.claimType}
                </p>
                <p>
                  <span>반대편 입장</span>{" "}
                  {analysis.credibility.opposingViews}
                </p>
              </div>
            )}
            <button
              type="button"
              className="btn-primary wide"
              onClick={() => onSetLevel("L2")}
            >
              고리 목록 보기
            </button>
          </section>
        )}

        {level === "L2" && activeCard && (
          <section className="block">
            <h2>고리</h2>
            <p className="muted">고리를 누르면 지구본 씬이 바뀝니다.</p>
            <ul className="claim-list">
              {activeCard.claims.map((claim) => (
                <li key={claim.id}>
                  <button
                    type="button"
                    className={
                      activeClaim?.id === claim.id
                        ? "claim-btn on"
                        : "claim-btn"
                    }
                    onClick={() => onSelectClaim(claim)}
                  >
                    <span className={TAG_CLASS[claim.tag] || "tag"}>
                      {claim.tag}
                    </span>
                    <span className="claim-text">{claim.text}</span>
                  </button>
                </li>
              ))}
            </ul>
            {activeClaim && (
              <button
                type="button"
                className="btn-primary wide"
                onClick={() => onSetLevel("L3")}
              >
                이 고리의 근거 보기
              </button>
            )}
          </section>
        )}

        {level === "L3" && activeCard && activeClaim && (
          <section className="block">
            <h2>근거</h2>
            <p className="lead">{activeClaim.text}</p>
            <div className="meta-row">
              <span className={TAG_CLASS[activeClaim.tag] || "tag"}>
                {activeClaim.tag}
              </span>
              <span className="grade">등급 {activeClaim.grade}</span>
            </div>
            <h3>출처</h3>
            <ul className="sources">
              {activeClaim.sources.map((s) => (
                <li key={s.id}>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noreferrer">
                      {s.label}
                    </a>
                  ) : (
                    s.label
                  )}
                </li>
              ))}
            </ul>
            <ClaimRssLookup querySeed={activeClaim.text} />
            {activeClaim.counterClaim && (
              <>
                <h3>반대·상충 주장</h3>
                <p>{activeClaim.counterClaim}</p>
              </>
            )}
            <div className="caveat">
              <strong>단정 금지</strong>
              <p>{activeClaim.caveat}</p>
            </div>
            {activeClaim.scene.asOf && (
              <p className="muted">기준일 {activeClaim.scene.asOf}</p>
            )}
            <button
              type="button"
              className="btn-primary wide"
              onClick={() => onSetLevel("L4")}
            >
              연결 보기
            </button>
          </section>
        )}

        {level === "L4" && activeCard && (
          <section className="block">
            <h2>연결</h2>
            <h3>관련 카드</h3>
            <ul className="related">
              {activeCard.relatedCardIds.map((id) => {
                const related = cards.find((c) => c.id === id);
                if (!related) return null;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className="card-btn"
                      onClick={() => onGoRelated(id)}
                    >
                      <span className="card-title">{related.name}</span>
                      <span className="card-sum">{related.summary}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <h3>시장 접점 후보</h3>
            <p className="muted">가능성만. 투자 조언이 아닙니다.</p>
            <ul>
              {activeCard.marketTouchpoints.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <footer className="disclaimer">
        투자 조언이 아니며 AI가 틀릴 수 있습니다. 종목 추천·매수·매도 의견은
        제공하지 않습니다.
      </footer>
    </aside>
  );
}

function AnalysisBlock({
  analysis,
  cards,
  onOpenCard,
  onClear,
}: {
  analysis: AnalysisResult;
  cards: NetworkCard[];
  onOpenCard: (c: NetworkCard) => void;
  onClear: () => void;
}) {
  return (
    <section className="block analysis-result">
      <div className="row between">
        <h2>해설 결과</h2>
        <button type="button" className="btn-ghost" onClick={onClear}>
          닫기
        </button>
      </div>
      <div className="four-sections">
        <article>
          <h3>1. 지금 무슨 일이야</h3>
          <p>{analysis.sections.whatNow}</p>
        </article>
        <article>
          <h3>2. 뿌리</h3>
          <p>{analysis.sections.roots}</p>
        </article>
        <article>
          <h3>3. 누가 뭘 원하나</h3>
          <p>{analysis.sections.motives}</p>
        </article>
        <article>
          <h3>4. 시장에 닿는 경로</h3>
          <p>{analysis.sections.marketPaths}</p>
        </article>
      </div>
      <div className="callout-box">
        <strong>네트워크 위치</strong>
        {analysis.networkPositions.map((p, i) => (
          <p key={i}>
            {p.oneLiner}
            {p.cardId && (
              <>
                {" "}
                <button
                  type="button"
                  className="linkish"
                  onClick={() => {
                    const c = cards.find((x) => x.id === p.cardId);
                    if (c) onOpenCard(c);
                  }}
                >
                  카드 열기
                </button>
              </>
            )}
          </p>
        ))}
      </div>
      <div className="cred">
        <h3>기사 신뢰도 점검</h3>
        <p>
          <span>원천</span> {analysis.credibility.source}
        </p>
        <p>
          <span>주장 구분</span> {analysis.credibility.claimType}
        </p>
        <p>
          <span>반대편 입장</span> {analysis.credibility.opposingViews}
        </p>
      </div>
      {analysis.relatedSources && analysis.relatedSources.length > 0 && (
        <RelatedSourcesList
          items={analysis.relatedSources}
          query={analysis.relatedSourcesQuery}
        />
      )}
    </section>
  );
}

function RelatedSourcesList({
  items,
  query,
}: {
  items: GoogleNewsHit[];
  query?: string;
}) {
  return (
    <div className="related-rss">
      <h3>관련 보도 (Google News)</h3>
      {query && <p className="muted rss-query">검색: {query}</p>}
      <p className="muted">헤드라인·링크만 모읍니다. 교차검증 완료가 아닙니다.</p>
      <ul className="sources">
        {items.map((item) => (
          <li key={item.link}>
            <a href={item.link} target="_blank" rel="noreferrer">
              {item.title}
            </a>
            <span className="rss-meta">{item.source}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ClaimRssLookup({ querySeed }: { querySeed: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<GoogleNewsHit[] | null>(null);
  const [query, setQuery] = useState<string | undefined>();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/sources?q=${encodeURIComponent(querySeed)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "관련 보도를 가져오지 못했습니다.");
        setItems([]);
        return;
      }
      setQuery(data.query);
      setItems(data.items || []);
    } catch {
      setError("네트워크 오류가 났습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="related-rss">
      <button
        type="button"
        className="btn-ghost wide"
        disabled={loading}
        onClick={load}
      >
        {loading ? "관련 보도 검색 중…" : "Google News에서 관련 보도 찾기"}
      </button>
      {error && <p className="warn">{error}</p>}
      {items && items.length > 0 && (
        <RelatedSourcesList items={items} query={query} />
      )}
      {items && items.length === 0 && !error && (
        <p className="muted">관련 보도를 찾지 못했습니다.</p>
      )}
    </div>
  );
}
