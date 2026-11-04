# Deploy Menu360 frontend to Vercel and API to Render

The React/Vite frontend is deployed on Vercel. The Express API and Supabase server credentials run separately on Render. The browser sends API requests to the Render API URL using `VITE_API_BASE_URL`.

## 1. Prepare Supabase

Run the current `supabase/schema.sql` in the correct Supabase project. Keep the service-role key private; if it has been exposed, rotate it before deployment.

## 2. Deploy the API to Render

1. In Render, choose **New → Blueprint** and connect this repository. Render reads the root `render.yaml` and creates the `menu360-api` web service.
2. Provide `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` when prompted. These are server-only secrets.
3. Wait for the service to deploy. Test `https://<render-service>.onrender.com/api/health`; it should return `{"status":"ok"}`.
4. In Render **Settings → Custom Domains**, add `api.menu360.name.ng` only if you want the API on your own subdomain. Render displays the DNS record target—use that exact target in Truehost. The website domain and API domain are separate.
5. In Render **Environment**, set `APP_ORIGINS` to a comma-separated list of exact frontend origins, for example:

   `https://menu360.name.ng,https://menuus-d7yq.vercel.app`

   Include every frontend hostname you actually use (including `https://www.menu360.name.ng` if you serve the site there too). Origins include the scheme and have no trailing slash. Save changes and redeploy the API.

## 3. Deploy the frontend to Vercel

1. Import the same repository into Vercel (or use its existing project), with the repository root, Vite preset, build command `npm run build`, and output directory `dist`.
2. In Vercel **Settings → Environment Variables**, set the build-time variable `VITE_API_BASE_URL` to the Render API origin, e.g. `https://api.menu360.name.ng`. Before the API custom domain is ready, use the exact `https://<render-service>.onrender.com` origin. Do not set this to `https://menu360.name.ng` unless the API itself is hosted there.
3. Deploy/redeploy after setting this variable. `VITE_API_BASE_URL` is public and must contain only the API base URL—never a Supabase secret.
4. In Vercel **Settings → Domains**, add `menu360.name.ng`. Optionally add `www.menu360.name.ng` and configure it to redirect to the apex domain. Vercel shows the DNS record(s) required for each hostname:

   | Type | Name | Value |
   | --- | --- | --- |
   | As shown in Vercel | `@` (or the name shown) | Use the exact value shown in your Vercel project |

5. In Truehost's DNS/Zone Editor, create or update the apex (`@`) record(s) with exactly the values Vercel displays. Do the same for `www` only if you added that hostname. Remove conflicting records for those names if required. Do not put the scheme (`https://`) in a DNS value.
6. If adding `api.menu360.name.ng`, add it to the Render service's Custom Domains and create the DNS record Render displays for the `api` host. The Vercel record is not the API record.
7. Wait for Vercel and Render to verify their respective domains and provision HTTPS. Set `VITE_API_BASE_URL` to the API's actual origin (custom API domain or Render hostname), update Render `APP_ORIGINS` to include `https://menu360.name.ng`, then redeploy both services.

The app builds storefront and QR links from the current browser origin, so they will use `https://menu360.name.ng` automatically when opened there. No frontend source-code URL change is required.

## 4. Local environment files

- Repository root `.env`: client-safe frontend settings, including optional `VITE_API_BASE_URL`. Leave it blank locally to use the Vite proxy to `localhost:4000`.
- `server/.env`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and local `APP_ORIGINS`.
- Copy templates from `.env.example` and `server/.env.example`. The actual env files are ignored by Git.

## 5. Production checks

- Render API `/api/health` returns `{"status":"ok"}`.
- Vercel frontend pages `/signup`, `/dashboard`, `/admin`, and `/store/the-pepper-house` load on direct refresh.
- Sign in with an existing account; no test account is necessary.
- Upload an allowed image and verify it appears in the menu.
- If an API request fails, inspect Render **Logs**. CORS 403 errors mean the exact Vercel/custom frontend origin is missing from `APP_ORIGINS`.

## Admin access

After the schema migration, promote your existing account in Supabase SQL Editor (replace the example address):

```sql
update public.app_users
set role = 'admin'
where lower(email) = lower('you@example.com');
```

Sign out and back in, then visit `/admin`.
