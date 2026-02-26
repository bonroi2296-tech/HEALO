# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

HEALO is a Next.js 16 medical concierge platform (single app, not a monorepo). It connects foreign patients with Korean medical services. The backend is **Supabase** (PostgreSQL + Auth + Storage). The AI chat feature uses OpenAI or Google Gemini via the Vercel AI SDK.

### Dev commands

Standard commands are in `package.json`:

| Command | Purpose |
|---|---|
| `npm run dev` | Next.js dev server on port 3000 (`--webpack` flag) |
| `npm run build` | Production build |
| `npm run lint` | ESLint (flat config in `eslint.config.js`) |
| `npm run lint:fix` | ESLint with auto-fix |

### Environment variables

A `.env.local` file is required. The minimum required variables are:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (for server-side admin operations)
- `SUPABASE_ENCRYPTION_KEY` — Min 32 chars, used for PII encryption
- `INTERNAL_ADMIN_SECRET` — Protects admin token rotation API
- `OPENAI_API_KEY` or (`GOOGLE_GENERATIVE_AI_API_KEY` + `LLM_PROVIDER=google`) — For AI chat

The app gracefully handles missing/invalid Supabase credentials at dev time by using dummy clients (see `src/lib/data/supabaseClient.js` and `supabaseServer.js`). Pages will render but show "Failed to fetch" for data sections. This is expected without real Supabase credentials.

### Non-obvious caveats

- The `.env.local.example` file is **incomplete** — it only lists 3 of the ~6 required env vars. Refer to the list above.
- The README is a **generic Vite template README** and does not describe this project (the project migrated from Vite to Next.js).
- `typescript.ignoreBuildErrors` is `true` in `next.config.js` because Supabase schema types (`database.types.ts`) have not been generated yet. This means `npm run build` succeeds even with TS errors.
- ESLint has ~65 pre-existing warnings/errors in the codebase. These are not regressions.
- The middleware deprecation warning ("middleware" → "proxy") from Next.js 16 is expected and can be ignored.
- No Docker, no git hooks, no pre-commit configuration, no CI/CD pipelines are set up.

### TypeScript convention

New files should be written in TypeScript (.ts/.tsx). Existing JavaScript files are being gradually migrated. The project currently has a mix of .js/.jsx and .ts/.tsx files:
- API routes and lib utilities: mostly TypeScript
- Page components and legacy code: mostly JavaScript
- `typescript.ignoreBuildErrors` is `true` in `next.config.js` until Supabase schema types are generated

### Legacy pages migration status

Files in `src/legacy-pages/` are being migrated to the Next.js App Router (`app/`). Current status:
- `HospitalDetailPage.jsx` → wrapped by `app/hospitals/[slug]/HospitalDetailClient.jsx`
- `TreatmentDetailPage.jsx` → wrapped by `app/treatments/[slug]/TreatmentDetailClient.jsx`
- `AuthPages.jsx` → wrapped by `app/login/page.jsx`, `app/signup/page.jsx`
- `admin/*` → used by `src/AdminPage.jsx` (not yet migrated to App Router)
- ESLint guardrail in `eslint.config.js` prevents new imports from `legacy-pages/`

### ESLint guardrail notes

The `no-restricted-imports` rule in `eslint.config.js` blocks new imports from `src/legacy-pages/`. An allowlist exists for files that still need legacy imports. As legacy components are migrated, remove entries from the allowlist to strengthen the guardrail.
