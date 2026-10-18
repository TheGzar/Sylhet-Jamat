# Independent hosting configuration

The GitHub deployment uses Vinext/Vite on Cloudflare Workers with D1 (`DB`) and private R2 (`BUCKET`). `worker/index.ts` passes requests to the Vinext server. It does not use ChatGPT hosting configuration or connector services.

`lib/auth.ts` implements Google OAuth authorization code flow with PKCE and a signed ten-minute state cookie. User information is retrieved from Google's authenticated userinfo endpoint; only verified email is accepted. Seven-day HMAC-signed session cookies use HttpOnly, Secure, SameSite=Lax and the __Host- prefix. The API ignores all caller-supplied identity headers. Owner authorization compares the session email against the ADMIN_EMAIL secret. POST mutations require a matching Origin header. Sign-out is a same-origin POST.

Runtime secrets: AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ADMIN_EMAIL. PUBLIC_ORIGIN is non-secret configuration. GitHub Actions additionally needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID to provision existing named storage and publish the same Worker. No credential is committed.

The deploy workflow runs only on main when DEPLOY_ENABLED is true. It checks source, builds, applies outstanding migrations, deploys and verifies public HTTP routes. Owner changes in D1 persist across builds. Existing ChatGPT-hosted records and photos need an explicit export/import before migration; source code is not a database backup.

## Earlier app design notes

# Build decisions

Primary job: locate a mosque and assess a dated congregation-time report.

The app is a responsive website with a phone home-screen manifest. This avoids maintaining separate Android and iOS apps during the pilot. It uses the supplied Sites/Vinext integration, React/TypeScript, Leaflet, Cloudflare D1 records and R2 photo storage. It contains no AI runtime calls and requires no AI API budget.

The seed directory is source-linked OSM data; approved community records and owner corrections overlay it by stable ID. Public reads do not require account identity. Writes use Sites-authenticated identity. Moderator access is checked server-side against the ADMIN_EMAIL environment secret. Sites dispatch must remain the authentication boundary; do not expose the Worker independently while trusting visitor-supplied identity headers.

Reports are immutable submissions apart from moderation status and review notes. Clients cannot publish by setting a status in the report payload. One report can contain a partial timetable and up to three Jummah congregations. Confirmations have a database composite uniqueness key covering report, user, prayer/time and date. API write requests enforce same-origin submission, bounded body size, server validation and account limits. Photos are private until the report is published. Photo response authorization is rechecked on every request.

The owner interface supports editing mosque details, reviewing reports/suggestions, withdrawing reports and exporting records. Audit entries record moderation and directory changes. Data exports are sensitive and owner-only. No credentials are stored in source.

Failures retain form state. Report retries use a persistent draft request ID. A database insert and R2 write are not globally transactional; photo writes use separate random keys and losing duplicate inserts delete their own upload, not the previously accepted photo.

Known limitations: authenticated-account limits are not a complete anti-abuse system; confirmations are self-reported; no scheduled deletion/retention jobs; no external identity integration; report-history pagination and backup restoration are deferred beyond the limited pilot. Seed names/coordinates need local confirmation. No mosque-specific jamaat time is generated from astronomical calculations.
