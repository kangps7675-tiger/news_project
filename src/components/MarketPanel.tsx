"use client";

import { useCallback, useEffect, useState } from "react";

type QuoteRow = {
  symbol: string;
  label: string;
  why: string;
  kind: string;
  lastPrice: string | null;
  currency: string | null;
  timestamp: string | null;
};

type OrderLevel = { price: string; quantity: string };

type MarketPayload = {
  ok: boolean;
  configured: boolean;
  message?: string;
  disclaimer?: string;
  layer?: { title: string; blurb: string; orderbookSymbol?: string } | null;
  quotes: QuoteRow[];
  indicators: QuoteRow[];
  fx: { rate: string; timestamp?: string } | null;
  orderbook: {
    symbol: string;
    asks?: OrderLevel[];
    bids?: OrderLevel[];
  } | null;
};

type Props = {
  cardId: string | null;
};

function formatPrice(row: QuoteRow) {
  if (row.lastPrice == null) return "—";
  if (row.kind === "bond" || row.currency === "%") return `${row.lastPrice}%`;
  if (row.currency === "USD" || /^[A-Z]{1,5}$/.test(row.symbol)) {
    return `$${row.lastPrice}`;
  }
  if (row.currency === "KRW" || /^\d+$/.test(row.symbol)) {
    const n = Number(row.lastPrice);
    if (!Number.isNaN(n)) return `${n.toLocaleString("ko-KR")}원`;
  }
  return row.lastPrice;
}

export default function MarketPanel({ cardId }: Props) {
  const [data, setData] = useState<MarketPayload | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = cardId ? `?cardId=${encodeURIComponent(cardId)}` : "";
      const res = await fetch(`/api/market${q}`);
      const json = (await res.json()) as MarketPayload;
      setData(json);
    } catch {
      setData({
        ok: false,
        configured: true,
        message: "시세를 못 가져왔어요. 인터넷을 확인하거나 다시 눌러 주세요.",
        quotes: [],
        indicators: [],
        fx: null,
        orderbook: null,
      });
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  return (
    <section className="market-panel block">
      <div className="row between">
        <h2>시장 온도계</h2>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? "읽는 중…" : "새로고침"}
        </button>
      </div>
      <p className="muted block-lead">
        뉴스 옆에 붙여 두는 <strong>참고용 숫자</strong>예요. “사라/팔라”가
        아니에요. 토스증권 Open API로 가져와요.
      </p>

      {data?.message && <p className="warn">{data.message}</p>}

      {data?.fx?.rate && (
        <div className="market-chip-row">
          <div className="market-chip">
            <span className="chip-label">원·달러</span>
            <span className="chip-value">{data.fx.rate}</span>
            <span className="chip-why">달러 1개가 몇 원인지예요.</span>
          </div>
        </div>
      )}

      {data?.indicators && data.indicators.length > 0 && (
        <div className="market-section">
          <h3>큰 그림 지표</h3>
          <ul className="market-list">
            {data.indicators.map((row) => (
              <li key={row.symbol}>
                <div className="market-row-main">
                  <span className="market-name">{row.label}</span>
                  <span className="market-price">{formatPrice(row)}</span>
                </div>
                <p className="market-why">{row.why}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data?.layer && (
        <div className="market-section">
          <h3>{data.layer.title}</h3>
          <p className="muted">{data.layer.blurb}</p>
        </div>
      )}

      {data?.quotes && data.quotes.length > 0 && (
        <div className="market-section">
          <h3>관련 종목·ETF</h3>
          <ul className="market-list">
            {data.quotes.map((row) => (
              <li key={`${row.symbol}-${row.label}`}>
                <div className="market-row-main">
                  <span className="market-name">
                    {row.label}
                    <span className="market-sym">{row.symbol}</span>
                  </span>
                  <span className="market-price">{formatPrice(row)}</span>
                </div>
                <p className="market-why">{row.why}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data?.orderbook && (
        <div className="market-section">
          <h3>호가창 미리보기 · {data.orderbook.symbol}</h3>
          <p className="muted">
            사는 사람(아래)과 파는 사람(위)이 적어 둔 가격표예요. 위·아래가
            좁을수록 “지금 바로 거래하기 쉽다”에 가까워요.
          </p>
          <div className="orderbook">
            <div className="ob-col ask">
              <span className="ob-title">팔래요</span>
              {(data.orderbook.asks || []).slice(0, 5).map((a, i) => (
                <div key={`a-${i}`} className="ob-row">
                  <span>{a.price}</span>
                  <span>{a.quantity}</span>
                </div>
              ))}
            </div>
            <div className="ob-col bid">
              <span className="ob-title">살래요</span>
              {(data.orderbook.bids || []).slice(0, 5).map((b, i) => (
                <div key={`b-${i}`} className="ob-row">
                  <span>{b.price}</span>
                  <span>{b.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="disclaimer-inline">
        {data?.disclaimer ||
          "투자 조언이 아니에요. 숫자만 보여주는 참고용이에요."}
      </p>
    </section>
  );
}
