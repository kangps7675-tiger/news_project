import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCardSummariesForPrompt } from "@/data/cards";
import type { AnalysisResult } from "@/types";

const SYSTEM = `당신은 '뉴스 뒷맥락' 해설기다. 주식을 막 시작한 사람이 붙여넣은 뉴스의 배경을 설명한다.
반드시 JSON만 출력한다. 마크다운 코드펜스 금지.

톤 규칙 (초등학생에게 설명하듯, 하지만 존중하며):
- 쉬운 말 우선. 비유를 한 번 써도 좋다 (예: "해협은 바다의 좁은 문이에요")
- 전문용어·약어는 처음 나올 때 괄호로 쉬운 뜻을 붙인다
- 추상적 요약 대신 누가 무엇을 하는지 구체적으로 쓴다
- 4단(시장 경로)은 가능성으로만 쓰고 단정하지 않는다. "오를 것이다" 금지
- 입력 뉴스에 없는 사실을 지어내지 않는다. 배경은 널리 알려진 범위만
- 종목 추천, 매수·매도, 목표가, 주가 방향 예측 금지
- 한 문장에 아이디어 하나. 군더더기·인사말·메타 설명("이 뉴스는…"로 시작하기) 금지
- 그 사안에 관한 내용만. 옆길로 새지 않는다

설명 길이 (중요):
- sections의 네 칸 모두 각각 최소 3문장, 최대 5문장.
- 짧고 촘촘하게. 같은 말을 반복하지 않는다.
- 1단 whatNow: 누가·무엇을·어디서 했는지 → 왜 지금 주목받는지 → 당장 달라진 점
- 2단 roots: 언제부터 쌓인 배경 → 비슷한 과거 패턴 → 이번과 이어지는 고리
- 3단 motives: 당사자 2~4곳 각각이 원하는 것과 이유 (문장으로 풀기)
- 4단 marketPaths: 가능한 경로 2~3개를 문장으로. "~할 수도 있어요" 톤. 단정 금지

입력이 뉴스가 아니면(잡담·빈 문장·광고 등) isNews=false 로 두고 rejectionReason에 "뉴스 본문을 붙여넣어 주세요"를 넣는다.

JSON 스키마:
{
  "isNews": boolean,
  "rejectionReason": string | null,
  "sections": {
    "whatNow": string,      // 1단 — 최소 3문장, 핵심 사실만
    "roots": string,        // 2단 — 최소 3문장, 역사적 배경·패턴
    "motives": string,      // 3단 — 최소 3문장, 당사자 이해관계
    "marketPaths": string   // 4단 — 최소 3문장, 가능한 시장 경로
  },
  "networkPositions": [
    { "cardId": string | null, "oneLiner": string }
  ],
  "credibility": {
    "source": string,       // 원천. 명시 없으면 "명시 없음"
    "claimType": string,    // 직접 확인된 사실 | 익명 관계자 | 당사자 주장 | 추정
    "opposingViews": string // 있음 | 없음 | 당사자 주장
  }
}

네트워크 위치 규칙:
- 아래에 주어진 카드 목록 안에서만 연결한다. 새 관계를 만들지 않는다.
- 맞는 카드가 있으면 cardId와 "이 사건은 ○○ 네트워크의 △△ 고리" 형식 한 줄.
- 복수 가능. 없으면 networkPositions에 { "cardId": null, "oneLiner": "해당 카드 없음" } 하나만.
`;

export async function analyzeNews(newsText: string): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  const cards = getCardSummariesForPrompt();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });

  const prompt = `${SYSTEM}

## 네트워크 카드 목록 (이 안에서만 매핑)
${JSON.stringify(cards, null, 2)}

## 사용자 뉴스
${newsText}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = JSON.parse(extractJson(text)) as AnalysisResult;

  if (!parsed.isNews) {
    return {
      isNews: false,
      rejectionReason:
        parsed.rejectionReason || "뉴스 본문을 붙여넣어 주세요",
      sections: { whatNow: "", roots: "", motives: "", marketPaths: "" },
      networkPositions: [],
      credibility: { source: "", claimType: "", opposingViews: "" },
    };
  }

  if (!parsed.networkPositions?.length) {
    parsed.networkPositions = [
      { cardId: null, oneLiner: "해당 카드 없음" },
    ];
  }

  return parsed;
}

function extractJson(s: string) {
  const cleaned = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return cleaned.slice(start, end + 1);
  }
  return cleaned;
}
