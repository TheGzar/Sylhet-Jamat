# Quick edit: text and disclaimer

1. Open `/manage?tab=settings` while signed in as the owner, or use **Edit text & disclaimer** above your visitor view.
2. **Prayer-time disclaimer** opens first. Type the Bangla and English text. The preview underneath shows the selected visitor language.
3. Press **Save text changes** in the bar at the bottom. A failed save keeps your entries so you can retry.
4. Use **Open visitor page** to see the saved result.

The same page edits the upload request, website name, heading and introduction. Choose **All other text**, then search for a visible sentence to edit labels, help text and report-form instructions. **Restore original text** removes that entry’s changes. Site text is plain text, so no HTML or coding is required.

Mosques with no sourced map position remain searchable and accept timetable reports. They do not get an invented map marker or walking route. To add the actual pin, open the mosque in management, click its location or enter both coordinates, then Save.

# Editing your website

Open the normal website to see the visitor view. Open `/manage` to edit it. After independent deployment, sign in with the Google account configured as ADMIN_EMAIL. Public browsing needs no account.

## Everyday changes without coding

- **Mosques:** choose a mosque, edit its English or Bangla name, locality and address, then Save. You can add a mosque, hide a listing or move its map pin by clicking or dragging. Check the source before changing a pin.
- **Locality groups:** rename groups, add groups and change their order with the arrows. Move mosques out before deleting a group. Kudrat Ullah is selected as the first mosque. Other names are alphabetical within their locality in the chosen language.
- **Reports and suggestions:** check the contributor, mosque, observation date, times and photo or explanation before publishing. You can withdraw incorrect reports. A contributor name is self-reported, not verified identity.
- **Site text and colours:** edit both language versions of the title, introduction, short time notice and upload request. Choose dark buttons and a light background.
- **Open visitor view:** use this button to see what people will see. The six prayer times and report evidence are visible in each listing. Missing times remain blank rather than using calculated prayer times.
- **Export records:** download your current database records from Reports and suggestions. Photo files are separate from that JSON export.

A source ZIP is a copy of the website code and seed directory. It is not a backup of live reports or uploaded photos. Keep regular record exports.

## Current limits

There are now 166 directory entries: 151 with sourced map positions and 15 with address/locality only. Al-Marjan is included from the owner’s local report, with its building address independently sourced. Prayer floor and entrance are not asserted. Coverage is not a complete census of Sylhet. Locality categories are browsing groups, not official boundaries. Full street addresses are shown only where sourced. Map evidence and possible duplicate records are documented in `location-audit.json`.

The original ChatGPT version was deployed separately. Independent hosting requires the account setup in README.md. Opening the ZIP on your phone does not run its database. Use the website links for everyday work. A developer moving it to another host must configure Google OAuth authentication, D1 storage, R2 photos and the owner identity, run all database migrations, then build it. Do not put API secrets in the source files.

## Earlier setup notes

# Sylhet Jamaat: owner guide

The first version is a website that can also be added to a phone’s home screen. It is not an Android APK or an App Store release.

## Open and manage it

1. Open https://sylhet-jamaat.bilmdahmed.chatgpt.site after deployment succeeds.
2. Use the same ChatGPT account that owns this project. The initial deployment is private. Other people cannot visit it yet.
3. Switch between বাংলা and English in the top right.
4. Choose a mosque. Use **Report jamaat times** to enter a real timetable.
5. Enter only the prayers you checked. For Jummah, enter jamaat starts, not the start of the talk. Up to three Jummah congregations are supported.
6. Set the date you checked the information. If you do not know how long it applies, keep the end date equal to the checked date.
7. Attach a timetable photo if available. Photograph the board only. Do not include people, animals, private phone numbers or other personal details.
8. Submit, then open **Reports and suggestions** at `/manage`. Check every time against the photo or mosque staff. Publish or reject it. Publishing does not independently certify its accuracy.
9. For a wrong mosque name or location, open that mosque and choose **Edit mosque details**. Save the correction. You do not need to edit code.
10. Use **Export records** regularly. This JSON export contains reports, confirmations, directory changes and review history. It includes file keys, not the photo binaries. Keep the export private. A complete recovery backup also needs the photo files and database restore testing.

