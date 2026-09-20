type TokenCache = { accessToken: string; expiresAt: number };

let tokenCache: TokenCache | null = null;

const BASE = "https://openapi.tossinvest.com";

export function getTossCredentials(): {
  clientId: string;
  clientSecret: string;
} | null {
  const clientId = process.env.TOSS_CLIENT_ID?.trim() || "";
  const clientSecret =
    process.env.TOSS_CLIENT_SECRET?.trim() ||
    process.env.TOSS_OPEN_API_KEY?.trim() ||
    "";
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export async function getTossAccessToken(): Promise<string> {
  const creds = getTossCredentials();
  if (!creds) {
    throw new Error(
      "토스 연결에 client_id가 더 필요해요. .env에 TOSS_CLIENT_ID를 넣어 주세요.",
    );
  }

  if (tokenCache && Date.now() < tokenCache.expiresAt - 30_000) {
    return tokenCache.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
  });

  const res = await fetch(`${BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    const msg =
      data?.error_description ||
      data?.error?.message ||
      data?.error ||
      `토큰 발급 실패 (${res.status})`;
    throw new Error(String(msg));
  }

  const expiresIn = Number(data.expires_in || 3600);
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  return data.access_token;
}

async function tossGet<T>(path: string, query?: Record<string, string>) {
  const token = await getTossAccessToken();
  const url = new URL(path, BASE);
  if (query) {
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) {
    const msg =
      data?.error?.message || data?.message || `요청 실패 (${res.status})`;
    throw new Error(String(msg));
  }
  return data as T;
}

export type TossPrice = {
  symbol: string;
  lastPrice: string;
  currency?: string;
  timestamp?: string | null;
};

export type TossOrderbookLevel = {
  price: string;
  quantity: string;
};

export type TossOrderbook = {
  symbol: string;
  asks?: TossOrderbookLevel[];
  bids?: TossOrderbookLevel[];
  timestamp?: string | null;
};

type ApiEnvelope<T> = { result?: T };

export async function fetchPrices(symbols: string[]): Promise<TossPrice[]> {
  if (!symbols.length) return [];
  const unique = [...new Set(symbols)];
  const stockLike = unique.filter(
    (s) => !s.startsWith("KR_BOND") && s !== "KOSPI" && s !== "KOSDAQ",
  );
  const indicators = unique.filter(
    (s) => s.startsWith("KR_BOND") || s === "KOSPI" || s === "KOSDAQ",
  );

  const out: TossPrice[] = [];

  if (stockLike.length) {
    const data = await tossGet<ApiEnvelope<TossPrice[]>>("/api/v1/prices", {
      symbols: stockLike.join(","),
    });
    out.push(...(data.result || []));
  }

  if (indicators.length) {
    const data = await tossGet<ApiEnvelope<TossPrice[]>>(
      "/api/v1/market-indicators/prices",
      { symbols: indicators.join(",") },
    );
    out.push(...(data.result || []));
  }

  return out;
}

export async function fetchOrderbook(symbol: string): Promise<TossOrderbook | null> {
  const data = await tossGet<ApiEnvelope<TossOrderbook>>("/api/v1/orderbook", {
    symbol,
  });
  return data.result || null;
}

export async function fetchUsdKrw(): Promise<{ rate: string; timestamp?: string } | null> {
  const data = await tossGet<
    ApiEnvelope<{ rate?: string; dealBasR?: string; timestamp?: string }>
  >("/api/v1/exchange-rate");
  const r = data.result;
  if (!r) return null;
  return {
    rate: String(r.rate || r.dealBasR || ""),
    timestamp: r.timestamp,
  };
}
