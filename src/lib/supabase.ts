import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;
let browserClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

export function getSupabaseBrowser(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  if (!browserClient) {
    browserClient = createClient(url, key);
  }
  return browserClient;
}

/** Soft-fail logging so missing tables never break the product. */
export async function logAnalysisEvent(payload: {
  ipHash: string;
  inputLength: number;
  matchedCardIds: string[];
  ok: boolean;
  error?: string;
}) {
  try {
    const sb = getSupabaseAdmin();
    if (!sb) return;
    await sb.from("analysis_logs").insert({
      ip_hash: payload.ipHash,
      input_length: payload.inputLength,
      matched_card_ids: payload.matchedCardIds,
      ok: payload.ok,
      error: payload.error ?? null,
      created_at: new Date().toISOString(),
    });
  } catch {
    // table may not exist yet — ignore
  }
}
