-- Login removed from the app entirely (family decided it's fine for anyone
-- with the URL to use it). Data was already fully shared across household
-- members (see 0004); this just drops the auth requirement so the anon
-- client (no session at all) gets the same access authenticated users had.

drop policy household_all on public.family_members;
drop policy household_all on public.categories;
drop policy household_all on public.details;
drop policy household_all on public.months;
drop policy household_all on public.budget_lines;
drop policy household_all on public.budget_line_payments;
drop policy household_all on public.savings_goals;
drop policy household_all on public.savings_contributions;
drop policy household_all on public.calendar_events;

create policy public_all on public.family_members       for all using (true) with check (true);
create policy public_all on public.categories            for all using (true) with check (true);
create policy public_all on public.details               for all using (true) with check (true);
create policy public_all on public.months                for all using (true) with check (true);
create policy public_all on public.budget_lines          for all using (true) with check (true);
create policy public_all on public.budget_line_payments  for all using (true) with check (true);
create policy public_all on public.savings_goals         for all using (true) with check (true);
create policy public_all on public.savings_contributions for all using (true) with check (true);
create policy public_all on public.calendar_events       for all using (true) with check (true);

grant select, insert, update, delete
  on public.family_members, public.categories, public.details, public.months,
     public.budget_lines, public.budget_line_payments, public.savings_goals,
     public.savings_contributions, public.calendar_events
  to anon;

-- allowed_signup_emails / check_allowed_signup hook are now dead (no signup
-- flow left to gate) but left in place — harmless, and unwinding the auth
-- hook is a manual dashboard step anyway.
