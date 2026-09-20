-- Optional: run in Supabase SQL editor to enable analysis logging
create table if not exists public.analysis_logs (
  id bigint generated always as identity primary key,
  ip_hash text,
  input_length int,
  matched_card_ids text[] default '{}',
  ok boolean default false,
  error text,
  created_at timestamptz default now()
);

alter table public.analysis_logs enable row level security;

-- Service role (secret key) bypasses RLS; no public policies needed for MVP.
