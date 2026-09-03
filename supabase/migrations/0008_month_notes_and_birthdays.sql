-- Free-text notes on a month (ESPP purchase, a decision to change ESPP
-- contribution %, etc.) plus each family member's birth month, so a
-- birthday badge can show automatically every year without re-entering it.

alter table public.months
  add column notes text;

alter table public.family_members
  add column birthday_month smallint
    check (birthday_month is null or birthday_month between 1 and 12);
