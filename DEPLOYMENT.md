# Deploy MenuDrop to Vercel

## 1. Prepare Supabase

1. Open the correct Supabase project and go to **SQL Editor**.
2. Run the current `supabase/schema.sql`. It creates/updates the app tables, admin and restaurant status fields, and the public image bucket.
3. Keep the Supabase service-role key private. It belongs only in Vercel's server environment variables.

Do not create a new account just for deployment. Existing users receive the default `owner` role during the migration.

## 2. Import the Git repository into Vercel

1. Push the project to the GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Use the repository root as the project root and Vite as the framework preset.
4. Set the build command to `npm run build` and output directory to `dist` (also configured in `vercel.json`).
5. Deploy. The Vercel function in `api/[...path].ts` serves the existing Express API; the Vite app is served as static output.

## 3. Add server environment variables

In the Vercel project, open **Settings → Environment Variables** and add these for Production (and Preview if you will test preview deployments):

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | The server-only service-role secret from Supabase |
| `APP_ORIGIN` | Your canonical production origin, e.g. `https://menu.example.com` |

Never prefix the service-role secret with `NEXT_PUBLIC_` or `VITE_`. Preview deployment hosts are allowed from Vercel's runtime environment. Redeploy after adding or changing environment variables.

## 4. Connect your domain

1. In Vercel, open **Settings → Domains** and add the domain you registered.
2. Follow the DNS records Vercel displays at your domain registrar. DNS records depend on the domain/registrar, so use Vercel's values rather than guessing.
3. Wait until Vercel reports the domain as valid and HTTPS is enabled.
4. Set `APP_ORIGIN` to the exact canonical origin you plan to use (`https://yourdomain.com` or `https://www.yourdomain.com`) and redeploy.

## 5. Grant your account admin access

After the schema migration and a successful sign-in, run this once in Supabase SQL Editor, replacing the email with your existing account's email:

```sql
update public.app_users
set role = 'admin'
where lower(email) = lower('you@example.com');
```

Sign out and back in to refresh the role in the session. Open `/admin` on your deployed site.

## 6. Smoke-test production

- Sign in with an existing account and open its merchant dashboard.
- Upload a JPG, PNG, or WebP (up to 3 MB), then confirm the image is saved and visible in the storefront.
- Open the public `/store/<slug>` page and check a direct refresh works.
- Copy the storefront link and confirm the QR code points at the deployed domain.
- Open `/admin` as the promoted admin; verify a normal owner gets a 403 from admin actions.
- Only test suspension/reactivation with a non-critical demo restaurant.

The 3 MB upload limit keeps base64 uploads below the Vercel Function request-body limit.
