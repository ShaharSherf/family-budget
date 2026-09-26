-- Tracks how much Adam owes the household each month, broken down by
-- category (free text, not the budget categories table — this is a
-- receivable, not part of the income/expense budget).

create table public.adam_debt_items (
  id         uuid primary key default gen_random_uuid(),
  month_key  date not null,
  category   text not null,
  amount     numeric not null,
  notes      text,
  created_at timestamptz not null default now()
);

create index adam_debt_items_month_key_idx on public.adam_debt_items (month_key);

alter table public.adam_debt_items enable row level security;
create policy public_all on public.adam_debt_items for all using (true) with check (true);
grant select, insert, update, delete on public.adam_debt_items to anon;
