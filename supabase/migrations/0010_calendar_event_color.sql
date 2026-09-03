alter table public.calendar_events
  add column color text not null default 'blue'
    check (color in ('blue', 'green', 'red', 'amber', 'purple', 'pink'));
