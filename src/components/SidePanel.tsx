"use client";

import { useCallback, useEffect, useState } from "react";
import type { Claim, GoogleNewsHit, NetworkCard } from "@/types";
import MarketPanel from "@/components/MarketPanel";
import VerificationTiers from "@/components/VerificationTiers";
import { MEDIA_TIER_META, classifyMediaTier } from "@/lib/verificationTiers";

export type PanelLevel = "L0" | "L1" | "L2" | "L3" | "L4";

type Props = {
  cards: NetworkCard[];
  level: PanelLevel;
  activeCard: NetworkCard | null;
  activeClaim: Claim | null;
  onSelectCard: (card: NetworkCard) => void;
  onSelectClaim: (claim: Claim) => void;
  onSetLevel: (level: PanelLevel) => void;
  onBack: () => void;
  onGoRelated: (cardId: string) => void;
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
    onSelectCard,
    onSelectClaim,
    onSetLevel,
    onBack,
    onGoRelated,
  } = props;

  return (
    <aside className="panel">
      <header className="panel-head">
        <div className="brand">
          <p className="brand-name">뉴스 뒷맥락</p>
          <p className="brand-sub">실측·공개 자료로 보는 지정학 맵</p>
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
              <h2>어떻게 보면 돼요?</h2>
              <ol className="how-to">
                <li>왼쪽 인텔 맵에서 전쟁·초크포인트·실측 표시를 봐요.</li>
                <li>아래 카드를 눌러 이야기와 FRED 지표를 같이 봐요.</li>
                <li>연결고리·근거에서 출처와 실제 뉴스 URL을 확인해요.</li>
              </ol>
              <p className="muted" style={{ marginTop: "0.5rem" }}>
                AI로 뉴스를 풀어주는 입력창은 없어요. 카드·지도·공개 통계만
                씁니다.
              </p>
            </section>

            <MarketPanel cardId={null} />

            <section className="block">
              <h2>이야기 카드</h2>
              <p className="muted block-lead">
                세계가 얽힌 이야기 {cards.length}장이에요. 하나를 누르면 왼쪽
                맵에서 관련국이 붉게 번져요.
              </p>
              <ul className="card-list">
                {cards.map((c, i) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="card-btn"
                      onClick={() => onSelectCard(c)}
                    >
                      <span className="card-index">
                        {String(i + 1).padStart(2, "0")}
                      </span>
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
              고리를 누르면 왼쪽 맵에 알록달록한 화살표·점이 떠요.
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
                카드에 고정 출처는 아직 없고, 아래 버튼으로 국내·해외 관련
                기사를 바로 찾아요.
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
        투자 조언이 아니에요. 지도·FRED·공개 보도만 참고용이에요. “사라/팔라”는
        절대 안 해요.
      </footer>
    </aside>
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
        한국어·영어 별칭과 여러 나라 뉴스창, T1~T4(관영 포함) 매체로 최근
        한 달 보도를 넓게 모았어요. T4는 당사자 주장 신호로만 봐요. 티어는
        올리지 않아요.
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
        onClick={() => void load()}
      >
        {loading ? "원문 링크 찾는 중…" : title}
      </button>
      {error && <p className="warn">{error}</p>}
      {items && items.length > 0 && (
        <RelatedSourcesList items={items} query={query} />
      )}
      {items && items.length === 0 && !error && (
        <p className="muted">관련 보도를 찾지 못했어요.</p>
      )}
    </div>
  );
}
