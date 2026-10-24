# ZbritjaSot (frontend)

**Më shumë zbritje. Më shumë kursim.**

Next.js site for public listings + `/admin` + `/biz`. Albanian only. EUR.

Production Coming Soon stays on branch **`coming-soon`** (static export → Cloudflare Pages).  
Product work: feature branches → squash PR into **`main`**. Never push features to `coming-soon`.

## Stack

- Next.js App Router · React · TypeScript · Tailwind · Montserrat
- **Public list/detail:** Server Components + `fetch` (SSR) — B2
- **Admin / biz:** [TanStack Query](https://tanstack.com/query) + Sanctum **cookies**
- Thin client: `lib/api.ts` → Laravel `/api/v1`

## Folders

```
app/           routes: (public)/, admin/, biz/
components/    brand + chrome shells
features/      screen modules (grow with B2+)
hooks/         TanStack Query hooks
lib/           api, site, format (EUR / dates)
schemas/       Zod (from login / offer forms)
types/         API TypeScript types
```

## Local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open: `/` · `/admin` · `/biz`

## Tests

```bash
npm test
npm run test:e2e
```

`npm test` runs the Vitest checks for prices, dates, and offer rules.

`npm run test:e2e` runs the Playwright shop → admin → public path. It does not use your normal local database. The script creates MySQL database `zbritjasot_e2e` with the same host and user as the backend `.env`, migrates and seeds it, then starts the API on port 8001 and the site on port 3001. It can run beside `npm run dev`. The backend repo is expected at `../backend`. The demo logins below are the seeded accounts. The test deletes the folders it creates.

## Branch (now)

`feat/app-shells` — Phase 1 discount loop (B1–B7) + shared **Modal** + **Spinner**.

| Login | Email | Password |
| --- | --- | --- |
| `/login` | `viva@test.com` | `password` |
| `/login` | `admin@test.com` | `password` |

Expired / past-window offers never appear on `/`. Expiry job (every minute): `php artisan offers:expire`.
