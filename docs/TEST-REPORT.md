# Independent deployment verification

- Installed using pnpm 11.25.0 and the project lockfile.
- 33 auth, prayer-domain and directory tests pass.
- 44 API checks pass against isolated D1/R2 storage, using signed sessions.
- Production build and TypeScript check pass.
- Wrangler deployment dry run passes (about 323 KiB compressed Worker code).
- The compiled Worker serves /, /manage, favicon, manifest, Bengali font, API directory and the JavaScript assets referenced by the page in local HTTP checks. Forged owner headers are rejected.
- Production smoke tests use explicit bundled modules and a local assets router with has_user_worker enabled, matching a full-stack deployment.
- Cloudflare deployment and real Google consent/login remain blocked on account credentials. No independent public URL has been verified.
- Browser visual testing and free-tier CPU measurements remain unverified. The 10ms Workers Free CPU limit may require a paid plan; no plan upgrade is authorized or performed.

## Original app checks

# Verification, 18 October 2026

- 20 domain and directory tests pass.
- 44 API checks pass against an isolated test database.
- Coverage includes permissions, pending-report privacy, publication, photo access, named evidence, editable text persistence, invalid text keys, contrast validation, and address-only mosque editing without a fake pin.
- 166 directory entries, 151 with source-based pins and 15 without coordinates.
- Retained original OSM IDs when matching previously unnamed mosques. Directory sources and review decisions are in city-expansion-audit.json.
- TypeScript and production build checked for this release.
- Browser visual/interaction QA was unavailable in this environment. Phone map gestures, layout and uploads still need a real-device check before broad invitations.

No source’s calculated prayer-window times were imported as mosque jamaat times. No live submissions were created by tests.
