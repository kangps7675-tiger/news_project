import { NextRequest, NextResponse } from "next/server";
import {
  GLOBAL_INDICATORS,
  getMarketLayerForCard,
  type MarketInstrument,
} from "@/data/marketLayers";
import {
  fetchLatestObservations,
  formatFredNumber,
  getFredApiKey,
  pctChange,
  type FredObservation,
} from "@/lib/fred";

function enrich(
  instruments: MarketInstrument[],
  byId: Map<string, FredObservation>,
) {
  return instruments.map((inst) => {
    const obs = byId.get(inst.symbol);
    const dayChange =
      obs != null ? pctChange(obs.value, obs.prevValue) : null;
    const movePct =
      obs?.windowChangePct != null
        ? obs.windowChangePct
        : dayChange;
    return {
      symbol: inst.symbol,
      label: inst.label,
      why: inst.why,
      kind: inst.kind,
      unit: inst.unit ?? null,
      lastPrice:
        obs != null
          ? formatFredNumber(obs.value, {
              digits: inst.digits,
              unit: inst.unit,
            })
          : null,
      rawValue: obs?.value ?? null,
      changePct: dayChange != null ? Number(dayChange.toFixed(2)) : null,
      movePct: movePct != null ? Number(movePct.toFixed(2)) : null,
      spark: (obs?.history || []).map((p) => p.value),
      sparkDates: (obs?.history || []).map((p) => p.date),
      timestamp: obs?.date ?? null,
      prevTimestamp: obs?.prevDate ?? null,
      fredUrl: `https://fred.stlouisfed.org/series/${inst.symbol}`,
    };
  });
}

export async function GET(req: NextRequest) {
  const cardId = req.nextUrl.searchParams.get("cardId");

  if (!getFredApiKey()) {
    return NextResponse.json({
      ok: false,
      configured: false,
      message:
        "자산 움직임을 보려면 .env에 FRED_API_KEY를 넣어 주세요.",
      layer: getMarketLayerForCard(cardId),
      quotes: [],
      indicators: [],
      fx: null,
      source: "FRED",
    });
  }

  try {
    const layer = getMarketLayerForCard(cardId);
    const focus = layer?.instruments ?? [];
    const seriesIds = [
      ...GLOBAL_INDICATORS.map((i) => i.symbol),
      ...focus.map((i) => i.symbol),
    ];
    const byId = await fetchLatestObservations(seriesIds);

    const indicators = enrich(GLOBAL_INDICATORS, byId);
    const quotes = focus.length ? enrich(focus, byId) : [];

    const fxObs = byId.get("DEXKOUS");
    const fx =
      fxObs != null
        ? {
            rate: formatFredNumber(fxObs.value, {
              digits: 2,
              unit: "원/$",
            }),
            timestamp: fxObs.date,
            movePct:
              fxObs.windowChangePct != null
                ? Number(fxObs.windowChangePct.toFixed(2))
                : null,
          }
        : null;

    return NextResponse.json({
      ok: true,
      configured: true,
      source: "FRED",
      layer: layer
        ? { title: layer.title, blurb: layer.blurb, cardId: layer.cardId }
        : {
            title: "사안을 고르면 맞닿는 자산이 보여요",
            blurb:
              "카드를 누르면 그 이야기와 맞닿는 지표가 최근 어떻게 움직였는지 보여 줘요.",
            cardId: null,
          },
      quotes,
      indicators,
      fx,
      disclaimer:
        "투자 조언이 아니에요. 사안↔자산 연결은 참고용이에요. 숫자는 FRED 공개 통계이며 시차·수정이 있을 수 있어요.",
    });
  } catch (err) {
    console.error("[market/fred]", err);
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        source: "FRED",
        message:
          err instanceof Error
            ? err.message
            : "FRED에서 숫자를 못 가져왔어요.",
        quotes: [],
        indicators: [],
        fx: null,
      },
      { status: 502 },
    );
  }
}
