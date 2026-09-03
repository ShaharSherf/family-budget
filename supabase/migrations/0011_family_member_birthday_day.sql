-- The day-of-month companion to birthday_month, so a family member's
-- birthday can be placed on a specific cell in the events calendar
-- instead of only tagging the whole month.

alter table public.family_members
  add column birthday_day smallint
    check (birthday_day is null or birthday_day between 1 and 31);
