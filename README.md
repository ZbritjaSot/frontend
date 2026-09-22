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

## Branch (now)

`feat/app-shells` — B1 shells · B2 public SSR offers · **B3** `/biz/login` (Sanctum cookies).

Demo biz: `kafe@demo.zbritjasot.com` / `password`

Next: **B4** biz create + submit offer · **B5** admin login.
