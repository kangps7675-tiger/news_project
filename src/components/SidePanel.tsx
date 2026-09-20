"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AnalysisResult,
  Claim,
  GoogleNewsHit,
  NetworkCard,
} from "@/types";
import { EXAMPLE_NEWS } from "@/data/cards";
import MarketPanel from "@/components/MarketPanel";
import VerificationTiers from "@/components/VerificationTiers";
import { MEDIA_TIER_META, classifyMediaTier } from "@/lib/verificationTiers";

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
      ? `글자가 너무 짧거나 길어요. 100~5,000자여야 해요. (지금 ${len}자)`
      : null;

  return (
    <aside className="panel">
      <header className="panel-head">
        <div className="brand">
          <p className="brand-name">뉴스 뒷맥락</p>
          <p className="brand-sub">뉴스 뒤에 숨은 이야기를, 쉽게</p>
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
              ["L1", "한눈에"],
              ["L2", "연결고리"],
              ["L3", "근거"],
              ["L4", "이어보기"],
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
            <section className="block tip-box">
              <h2>어떻게 쓰면 돼요?</h2>
              <ol className="how-to">
                <li>뉴스를 붙여넣고 ‘쉽게 풀어줘’를 눌러요.</li>
                <li>왼쪽 지구본에서 나라가 블록처럼 솟아올라요.</li>
                <li>아래 카드를 눌러 이야기를 더 깊게 봐요.</li>
              </ol>
            </section>

            <section className="block">
              <h2>뉴스 붙여넣기</h2>
              <p className="muted block-lead">
                어려운 뉴스를 넣으면, “그래서 뭐가 중요한데?”를 네 칸으로
                풀어줘요.
              </p>
              <textarea
                value={newsText}
                onChange={(e) => onNewsChange(e.target.value)}
                placeholder="뉴스 본문을 여기에 붙여넣어요 (100~5,000자)"
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
                  {loading ? "읽는 중…" : "쉽게 풀어줘"}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => onNewsChange(EXAMPLE_NEWS)}
                >
                  예시 넣어보기
                </button>
              </div>
              {loading && (
                <p className="muted loading-hint">
                  배경 이야기를 찾는 중이에요. 커피 한 모금 마실 시간…
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
                {analysis.rejectionReason ||
                  "뉴스처럼 보이는 글을 붙여넣어 주세요"}
              </p>
            )}

            <MarketPanel cardId={null} />

            <section className="block">
              <h2>이야기 카드</h2>
              <p className="muted block-lead">
                세계가 얽힌 이야기 {cards.length}장이에요. 하나를 누르면 왼쪽
                지도가 그 나라들을 블록처럼 들어 올려요.
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
                  <strong>이 뉴스가 꽂힌 자리</strong>
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
                  <h3>1. 지금 무슨 일이야?</h3>
                  <p>{analysis.sections.whatNow}</p>
                </article>
                <article>
                  <h3>2. 뿌리는 뭐야?</h3>
                  <p>{analysis.sections.roots}</p>
                </article>
                <article>
                  <h3>3. 누가 뭘 원해?</h3>
                  <p>{analysis.sections.motives}</p>
                </article>
                <article>
                  <h3>4. 시장에 닿을 수 있는 길</h3>
                  <p>{analysis.sections.marketPaths}</p>
                </article>
              </div>
            )}
            {!analysis?.isNews && (
              <div className="four-sections">
                <article>
                  <h3>한 줄로 말하면</h3>
                  <p>{activeCard.summary}</p>
                </article>
                <article>
                  <h3>함부로 말하면 안 되는 것</h3>
                  <ul>
                    {activeCard.doNotAssert.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <h3>시장 쪽 힌트 (가능성만)</h3>
                  <p>{activeCard.marketTouchpoints.join(" · ")}</p>
                </article>
              </div>
            )}
            {analysis?.isNews && (
              <div className="cred">
                <h3>이 기사, 얼마나 믿을까?</h3>
                <p>
                  <span>어디서 왔어요</span> {analysis.credibility.source}
                </p>
                <p>
                  <span>무슨 종류의 말</span> {analysis.credibility.claimType}
                </p>
                <p>
                  <span>반대쪽 이야기도?</span>{" "}
                  {analysis.credibility.opposingViews}
                </p>
              </div>
            )}
            <MarketPanel cardId={activeCard.id} />
            <button
              type="button"
              className="btn-primary wide"
              onClick={() => onSetLevel("L2")}
            >
              연결고리 더 보기
            </button>
          </section>
        )}

        {level === "L2" && activeCard && (
          <section className="block">
            <h2>연결고리</h2>
            <p className="muted">
              고리를 누르면 왼쪽 지구본에 화살표가 블록처럼 솟아올라요.
            </p>
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
              <>
                <VerificationTiers
                  tag={activeClaim.tag}
                  grade={activeClaim.grade}
                  sourceName={activeClaim.sources[0]?.label}
                />
                <button
                  type="button"
                  className="btn-primary wide"
                  onClick={() => onSetLevel("L3")}
                >
                  이 고리, 근거 보기
                </button>
              </>
            )}
          </section>
        )}

        {level === "L3" && activeCard && activeClaim && (
          <section className="block">
            <h2>근거 살펴보기</h2>
            <p className="lead">{activeClaim.text}</p>
            <VerificationTiers
              tag={activeClaim.tag}
              grade={activeClaim.grade}
              sourceName={activeClaim.sources[0]?.label}
            />
            <h3>카드에 적힌 출처</h3>
            {activeClaim.sources.length > 0 ? (
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
            ) : (
              <p className="muted">
                카드에 고정 출처는 아직 없고, 아래 버튼으로 국내·해외 관련 기사를
                바로 찾아요.
              </p>
            )}
            <ClaimRssLookup querySeed={activeClaim.text} autoStart />
            {activeClaim.counterClaim && (
              <>
                <h3>반대·상충 주장</h3>
                <p>{activeClaim.counterClaim}</p>
              </>
            )}
            <div className="caveat">
              <strong>조심! 단정 금지</strong>
              <p>{activeClaim.caveat}</p>
            </div>
            {activeClaim.scene.asOf && (
              <p className="muted">기준 날짜 {activeClaim.scene.asOf}</p>
            )}
            <button
              type="button"
              className="btn-primary wide"
              onClick={() => onSetLevel("L4")}
            >
              다른 이야기와 이어보기
            </button>
          </section>
        )}

        {level === "L4" && activeCard && (
          <section className="block">
            <h2>이어보기</h2>
            <h3>비슷한 이야기 카드</h3>
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
                      <span className="card-copy">
                        <span className="card-title">{related.name}</span>
                        <span className="card-sum">{related.summary}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <h3>시장 쪽 힌트 (가능성만)</h3>
            <p className="muted">사라는 뜻이 아니에요. 관심 분야 힌트예요.</p>
            <ul>
              {activeCard.marketTouchpoints.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            <MarketPanel cardId={activeCard.id} />
          </section>
        )}
      </div>

      <footer className="disclaimer">
        투자 조언이 아니에요. AI도 틀릴 수 있어요. “사라/팔라”는 절대 안 해요.
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
        <h2>쉽게 풀어본 결과</h2>
        <button type="button" className="btn-ghost" onClick={onClear}>
          닫기
        </button>
      </div>
      <div className="four-sections">
        <article>
          <h3>1. 지금 무슨 일이야?</h3>
          <p>{analysis.sections.whatNow}</p>
        </article>
        <article>
          <h3>2. 뿌리는 뭐야?</h3>
          <p>{analysis.sections.roots}</p>
        </article>
        <article>
          <h3>3. 누가 뭘 원해?</h3>
          <p>{analysis.sections.motives}</p>
        </article>
        <article>
          <h3>4. 시장에 닿을 수 있는 길</h3>
          <p>{analysis.sections.marketPaths}</p>
        </article>
      </div>
      <div className="callout-box">
        <strong>어느 이야기 카드에 꽂히나요?</strong>
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
        <VerificationTiers
          sourceName={analysis.credibility.source}
          compact
        />
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
      {analysis.relatedSources && analysis.relatedSources.length > 0 ? (
        <RelatedSourcesList
          items={analysis.relatedSources}
          query={analysis.relatedSourcesQuery}
        />
      ) : (
        <ClaimRssLookup
          querySeed={
            analysis.relatedSourcesQuery ||
            analysis.sections.whatNow ||
            "지정학 뉴스"
          }
          autoStart
          title="관련 뉴스 불러오기"
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
      <h3>관련 뉴스 (T1~T4)</h3>
      {query && <p className="muted rss-query">검색: {query}</p>}
      <p className="muted">
        각국 매체와 관영·권위주의(T4)까지 티어 목록으로 모았어요. T4는 당사자
        주장 신호로만 봐요. 티어는 올리지 않아요.
      </p>
      <ul className="sources news-url-list">
        {items.map((item) => {
          const href = item.url || item.link;
          const tier =
            (item.mediaTier as keyof typeof MEDIA_TIER_META) ||
            classifyMediaTier(item.source, href);
          const meta = MEDIA_TIER_META[tier] || MEDIA_TIER_META.TX;
          return (
            <li key={href + item.title}>
              <a href={href} target="_blank" rel="noreferrer">
                {item.title}
              </a>
              <span className="rss-meta">
                <span
                  className="tier-mini"
                  style={{ background: meta.color }}
                  title={meta.tip}
                >
                  {meta.short}
                </span>
                <span className="tier-label-mini">{meta.label}</span>
                {item.source}
              </span>
              <span className="rss-url">{href}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ClaimRssLookup({
  querySeed,
  autoStart = false,
  title = "관련 뉴스 불러오기",
}: {
  querySeed: string;
  autoStart?: boolean;
  title?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<GoogleNewsHit[] | null>(null);
  const [query, setQuery] = useState<string | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/sources?q=${encodeURIComponent(querySeed)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error ||
            "잠시 막혔어요. 다시 누르면 T1~T4 매체를 다시 찾아요.",
        );
        setItems(null);
        return;
      }
      setQuery(data.query);
      const next = (data.items || []) as GoogleNewsHit[];
      setItems(next);
      if (next.length === 0) {
        setError(null);
      }
    } catch {
      setError("네트워크가 잠깐 끊겼어요. 다시 눌러 주세요.");
      setItems(null);
    } finally {
      setLoading(false);
    }
  }, [querySeed]);

  useEffect(() => {
    if (!autoStart || !querySeed.trim()) return;
    void load();
  }, [autoStart, querySeed, load]);

  return (
    <div className="related-rss">
      <button
        type="button"
        className="btn-ghost wide"
        disabled={loading}
        onClick={load}
      >
        {loading ? "T1~T4 매체 찾는 중…" : title}
      </button>
      {error && <p className="warn">{error}</p>}
      {items && items.length > 0 && (
        <RelatedSourcesList items={items} query={query} />
      )}
      {items && items.length === 0 && !error && !loading && (
        <p className="muted">
          이번 검색어로는 바로 안 잡혔어요. 버튼을 한 번 더 누르면 더 넓은
          키워드로 다시 찾아요.
        </p>
      )}
    </div>
  );
}
