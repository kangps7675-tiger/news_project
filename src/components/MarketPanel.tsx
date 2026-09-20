"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type QuoteRow = {
  symbol: string;
  label: string;
  why: string;
  kind: string;
  unit: string | null;
  lastPrice: string | null;
  changePct: number | null;
  movePct: number | null;
  spark?: number[];
  timestamp: string | null;
  fredUrl?: string;
};

type MarketPayload = {
  ok: boolean;
  configured: boolean;
  source?: string;
  message?: string;
  disclaimer?: string;
  layer?: { title: string; blurb: string; cardId?: string | null } | null;
  quotes: QuoteRow[];
  indicators: QuoteRow[];
  fx: { rate: string; timestamp?: string; movePct?: number | null } | null;
};

type Props = {
  cardId: string | null;
};

function formatChange(pct: number | null | undefined) {
  if (pct == null) return null;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function chgClass(pct: number | null | undefined) {
  if (pct == null) return "chg";
  if (pct > 0) return "chg up";
  if (pct < 0) return "chg down";
  return "chg";
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
        message: "자산 움직임을 못 가져왔어요. 다시 눌러 주세요.",
        quotes: [],
        indicators: [],
        fx: null,
      });
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 5 * 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  const movers = useMemo(() => {
    const rows = data?.quotes?.length ? data.quotes : data?.indicators || [];
    return [...rows]
      .filter((r) => r.movePct != null)
      .sort((a, b) => Math.abs(b.movePct!) - Math.abs(a.movePct!));
  }, [data]);

  return (
    <section className="market-panel block">
      <div className="row between">
        <h2>사안 ↔ 자산 움직임</h2>
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
        각 이야기가 닿는 자산이 <strong>최근 어떻게 움직였는지</strong> 눈으로
        봐요. “사라/팔라”가 아니라 참고용이에요. 출처는 FRED예요.
      </p>

      {data?.message && <p className="warn">{data.message}</p>}

      {data?.layer && (
        <div className="market-focus">
          <h3>{data.layer.title}</h3>
          <p className="muted">{data.layer.blurb}</p>
        </div>
      )}

      {movers.length > 0 && (
        <div className="market-section">
          <h3>{cardId ? "이 사안에서 눈에 띄는 움직임" : "최근 움직임"}</h3>
          <ul className="asset-move-list">
            {(data?.quotes?.length ? data.quotes : movers).map((row) => (
              <AssetMoveRow key={`m-${row.symbol}-${row.label}`} row={row} />
            ))}
          </ul>
        </div>
      )}

      {data?.fx?.rate && (
        <div className="market-chip-row">
          <div className="market-chip">
            <span className="chip-label">원·달러</span>
            <span className="chip-value">{data.fx.rate}</span>
            {data.fx.movePct != null && (
              <span className={chgClass(data.fx.movePct)}>
                {formatChange(data.fx.movePct)}
              </span>
            )}
            <span className="chip-why">
              배경 환율
              {data.fx.timestamp ? ` · ${data.fx.timestamp}` : ""}
            </span>
          </div>
        </div>
      )}

      {data?.indicators && data.indicators.length > 0 && (
        <div className="market-section">
          <h3>배경 온도계</h3>
          <ul className="asset-move-list compact">
            {data.indicators.map((row) => (
              <AssetMoveRow key={`g-${row.symbol}`} row={row} compact />
            ))}
          </ul>
        </div>
      )}

      <p className="disclaimer-inline">
        {data?.disclaimer ||
          "투자 조언이 아니에요. 사안↔자산 연결은 참고용이에요."}
      </p>
    </section>
  );
}

function AssetMoveRow({
  row,
  compact,
}: {
  row: QuoteRow;
  compact?: boolean;
}) {
  const move = row.movePct ?? row.changePct;
  const label = formatChange(move);
  const direction =
    move == null ? "flat" : move > 0.15 ? "up" : move < -0.15 ? "down" : "flat";

  return (
    <li className={`asset-move ${direction}${compact ? " compact" : ""}`}>
      <div className="asset-move-top">
        <div className="asset-move-copy">
          <span className="asset-move-name">
            {row.fredUrl ? (
              <a href={row.fredUrl} target="_blank" rel="noreferrer">
                {row.label}
              </a>
            ) : (
              row.label
            )}
            <span className="market-sym">{row.symbol}</span>
          </span>
          {!compact && <p className="market-why">{row.why}</p>}
        </div>
        <div className="asset-move-nums">
          <span className="market-price">{row.lastPrice ?? "—"}</span>
          {label && <span className={chgClass(move)}>{label}</span>}
        </div>
      </div>
      {row.spark && row.spark.length > 1 && (
        <Sparkline values={row.spark} direction={direction} />
      )}
      <div className="asset-move-meta">
        <span className={`move-pill ${direction}`}>
          {direction === "up"
            ? "최근 상승"
            : direction === "down"
              ? "최근 하락"
              : "거의 보합"}
        </span>
        {row.timestamp && <span className="muted">기준 {row.timestamp}</span>}
      </div>
    </li>
  );
}

function Sparkline({
  values,
  direction,
}: {
  values: number[];
  direction: "up" | "down" | "flat";
}) {
  const w = 160;
  const h = 36;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke =
    direction === "up"
      ? "#9a4a1c"
      : direction === "down"
        ? "#5a6b3a"
        : "#7a6548";

  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
      />
    </svg>
  );
}
