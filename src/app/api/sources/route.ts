import { NextRequest, NextResponse } from "next/server";
import {
  buildSearchQuery,
  fetchGoogleNewsRss,
} from "@/lib/googleNewsRss";
import { classifyMediaTier } from "@/lib/verificationTiers";

const MAX_Q = 200;

export async function GET(req: NextRequest) {
  try {
    const raw = req.nextUrl.searchParams.get("q") || "";
    const query = buildSearchQuery(raw.slice(0, MAX_Q));

    if (query.length < 2) {
      return NextResponse.json(
        { error: "검색어가 너무 짧아요.", items: [], query },
        { status: 400 },
      );
    }

    const items = await fetchGoogleNewsRss(query, 8);
    const withTier = items.map((item) => ({
      ...item,
      mediaTier: classifyMediaTier(item.source),
    }));

    return NextResponse.json({
      query,
      items: withTier,
      note: "원문 URL을 우선 열고, 본문은 저장하지 않아요.",
    });
  } catch (err) {
    console.error("[sources]", err);
    return NextResponse.json(
      {
        error: "관련 보도를 가져오지 못했어요.",
        items: [],
      },
      { status: 502 },
    );
  }
}
