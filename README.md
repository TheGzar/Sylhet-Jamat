# Sylhet Jamat

Sylhet mosque jamaat directory with community reports, timetable photos and a separate owner management page. Green-and-white interface, Bangla and English, locality groups, map, saved mosques and all six prayer fields. The directory contains 166 entries.

## Owner guide

Start with the [complete owner guide](docs/OWNER-GUIDE.md) or open [the searchable offline guide](docs/OWNER-GUIDE.html). On the live site, your guide is under **/manage?tab=guide** after owner sign-in. It covers setup, everyday edits, reports, map positions, backups, troubleshooting and future releases.

## Deployment

Deploy to Cloudflare Workers with D1 and R2. The code builds and can run with local D1/R2 storage. A production Cloudflare account and Google OAuth credentials must be connected before the independent public deployment can be verified. The placeholder database ID in `wrangler.jsonc` is replaced by the setup script after account authorization.

## Application structure

This is a React app using Vinext 1.0.0-beta.5, Vite 8 and Next.js-style App Router modules. The `/` page is `app/page.tsx`, management is `app/manage/page.tsx`, and server endpoints are in `app/api/[...path]/route.ts`. The build generates a Worker and browser assets under `dist/server` and `dist/client`.

The application requires a server runtime for reporting, moderation, settings, authentication and uploads. It cannot run as a static GitHub Pages site.

## Selected hosting

Cloudflare Workers hosts both the existing frontend and server routes. Cloudflare D1 stores reports, confirmations, suggestions, directory changes, settings and audit records. Private R2 storage holds timetable photos. Photos remain accessible through the existing permission-checked API, not a public bucket. Sign-in uses Google OAuth and signed HTTP-only cookies. Account email is not displayed publicly.

A free workers.dev URL is sufficient. A purchased domain is optional. Keep the Workers Free plan initially; the app must fit its limits. Do not activate a paid plan without reviewing the limits below.

## Account setup needed once

1. Create or sign into your Cloudflare account. In Workers & Pages, choose your account's free workers.dev subdomain. Enable R2 if it is not already available. Cloudflare may require a payment method for R2 activation; check the account screen before accepting. The project does not buy a domain or upgrade your plan.
2. Create a scoped Cloudflare API token for this account with **Workers Scripts: Edit**, **Workers R2 Storage: Edit**, **D1: Edit**, and **Account Settings: Read**. These support deployment, database/bucket setup and discovering the workers.dev subdomain. Do not use a global API key.
3. Create a Google OAuth **Web application** client using the Google Auth Platform console. Use External audience, add your support/contact email, request only `openid` and `email`, and add this authorized redirect URI: `https://sylhet-jamat.YOUR-WORKERS-SUBDOMAIN.workers.dev/api/auth/callback`. The subdomain comes from step 1. For initial testing, add your Google account as a test user. Switch the OAuth app to production before general community use; Google may require additional consent-screen setup.
4. In this existing GitHub repository, open **Settings > Secrets and variables > Actions > Secrets**. Add:

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | The scoped token from step 2 |
| `GOOGLE_CLIENT_ID` | Google Web application client ID |
| `GOOGLE_CLIENT_SECRET` | Google client secret |
| `AUTH_SECRET` | At least 32 securely random characters, fixed across deploys |
| `ADMIN_EMAIL` | The Google email allowed to manage mosques and publish reports |

Generate an AUTH_SECRET locally with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Store the result in GitHub Secrets.

5. Under **Actions > Variables**, add `DEPLOY_ENABLED` with value `true`. Leave `PUBLIC_ORIGIN` unset for the workers.dev address. Then open **Actions > Check and deploy Sylhet Jamat > Run workflow** on `main`.

The workflow checks the app, creates or reuses the named D1 database and R2 bucket, sets the real database binding in its build checkout, applies outstanding migrations, deploys the Worker, installs the runtime secrets and checks the public routes. It does not erase an existing database. Deployment is disabled until DEPLOY_ENABLED is explicitly set, so incomplete account configuration does not publish a broken app by accident.

Do not configure Cloudflare Builds as a second deployment pipeline while this GitHub Actions workflow is active. One pipeline owns database migrations and releases.

## Future edits

Push changes to `main`. GitHub Actions reruns checks and updates the same Worker after they pass, when DEPLOY_ENABLED is true and secrets are configured. Pull requests run checks but never deploy. In-app mosque, wording and disclaimer changes are saved in D1 from `/manage`; those do not require a GitHub commit and survive code releases.

## Local commands

Use Node 24 and pnpm 11.25.0 (the version in package.json).

```sh
pnpm install --frozen-lockfile
cp .dev.vars.example .dev.vars
pnpm db:migrate:local
pnpm dev
```

Set real local OAuth credentials and the displayed localhost origin in `.dev.vars` to test sign-in. Never commit that file. There is no fake owner login.

```sh
pnpm typecheck
pnpm test
pnpm test:api
pnpm build
pnpm test:production
pnpm deploy:check
```

`test:production` checks the actual compiled Worker using isolated local D1/R2 and asset storage. No production submissions are created.

## Costs and limits checked 19 October 2026

- Workers Free: 100,000 dynamic requests/day and 10ms CPU time/invocation. Static-asset requests are free and unlimited. SSR or photo processing can exceed the CPU limit even at low traffic. Production CPU measurements need the real account. Paid Workers starts at USD 5/month plus usage.
- D1 Free: 5 million rows read/day, 100,000 rows written/day, 5GB total storage. On the Free plan queries fail when daily limits are reached, until reset. Database size and indexed queries still matter.
- R2 Standard allowance: 10GB-month storage, 1 million Class A and 10 million Class B operations/month. Storage beyond the allowance is USD 0.015/GB-month; operations beyond the included amounts are charged. Egress is free. R2 is not unlimited free storage.
- GitHub Actions and Google OAuth are also subject to their account policies and quotas. This app requests no paid Google APIs. Billing activation or charges have not been authorized by these files.

Official references:

- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/r2/pricing/
- https://developers.google.com/identity/protocols/oauth2/web-server

## Data and remaining verification

The source includes the mosque directory. Live reports and photo files are held separately in D1 and R2. Back up both before migrating hosting; a source download is not a live database backup.

A real Google login, owner moderation, public timetable report and photo upload must be checked on the final host. Local mocked OAuth tests cannot prove Google consent-screen configuration. Browser/device visual testing and free-tier CPU measurements are still required. The local build and HTTP tests do not mean that an independent public deployment has already happened.
