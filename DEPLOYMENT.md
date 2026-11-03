# Deploy MenuDrop to Render

## 1. Prepare Supabase

1. Open the correct Supabase project and go to **SQL Editor**.
2. Run the current `supabase/schema.sql`. It creates/updates the app tables, admin and restaurant status fields, and the image storage bucket.
3. Keep the Supabase service-role key private. Render needs it as a server environment variable only.

Existing accounts keep the default `owner` role; do not create another account just to deploy.

## 2. Import the repository

1. Push the project to the GitHub repository.
2. In Render, choose **New → Blueprint** and connect the repository containing `render.yaml`.
3. Review the `menudrop` web service. The Blueprint uses Node 22, builds the Vite frontend, starts the Express server, and configures `/api/health` for health checks.
4. When prompted, provide `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the Render service.
5. Apply the Blueprint and wait for the first deploy to finish.

The Express server serves both the built frontend and API on Render's assigned `PORT`. Do not run Vite as the production server.

## 3. Check environment variables

In the Render service, open **Environment** and confirm:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase service-role secret |
| `NODE_ENV` | `production` (set by the Blueprint) |
| `APP_ORIGIN` | Optional canonical origin after adding your custom domain |

Render's default service origin is allowed automatically. Add `APP_ORIGIN` when you decide which custom domain is canonical, for example `https://menu.example.com`, then save and redeploy.

Never put the service-role key in a `NEXT_PUBLIC_*` or `VITE_*` variable. If this secret has been exposed, rotate it in Supabase before deploying and update Render with the replacement.

## 4. Connect your domain

1. Open the Render service **Settings → Custom Domains** and add your domain.
2. At your domain registrar, enter the DNS records Render displays for that domain. Do not guess the record values.
3. Wait until Render verifies the domain and provisions HTTPS.
4. Set `APP_ORIGIN` to the exact canonical HTTPS origin (apex or `www`) and redeploy.

## 5. Grant your account admin access

After the schema migration and a successful sign-in, run this once in Supabase SQL Editor, replacing the email with your existing account's email:

```sql
update public.app_users
set role = 'admin'
where lower(email) = lower('you@example.com');
```

Sign out and back in to refresh the role. Open `/admin` on your Render site.

## 6. Production smoke test

- Open `/api/health`; it should return `{"status":"ok"}`.
- Sign in with an existing account and open its merchant dashboard.
- Upload a JPG, PNG, or WebP up to 3 MB, then confirm it is visible in the storefront.
- Open `/store/<slug>` directly and refresh the page.
- Copy the storefront link and confirm its QR code uses the deployed domain.
- Open `/admin` as the promoted admin; verify a normal owner cannot use admin actions.
- Only test suspension/reactivation with a non-critical demo restaurant.

## Troubleshooting

- **Health check fails or the app does not start:** check Render **Logs**. Confirm the Supabase URL and service-role secret are set. The process must bind to Render's `PORT`, which this server reads automatically.
- **API returns an application-level 500:** inspect Render logs for the database error and confirm `supabase/schema.sql` was run in the same Supabase project.
- **Write requests return 403:** set `APP_ORIGIN` to the exact public HTTPS origin if using a custom domain, then redeploy.
- **Uploads fail:** confirm the schema created the `menudrop-images` bucket and try an allowed JPG, PNG, or WebP file no larger than 3 MB.
