/** FRED (St. Louis Fed) API — 사안별 자산 움직임 */

const BASE = "https://api.stlouisfed.org/fred";

export type FredPoint = { date: string; value: number };

export type FredObservation = {
  seriesId: string;
  value: number;
  date: string;
  prevValue: number | null;
  prevDate: string | null;
  /** 최근 유효 관측 (오래된→최신), 스파크라인용 */
  history: FredPoint[];
  /** 히스토리 첫값 대비 최신 변화율(%) */
  windowChangePct: number | null;
};

type CacheEntry = { at: number; data: FredObservation };
const obsCache = new Map<string, CacheEntry>();
const CACHE_MS = 15 * 60 * 1000;
const HISTORY_LIMIT = 40;
const SPARK_POINTS = 14;

export function getFredApiKey(): string | null {
  const key = process.env.FRED_API_KEY?.trim() || "";
  return key.length >= 32 ? key : null;
}

type ObsJson = {
  observations?: { date: string; value: string }[];
  error_message?: string;
};

function parseFinite(v: string): number | null {
  if (!v || v === ".") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function pctChange(
  current: number,
  previous: number | null,
): number | null {
  if (previous == null || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/** 최신·직전 + 최근 추세 히스토리 */
export async function fetchLatestObservation(
  seriesId: string,
): Promise<FredObservation | null> {
  const key = getFredApiKey();
  if (!key) {
    throw new Error("FRED_API_KEY가 .env에 없어요.");
  }

  const cached = obsCache.get(seriesId);
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.data;
  }

  const url = new URL(`${BASE}/series/observations`);
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", key);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "desc");
  url.searchParams.set("limit", String(HISTORY_LIMIT));

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  const data = (await res.json()) as ObsJson;

  if (!res.ok || data.error_message) {
    throw new Error(
      data.error_message || `FRED 요청 실패 (${res.status}) · ${seriesId}`,
    );
  }

  const valid: FredPoint[] = [];
  for (const row of data.observations || []) {
    const value = parseFinite(row.value);
    if (value == null) continue;
    valid.push({ date: row.date, value });
  }

  if (!valid.length) return null;

  const latest = valid[0];
  const prev = valid[1] ?? null;
  const historyAsc = valid.slice(0, SPARK_POINTS).reverse();
  const windowStart = historyAsc[0]?.value ?? null;

  const out: FredObservation = {
    seriesId,
    value: latest.value,
    date: latest.date,
    prevValue: prev?.value ?? null,
    prevDate: prev?.date ?? null,
    history: historyAsc,
    windowChangePct: pctChange(latest.value, windowStart),
  };
  obsCache.set(seriesId, { at: Date.now(), data: out });
  return out;
}

export async function fetchLatestObservations(
  seriesIds: string[],
): Promise<Map<string, FredObservation>> {
  const unique = [...new Set(seriesIds.filter(Boolean))];
  const map = new Map<string, FredObservation>();

  const settled = await Promise.allSettled(
    unique.map(async (id) => {
      const obs = await fetchLatestObservation(id);
      return { id, obs };
    }),
  );

  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    const { id, obs } = result.value;
    if (obs) map.set(id, obs);
  }

  return map;
}

export function formatFredNumber(
  value: number,
  opts?: { digits?: number; unit?: string },
): string {
  const digits = opts?.digits ?? 2;
  const n = value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
  const unit = opts?.unit?.trim();
  return unit ? `${n} ${unit}` : n;
}
