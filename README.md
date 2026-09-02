# תקציב המשפחה — Family Budget

A React + Vite + TypeScript SPA replacing a family's monthly budget spreadsheet, backed by Supabase (Postgres + Auth), deployed to GitHub Pages. Hebrew, RTL.

## Stack

- React 19 + Vite + TypeScript + Tailwind CSS v4
- Supabase (Postgres, Auth, Row Level Security) — accessed directly from the client, no custom server
- TanStack Query, react-router-dom (`HashRouter`), Recharts, Radix UI

## First-time setup

1. **Supabase project**: create one, then apply the SQL migrations in `supabase/migrations/` in order (via the SQL editor or the Supabase CLI).
2. **Auth**: in the Supabase dashboard, disable public sign-up (Auth → Providers → Email), register `check_allowed_signup` as a "Before User Created" auth hook, and set Site URL / Redirect URLs to your eventual GitHub Pages URL (and `http://localhost:5173/family-budget/` for local dev).
3. **Env vars**: copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
4. **One-time data migration** (imports the real spreadsheet data — see `scripts/migrate/`): fill in the migration-only vars in `.env.local` (`SUPABASE_SERVICE_ROLE_KEY`, `EXCEL_FILE_PATH`, `FAMILY_MEMBER_1/2/3_EMAIL`), then run `npm run migrate`. This is a one-shot script — never run it against a project that already has data.
5. **GitHub Pages**: create a public repo, push this project to `main`, set Settings → Pages → Source to "GitHub Actions", and add `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` as repo secrets (Settings → Secrets and variables → Actions).

## Development

```bash
npm install
npm run dev
npm run lint    # oxlint + a check against physical-direction Tailwind classes (this app is RTL-only)
npm run build   # tsc -b && vite build
```

## Regenerating Supabase types

`src/lib/supabase/database.types.ts` is hand-authored to match `supabase/migrations/*.sql` until a live project exists. Once one does, regenerate it from the real schema:

```bash
SUPABASE_PROJECT_ID=<id> npm run db:types
```
