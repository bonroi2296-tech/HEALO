# AGENTS.md

## Project Overview

**HEALO** — Medical concierge platform connecting foreign patients with Korean medical services.

- **Stack:** Next.js 16 + React 18 + Supabase + Tailwind CSS
- **Language:** TypeScript / JavaScript (mixed, `strict: false`)

## Cursor Cloud specific instructions

### Dev Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Next.js with webpack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run test` | Run Vitest (watch mode) |
| `npm run test:run` | Run Vitest (single run) |

### Environment Setup

- A `.env.local` file with Supabase credentials is required for full functionality. Without it the dev server will start but API routes depending on Supabase will fail at runtime.
- Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and others listed in `scripts/check-env.js`.
- Run `npm run check:env` to verify which env vars are set.

### Build Notes

- `typescript.ignoreBuildErrors` is `true` in `next.config.js` because Supabase DB types (`database.types.ts`) have not been generated yet. The build will succeed even with TS errors.
- ESLint is configured via `eslint.config.js` (flat config, ESLint 9). There are ~75 pre-existing lint errors; do not treat these as blockers.
- Sentry integration activates only when `NEXT_PUBLIC_SENTRY_DSN` is set.

### Gotchas

- The code expects `ENCRYPTION_KEY_V2` (64-char hex string). The injected secret `SUPABASE_ENCRYPTION_KEY` is a different format (44 chars). When creating `.env.local`, generate a fresh 64-char hex key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` are not currently available as secrets. Admin API routes and the AI chatbot will fail without them, but the public-facing catalog (hospitals, treatments, inquiry form) works fine with just the anon key.
- The build emits warnings about `hospitals.updated_at` / `treatments.updated_at` columns not existing — these are non-blocking and come from the data-fetching layer during static page generation.
- No Docker, no pre-commit hooks, no Makefile. Setup is simply `npm install`.
