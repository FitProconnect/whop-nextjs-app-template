This is a template for a whop app built in NextJS. Fork it and keep the parts you need for your app.

# Whop NextJS App Template

To run this project:

1. Install dependencies with: `pnpm i`

2. Create a Whop App on your [whop developer dashboard](https://whop.com/dashboard/developer/), then go to the "Hosting" section and:
	- Ensure the "Base URL" is set to the domain you intend to deploy the site on.
	- Ensure the "App path" is set to `/experiences/[experienceId]`
	- Ensure the "Dashboard path" is set to `/dashboard/[companyId]`
	- Ensure the "Discover path" is set to `/discover`

3. Copy the environment variables from the `.env.development` into a `.env.local`. Ensure to use real values from the whop dashboard.

4. Go to a whop created in the same org as the app you created. Navigate to the tools section and add your app.

5. Run `pnpm dev` to start the dev server. Then in the top right of the window find a translucent settings icon. Select "localhost". The default port 3000 should work.

Quick local dev (recommended)

 - Install dependencies:

	 ```bash
	 pnpm install
	 ```

 - Start Next directly (bypasses whop-proxy) for local testing:

	 ```bash
	 HOST=0.0.0.0 pnpm exec -- next dev --turbopack -p 3000
	 # or use the helper script added to package.json
	 pnpm run dev:direct -- --host
	 ```

 - Open in your browser:
	 - Local: http://localhost:3000
	 - If running in a remote container/Codespace use the Network URL printed in the terminal or forward port 3000.

Environment variables

Create a `.env.local` (do NOT commit) with the following placeholders and fill them from your Whop dashboard when you want to enable Whop integrations:

```
WHOP_API_KEY="get_this_from_the_whop_com_dashboard_under_apps"
WHOP_WEBHOOK_SECRET="get_this_after_creating_a_webhook_in_the_app_settings_screen"
NEXT_PUBLIC_WHOP_APP_ID="use_the_corresponding_app_id_to_the_secret_api_key"
```

Vercel deployment (recommended)

1. Push your fork to GitHub (this repo already contains a working todo app in `app/page.tsx`).
2. Go to https://vercel.com/new and import the repository.
3. In the Vercel setup UI, set the Environment Variables (from your `.env.local`) for the appropriate scope (Preview/Production):
	 - WHOP_API_KEY
	 - WHOP_WEBHOOK_SECRET
	 - NEXT_PUBLIC_WHOP_APP_ID

**Vercel: WHOP_API_KEY (server-side only)**

When adding `WHOP_API_KEY` to Vercel, make sure:

- You add it under Project Settings → Environment Variables (or during the import flow).
- Name: `WHOP_API_KEY` (exactly)
- Value: the secret API key from your Whop dashboard (do NOT share publicly).
- Environment: choose `Preview` and `Production` as needed.
- Mark it as a secret (Vercel hides values by default).

Important: Do NOT prefix this key with `NEXT_PUBLIC_` — it must remain server-only so it is never exposed to the browser. The proxy API route at `pages/api/whop/proxy.js` uses `process.env.WHOP_API_KEY` server-side to call the Whop API safely.

4. Leave the Build Command empty (Vercel will detect Next.js) or set to:

	 ```bash
	 pnpm build
	 ```

	 and Output Directory: (leave default for Next.js)

5. Deploy. After deployment, note the deployed domain and set the same domain in your Whop developer dashboard under the App's "Hosting" settings (Base URL). Also set the App path to `/experiences/[experienceId]`, Dashboard path to `/dashboard/[companyId]`, and Discover path to `/discover` as needed.

6. If you are using webhooks, configure the webhook callback URLs on Whop to point to your deployed domain and set the `WHOP_WEBHOOK_SECRET` accordingly.

Notes & troubleshooting

- The repository includes a `dev:direct` script (in `package.json`) to start Next directly for local development. The default `dev` script uses a Whop dev proxy wrapper which may intercept CLI flags.
- The todo UI is client-side and uses `localStorage` by default — Whop credentials are only needed for integrations (webhooks, API calls).
- If the site doesn't appear on `localhost:3000`, check the Next dev output (it prints both Local and Network URLs) and ensure port 3000 is forwarded if running inside a remote container.

Want server-backed persistence?

If you'd like todos to persist across devices or be tied to Whop users/orgs, I can add a small server API route and wire it to the Whop SDK. That requires setting the `WHOP_API_KEY` in Vercel and `.env.local` locally.

## Deploying

1. Upload your fork / copy of this template to github.

2. Go to [Vercel](https://vercel.com/new) and link the repository. Deploy your application with the environment variables from your `.env.local`

3. If necessary update you "Base Domain" and webhook callback urls on the app settings page on the whop dashboard.

## Troubleshooting

**App not loading properly?** Make sure to set the "App path" in your Whop developer dashboard. The placeholder text in the UI does not mean it's set - you must explicitly enter `/experiences/[experienceId]` (or your chosen path name)
a

**Make sure to add env.local** Make sure to get the real app environment vairables from your whop dashboard and set them in .env.local


For more info, see our docs at https://dev.whop.com/introduction