## What is built

- Bangla-first interface with an English switch.
- Search in the recorded English and Bangla names and area fields.
- Real map with markers, zoom and mosque selection.
- Google Maps directions links, without copying Google place content into the database.
- Optional location permission for straight-line distance sorting. The app does not send the visitor’s location to its own backend.
- Device-local saved mosques. These do not sync across phones.
- Shared reports for Fajr, Dhuhr, Asr, Maghrib, Isha and Jummah.
- Checked date, submission date and last applicable date.
- Optional resized timetable photo, with common JPEG metadata stripped server-side.
- Owner review before new reports and photos appear to other visitors.
- Attendance confirmation tied to a particular prayer time and Bangladesh date. Duplicate daily confirmations and self-confirmations are rejected.
- Incorrect-time flags, missing-mosque suggestions, and name/location correction requests.
- Owner-only publishing, withdrawal, directory edits and record export.
- A phone home-screen manifest and offline page. Offline mode deliberately does not display saved prayer times.

## What the mosque list means

The original base contained 69 source-linked OSM map records in an approximate Sylhet urban rectangle. The expanded directory now contains 166 entries. Some original records had no recorded local name. This is not a verified city-corporation boundary and is not an exhaustive list. It can include surrounding urban places and omit mosques that are not mapped. Coordinates are map geometry points, usually building centers, not verified entrances.

The Google Maps searches performed for this task did not return a usable comprehensive city list. The baseline therefore comes from independently obtained OpenStreetMap records. No Google reviews, photos, coordinates or place descriptions were copied. The full collection notes are in `MOSQUE-DATA-NOTES.md`.

No jamaat times, attendance counts, photos or amenities were fabricated. The empty timetable fields are intentional.

## How to fill the directory properly

Start with 10 to 15 mosques you or volunteers can visit. Keep the full map directory available, but publish times only when someone checks them. Ask one regular attendee at each mosque to report changes.

For city-wide coverage, use a ward-by-ward checklist. Check local names and alternate spellings, distinguish daily mosques from Eidgahs and shrines, and review the six unnamed records. Visit missing lanes and ask local mosque committees. A search result count is not evidence that the list is complete.

Record the date printed on a timetable when present. Ask staff about changing Fajr and Maghrib jamaats, Friday congregations, Ramadan and temporary closures. Do not infer jamaat by adding a fixed number of minutes to calculated prayer times.

## Report rules

Reports are ordered primarily by the date observed, not the upload date. A newly uploaded old board should not replace newer observations. Partial reports only affect the prayers included. Different times observed on the same date show a conflict instead of silently choosing a winner.

Fajr and Maghrib reports are marked for a fresh check after 3 days. Other prayers are marked after 7 days. These are conservative app rules, not religious rules or claims about local practice. An explicit end date takes precedence. Confirmations do not automatically extend that date or make an old timetable current.

For multiple Jummah congregations, each time has a separate attendance confirmation. A confirmation can be submitted only after that time in Bangladesh, only on Friday for Jummah, and within the report’s date range. This reduces mistakes but cannot prove someone actually attended. The app does not collect attendance location.

New reports are limited to 15 per account per Bangladesh date, suggestions to 10, and confirmation requests to 40. These pilot limits do not replace protection against people creating many accounts.

## Before public use

The code and private deployment are a pilot, not a claim of public-launch readiness. Complete these checks:

- Open the site on a real Android phone, an iPhone if available, and a desktop. Check Bangla rendering, map markers, narrow widths and large text.
- Test with keyboard navigation and a screen reader. Automated code checks are not an accessibility certification.
- Submit a real timetable, reopen it, approve it and verify it appears to a second account. Withdraw it and verify the time and photo disappear from that account’s view.
- Test a weak connection, failed upload, denied location permission, blocked map tiles, and returning to a saved draft.
- Check the phone home-screen installation. It has not been tested on physical devices.
- Ask three local people to find a mosque and tell you whether its time is current, without explaining which controls to use. Observe where they hesitate.
- Ask a local Bangla speaker and a mosque volunteer to review wording and timetable interpretation.
- Nominate someone to review submissions daily and respond to corrections. Do not publish unreviewed photos.
- Export a small sample and practise restoring records and photos before relying on backups.

