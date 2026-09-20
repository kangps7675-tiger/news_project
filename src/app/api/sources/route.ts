import { NextRequest, NextResponse } from "next/server";
import {
  buildSearchQuery,
  fetchGoogleNewsRss,
} from "@/lib/googleNewsRss";

const MAX_Q = 200;

export async function GET(req: NextRequest) {
  try {
    const raw = req.nextUrl.searchParams.get("q") || "";
    const query = buildSearchQuery(raw.slice(0, MAX_Q));

    if (query.length < 2) {
      return NextResponse.json(
        { error: "검색어가 너무 짧습니다.", items: [], query },
        { status: 400 },
      );
    }

    const items = await fetchGoogleNewsRss(query, 8);
    return NextResponse.json({
      query,
      items,
      note: "헤드라인·링크만 수집합니다. 본문은 저장하지 않습니다.",
    });
  } catch (err) {
    console.error("[sources]", err);
    return NextResponse.json(
      {
        error: "관련 보도를 가져오지 못했습니다.",
        items: [],
      },
      { status: 502 },
    );
  }
}
