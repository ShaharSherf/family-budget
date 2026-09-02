-- RLS: invite-only signup (enforced via the auth hook in 0002 + dashboard
-- setting, configured manually), fully shared data access once authenticated
-- — every household table gets exactly one policy, no per-user siloing.

alter table public.family_members                    enable row level security;
alter table public.categories                         enable row level security;
alter table public.details                            enable row level security;
alter table public.months                             enable row level security;
alter table public.budget_lines                       enable row level security;
alter table public.budget_line_payments               enable row level security;
alter table public.recurring_templates                enable row level security;
alter table public.recurring_template_default_payments enable row level security;
alter table public.savings_goals                      enable row level security;
alter table public.savings_contributions               enable row level security;

create policy household_all on public.family_members
  for all using (public.is_household_member()) with check (public.is_household_member());
create policy household_all on public.categories
  for all using (public.is_household_member()) with check (public.is_household_member());
create policy household_all on public.details
  for all using (public.is_household_member()) with check (public.is_household_member());
create policy household_all on public.months
  for all using (public.is_household_member()) with check (public.is_household_member());
create policy household_all on public.budget_lines
  for all using (public.is_household_member()) with check (public.is_household_member());
create policy household_all on public.budget_line_payments
  for all using (public.is_household_member()) with check (public.is_household_member());
create policy household_all on public.recurring_templates
  for all using (public.is_household_member()) with check (public.is_household_member());
create policy household_all on public.recurring_template_default_payments
  for all using (public.is_household_member()) with check (public.is_household_member());
create policy household_all on public.savings_goals
  for all using (public.is_household_member()) with check (public.is_household_member());
create policy household_all on public.savings_contributions
  for all using (public.is_household_member()) with check (public.is_household_member());

grant select, insert, update, delete
  on public.family_members, public.categories, public.details, public.months,
     public.budget_lines, public.budget_line_payments, public.recurring_templates,
     public.recurring_template_default_payments, public.savings_goals, public.savings_contributions
  to authenticated;
-- No grants to anon anywhere. anon has zero access to any household table.

-- allowed_signup_emails: RLS enabled with zero policies = zero client access
-- at all (not even household members). Only the auth hook (elevated privilege)
-- and the migration script's service-role connection can read/write it.
alter table public.allowed_signup_emails enable row level security;
