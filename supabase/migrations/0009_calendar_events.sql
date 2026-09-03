-- A general "important dates to remember" list, separate from the family
-- members' own birth months and from a specific month's free-text notes:
-- friends' birthdays, anniversaries, weddings, etc. Stored as month+day only
-- (no year) since these are things you want reminded of every year.

create table public.calendar_events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  month        smallint not null check (month between 1 and 12),
  day          smallint not null check (day between 1 and 31),
  notes        text,
  created_at   timestamptz not null default now()
);

alter table public.calendar_events enable row level security;

create policy household_all on public.calendar_events
  for all using (public.is_household_member()) with check (public.is_household_member());

grant select, insert, update, delete on public.calendar_events to authenticated;
