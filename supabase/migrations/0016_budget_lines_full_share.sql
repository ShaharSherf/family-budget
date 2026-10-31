-- The household now always carries 100% of every line — the "משפחתי" split
-- (e.g. 75%) is gone, so family_actual_amount == actual_amount everywhere.
update public.budget_lines set share_pct = 100 where share_pct <> 100;
