# Verification

## Automated checks

- 33 authentication, prayer-domain and directory checks.
- 44 API checks against isolated D1 and R2 storage.
- TypeScript validation and production build.
- Deployment dry run with the generated Worker configuration.
- Compiled-application HTTP checks for the home page, management page, directory API, favicon, manifest, Bengali font and referenced JavaScript assets.

Coverage includes signed sessions, tampered and expired cookies, OAuth state and PKCE, owner permissions, pending-report privacy, photo access, timetable selection, editable wording, coordinate validation and forged identity headers. Tests do not create production submissions.

Run the checks with:

```sh
pnpm typecheck
pnpm test
pnpm test:api
pnpm build
pnpm test:production
pnpm deploy:check
```

## Live verification

Production publishing needs the Cloudflare and Google credentials described in README.md. Local OAuth mocks do not verify the consent screen or real account login. Before community use, check owner sign-in, a timetable publication, a photo upload and withdrawal on the final host.

Browser/device visual checks, accessibility testing and production CPU measurements remain outstanding. Workers Free has a 10ms CPU limit per invocation; a passing local build does not establish that every production request fits that limit.
