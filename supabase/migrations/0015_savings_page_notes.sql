-- A single free-text notes box for the whole Savings Goals page (not tied to
-- any one goal) — a place to jot down important stuff. Singleton table: the
-- `id boolean primary key default true check (id)` trick caps it at one row.

create table public.savings_page_notes (
  id         boolean primary key default true check (id),
  notes      text,
  updated_at timestamptz not null default now()
);

insert into public.savings_page_notes (id) values (true);

alter table public.savings_page_notes enable row level security;
create policy public_all on public.savings_page_notes for all using (true) with check (true);
grant select, insert, update, delete on public.savings_page_notes to anon;