When ready, request that this existing Site be made public. Changing audience is separate from deploying code. No additional paid service was purchased in this build.

## Sign-in and hosting limits

This version uses ChatGPT sign-in for contributors and the owner. When public, visitors can browse without signing in, but reporting requires a ChatGPT account. That is a real barrier for some local users. For a wider launch, email or phone sign-in may be preferable, but needs a supported authentication integration and additional testing. It has not been implemented here.

Hosting, database and file storage are connected through Sites. This is not a promise that hosting is permanently free or unaffected by subscription changes. Confirm your account’s hosting and access terms before using this as the only public service.

The source is retained in the Site’s Git repository. It uses React/TypeScript, Vinext, a Cloudflare Worker, D1 and R2. For independent hosting, a developer must adapt the Sites-specific build/authentication integration, create the database and bucket, apply migrations, set the moderator identity, configure authentication, and test the complete flow. Uploading the static files alone will not preserve reports or photo uploads.

## Money and people

For a small self-hosted pilot, a planning allowance of US$0 to US$10 per month for basic infrastructure is reasonable if usage stays inside provider limits. This is an estimate, not a quote for the current Sites hosting. Domain registration is optional and priced separately at checkout. Photos, heavy use, paid map tiles, email/SMS, or hired maintenance can raise costs.

Cloudflare’s published Workers pricing includes a free tier, and a paid subscription starting at US$5 per month, with usage limits and extra charges. D1 and R2 have their own allowances. Check current pricing before purchase:

- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/r2/pricing/

OpenStreetMap standard tiles have usage conditions and no service guarantee. The app displays attribution, uses normal browser caching and does not download map regions for offline use. If traffic grows or reliability becomes important, move to a suitable hosted tile provider and review its current price.

You can handle timetable collection and daily review without learning to code. A volunteer with web development experience should handle security updates, technical errors, backup restoration and future hosting changes. Useful skills are TypeScript/React, SQL, authentication, file upload security, mapping and deployment. The ongoing local checking work is at least as important as the software.

## What to add later, after the pilot

The next useful improvements are verified mosque representatives, a more accessible contributor sign-in option, map-based missing-mosque pin placement, edit proposals with duplicate detection, per-mosque pagination, automated backup and retention jobs, abuse monitoring and approved mosque amenity information. Do not add guessed amenities or automatic prayer-time-to-jamaat conversions.

The initial read endpoint caps report history at 2,000 rows, and the review queue at 1,000. This is suitable for a limited pilot, not indefinite city-wide operation. Add pagination and per-mosque history queries before those limits are approached. No load test or penetration test has been completed.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| Cannot open management page | Sign in using the Site owner account. The server checks the configured moderator email. |
| A mosque has no times | Collect a real report. Do not substitute calculated prayer start times. |
| Submitted report not public | Check Reports and suggestions at `/manage`. Pending reports are hidden from the visitor view. |
| A name appears twice | Compare coordinates and original source links before merging. Do not merge mosques merely because names match. |
| Photo will not upload | Use JPG, PNG or WebP under 15 MB. The browser resizes it; the server accepts JPG under 2 MB. Crop to the timetable if needed. |
| App says times disagree | Compare dated evidence and withdraw the incorrect report, or obtain a newer observation. |
| Confirmation rejected | Check that the jamaat has already occurred today, the report is applicable, and it is not your own submission. Jummah confirmation is Friday-only. |
| Map blank | Use the list while checking the connection or tile service. The timetable directory does not depend on a map click. |
| Records fail to load | Retry. The built-in mosque list remains visible, but live reports cannot be assumed current. |
| App opens offline | Reconnect. The app will not show an old timetable as current. |
