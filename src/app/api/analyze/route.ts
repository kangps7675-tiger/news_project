import { NextRequest, NextResponse } from "next/server";
import { analyzeNews } from "@/lib/gemini";
import { fetchRelatedNews } from "@/lib/googleNewsRss";
import { checkRateLimit, hashIp } from "@/lib/rateLimit";
import { logAnalysisEvent } from "@/lib/supabase";
import { classifyMediaTier } from "@/lib/verificationTiers";

const MIN = 100;
const MAX = 5000;

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const limit = checkRateLimit(ip);
    if (!limit.ok) {
      return NextResponse.json(
        { error: limit.reason },
        {
          status: 429,
          headers: limit.retryAfterSec
            ? { "Retry-After": String(limit.retryAfterSec) }
            : undefined,
        },
      );
    }

    const body = await req.json();
    const raw = typeof body?.text === "string" ? body.text : "";
    const text = raw.trim().slice(0, MAX);

    if (text.length < MIN) {
      return NextResponse.json(
        {
          error: `뉴스 본문은 최소 ${MIN}자, 최대 ${MAX}자입니다. (현재 ${text.length}자)`,
        },
        { status: 400 },
      );
    }

    const [analysis, relatedPack] = await Promise.all([
      analyzeNews(text),
      fetchRelatedNews(text, 12).catch((err) => {
        console.warn("[analyze] google rss", err);
        return { query: "", items: [] };
      }),
    ]);

    if (analysis.isNews) {
      analysis.relatedSources = relatedPack.items.map((item) => ({
        ...item,
        mediaTier: classifyMediaTier(item.source, item.url || item.link),
      }));
      analysis.relatedSourcesQuery = relatedPack.query;
    }

    const ipHash = await hashIp(ip);
    const matched = (analysis.networkPositions || [])
      .map((p) => p.cardId)
      .filter(Boolean) as string[];

    await logAnalysisEvent({
      ipHash,
      inputLength: text.length,
      matchedCardIds: matched,
      ok: analysis.isNews,
      error: analysis.isNews ? undefined : analysis.rejectionReason,
    });

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("[analyze]", err);
    const message =
      err instanceof Error ? err.message : "해설 생성에 실패했습니다.";
    try {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      await logAnalysisEvent({
        ipHash: await hashIp(ip),
        inputLength: 0,
        matchedCardIds: [],
        ok: false,
        error: message,
      });
    } catch {
      /* ignore */
    }
    return NextResponse.json(
      { error: "해설 생성에 실패했습니다. 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
