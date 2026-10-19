# Architecture

Sylhet Jamat uses React and TypeScript with Vinext/Vite and Next.js-style App Router modules. A Cloudflare Worker serves the application and API. The build produces browser assets in `dist/client` and server modules in `dist/server`.

## Main modules

| Module | Responsibility |
| --- | --- |
| `app/page.tsx` | Public directory, prayer reports, search and map selection |
| `app/manage/page.tsx` | Owner editing and moderation |
| `app/api/[...path]/route.ts` | Reports, confirmations, directory, settings and photo APIs |
| `worker/index.ts` | Worker entry point and Vinext request handling |
| `lib/auth.ts` | Google OAuth and signed sessions |
| `lib/prayers.ts` | Timetable validation, date rules and report selection |
| `lib/directory.ts` | Directory sorting and editable-settings validation |
| `data/` | Seed directory, locality groups, default wording and text catalogue |
| `db/` and `drizzle/` | Database schema and migrations |

## Storage

Cloudflare D1 is bound as `DB`. It stores reports, confirmations, suggestions, directory changes, site settings, rate limits and audit records. Application changes override seed data rather than replacing it on deployment.

Cloudflare R2 is bound as `BUCKET`. Timetable photos stay private and are served through the permission-checked API. JPEG metadata is stripped before storage. Pending photos are visible only to their author and owner; withdrawn photos are unavailable publicly.

## Authentication and permissions

Google OAuth uses the authorization-code flow with PKCE and a signed, ten-minute state cookie. The authenticated userinfo endpoint must return a verified email. Session cookies are HMAC-signed, last seven days and use HttpOnly, Secure, SameSite=Lax and the `__Host-` prefix. Caller-supplied identity headers are ignored.

Owner authorization compares the session email against `ADMIN_EMAIL`. Visitors can browse published information without signing in. Reporting, confirmations and suggestions require sign-in. Only the owner can publish reports, edit the directory and wording, or export records. Mutating requests require a matching Origin header; sign-out uses a same-origin POST.

Runtime secrets are `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `ADMIN_EMAIL`. `PUBLIC_ORIGIN` is non-secret configuration. Deployment additionally requires Cloudflare account credentials stored in GitHub Actions Secrets.

## Reports

Reports are selected primarily by observation date. Partial submissions do not erase other prayers. Same-date disagreements remain conflicts. Explicit end dates and prayer-specific age thresholds control freshness labels. Confirmations are tied to the exact prayer time, account and Bangladesh date.

## Deployment

The GitHub workflow runs checks for pull requests and pushes. It deploys `main` only when `DEPLOY_ENABLED` is true. Setup reuses the configured D1 and R2 resources, applies outstanding migrations, deploys the Worker and verifies public routes. Database and photo backups are separate from source control.

The service worker provides an offline page without caching prayer reports or maps. This prevents an old timetable from appearing current after a connection fails.
