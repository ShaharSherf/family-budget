-- Adam owes the household a fixed percentage of certain budget categories
-- every month (e.g. covers 50% of rent). The rule persists across months;
-- the actual amount owed for a given month is computed client-side as
-- percentage * that category's actual total for that month (from
-- budget_lines) — nothing month-specific is stored here.

create table public.adam_debt_shares (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null unique references public.categories(id) on delete cascade,
  percentage  numeric not null check (percentage > 0 and percentage <= 100),
  created_at  timestamptz not null default now()
);

alter table public.adam_debt_shares enable row level security;
create policy public_all on public.adam_debt_shares for all using (true) with check (true);
grant select, insert, update, delete on public.adam_debt_shares to anon;
