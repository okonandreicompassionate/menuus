# Deploy MenuDrop frontend and API to Vercel

The Vite frontend is deployed as static output from `dist`. The Express API is exposed as a Vercel Function at `api/[...path].ts`, so the frontend and API share one Vercel project and origin.

## 1. Prepare Supabase

1. Open the correct Supabase project and run the current `supabase/schema.sql` in SQL Editor.
2. Keep the Supabase service-role key private. Do not commit `server/.env`.
3. If the key has been shared or exposed, rotate it in Supabase before deploying.

## 2. Import and deploy the repository

1. Push the project to GitHub.
2. In Vercel, choose **Add New → Project** and import this repository and branch.
3. Use the repository root. Framework preset: **Vite**; build command: `npm run build`; output directory: `dist`.
4. The repository's `vercel.json` configures the SPA routes and sends `/api/*` to the Express function.

## 3. Configure server environment variables

In Vercel **Project → Settings → Environment Variables**, add these for Production and Preview as needed:

| Name | Value |
| --- | --- |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase service-role key |
| `APP_ORIGIN` | Optional canonical origin after your domain is connected, e.g. `https://menu.example.com` |

These are server environment variables. Never prefix the service-role key with `NEXT_PUBLIC_` or `VITE_`. Vercel preview and production hostnames are allowed automatically. Redeploy after adding or changing variables.

For local development, the root `.env` is for client-safe values only. The API loads server-only settings from `server/.env`. Use `server/.env.example` as the template; both actual `.env` files are ignored by Git.

## 4. Attach your Truehost domain

1. In Vercel, open the project **Settings → Domains**, add your domain, and choose the canonical hostname (`example.com` or `www.example.com`).
2. Vercel will display the exact DNS records needed. Keep that Vercel tab open.
3. Sign in to Truehost, open the domain's DNS management/Zone Editor, and add or update the records to match Vercel exactly. Do not guess the record values. Remove conflicting records for the same host if Vercel instructs you to.
4. Return to Vercel and wait for the domain to verify and HTTPS to become active.
5. Set `APP_ORIGIN` in Vercel to the exact canonical HTTPS origin, for example `https://example.com`, then redeploy.

DNS changes may take time to propagate. The Vercel Domains page shows whether the records are correct.

## 5. Grant your existing account admin access

After the schema migration, replace the example address with your account email and run once in Supabase SQL Editor:

```sql
update public.app_users
set role = 'admin'
where lower(email) = lower('you@example.com');
```

Sign out and back in, then open `/admin`.

## 6. Verify deployment

- Open `/api/health`; it should return `{"status":"ok"}`.
- Open `/signup`, `/dashboard`, `/admin`, and `/store/the-pepper-house` directly and refresh.
- Sign in with an existing account; do not create test accounts unless you want them.
- Verify menu image upload and QR/link sharing.
- Review Vercel Function Runtime Logs if an API request fails.

## Troubleshooting

- **API returns `FUNCTION_INVOCATION_FAILED`:** check Vercel Function Runtime Logs and ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` exist for that deployment environment.
- **Database errors after the function starts:** run `supabase/schema.sql` against the same project configured by `SUPABASE_URL`.
- **Writes return 403:** set `APP_ORIGIN` to the exact public HTTPS origin and redeploy.
- **Nested page refresh returns 404:** confirm this repository's `vercel.json` rewrites were included in the deployed commit.
