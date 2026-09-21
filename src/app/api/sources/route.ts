import { NextRequest, NextResponse } from "next/server";
import { fetchRelatedNews } from "@/lib/googleNewsRss";
import { classifyMediaTier } from "@/lib/verificationTiers";

export const maxDuration = 60;

const MAX_Q = 400;

export async function GET(req: NextRequest) {
  try {
    const raw = (req.nextUrl.searchParams.get("q") || "").slice(0, MAX_Q);

    if (raw.trim().length < 2) {
      return NextResponse.json(
        { error: "검색어가 너무 짧아요.", items: [], query: raw },
        { status: 400 },
      );
    }

    const { query, items } = await fetchRelatedNews(raw, 24);
    const withTier = items.map((item) => ({
      ...item,
      // URL·매체명으로 재확인. 이미 붙은 티어도 덮어써 승격/강등 방지
      mediaTier: classifyMediaTier(item.source, item.url || item.link),
    }));

    return NextResponse.json({
      query,
      items: withTier,
      note: "주제와 정확히 맞는 영문 보도를 깊게 모은 뒤, 제목은 한글로 번역해 보여 줘요.",
    });
  } catch (err) {
    console.error("[sources]", err);
    return NextResponse.json(
      {
        error: "관련 보도를 가져오지 못했어요. 잠시 뒤 다시 눌러 주세요.",
        items: [],
      },
      { status: 502 },
    );
  }
}
