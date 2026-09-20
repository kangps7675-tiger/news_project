import { NextRequest, NextResponse } from "next/server";
import {
  CARD_MARKET_LAYERS,
  GLOBAL_INDICATORS,
  getMarketLayerForCard,
} from "@/data/marketLayers";
import {
  fetchOrderbook,
  fetchPrices,
  fetchUsdKrw,
  getTossCredentials,
} from "@/lib/toss";

export async function GET(req: NextRequest) {
  const cardId = req.nextUrl.searchParams.get("cardId");
  const wantBook = req.nextUrl.searchParams.get("orderbook") !== "0";

  if (!getTossCredentials()) {
    return NextResponse.json({
      ok: false,
      configured: false,
      message:
        "토스 시세를 보려면 .env에 TOSS_CLIENT_ID와 TOSS_OPEN_API_KEY(또는 TOSS_CLIENT_SECRET)가 둘 다 필요해요. 지금은 비밀키만 있어요.",
      layer: getMarketLayerForCard(cardId),
      quotes: [],
      indicators: [],
      fx: null,
      orderbook: null,
    });
  }

  try {
    const layer = getMarketLayerForCard(cardId);
    const instruments = [
      ...GLOBAL_INDICATORS,
      ...(layer?.instruments || CARD_MARKET_LAYERS[0].instruments),
    ];
    const symbols = instruments.map((i) => i.symbol);
    const [quotes, fx] = await Promise.all([
      fetchPrices(symbols),
      fetchUsdKrw().catch(() => null),
    ]);

    let orderbook = null;
    const bookSymbol = layer?.orderbookSymbol;
    if (wantBook && bookSymbol) {
      orderbook = await fetchOrderbook(bookSymbol).catch(() => null);
    }

    const bySymbol = new Map(quotes.map((q) => [q.symbol, q]));
    const enriched = instruments.map((inst) => {
      const q = bySymbol.get(inst.symbol);
      return {
        ...inst,
        lastPrice: q?.lastPrice ?? null,
        currency: q?.currency ?? (inst.kind === "bond" ? "%" : null),
        timestamp: q?.timestamp ?? null,
      };
    });

    return NextResponse.json({
      ok: true,
      configured: true,
      layer,
      quotes: enriched.filter((e) => e.kind === "stock" || e.kind === "etf"),
      indicators: enriched.filter(
        (e) => e.kind === "index" || e.kind === "bond",
      ),
      fx,
      orderbook,
      disclaimer:
        "투자 조언이 아니에요. 숫자만 보여주는 참고용이에요. AI·시세 모두 틀릴 수 있어요.",
    });
  } catch (err) {
    console.error("[market]", err);
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        message:
          err instanceof Error
            ? err.message
            : "시세를 가져오지 못했어요. 잠시 뒤 다시 눌러 보세요.",
        quotes: [],
        indicators: [],
        fx: null,
        orderbook: null,
      },
      { status: 502 },
    );
  }
}
