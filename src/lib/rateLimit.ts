type Bucket = { count: number; resetAt: number };

const minuteBuckets = new Map<string, Bucket>();
const dayBuckets = new Map<string, Bucket>();

const MINUTE_LIMIT = 5;
const DAY_LIMIT = 40;

function touch(map: Map<string, Bucket>, key: string, windowMs: number) {
  const now = Date.now();
  const cur = map.get(key);
  if (!cur || now > cur.resetAt) {
    const next = { count: 1, resetAt: now + windowMs };
    map.set(key, next);
    return next;
  }
  cur.count += 1;
  return cur;
}

export function checkRateLimit(ip: string): {
  ok: boolean;
  reason?: string;
  retryAfterSec?: number;
} {
  const minute = touch(minuteBuckets, ip, 60_000);
  if (minute.count > MINUTE_LIMIT) {
    return {
      ok: false,
      reason: "분당 호출 한도를 넘었습니다. 잠시 후 다시 시도해 주세요.",
      retryAfterSec: Math.ceil((minute.resetAt - Date.now()) / 1000),
    };
  }
  const day = touch(dayBuckets, ip, 86_400_000);
  if (day.count > DAY_LIMIT) {
    return {
      ok: false,
      reason: "일일 호출 한도를 넘었습니다. 내일 다시 시도해 주세요.",
      retryAfterSec: Math.ceil((day.resetAt - Date.now()) / 1000),
    };
  }
  return { ok: true };
}

export async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + "|news-context");
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}
