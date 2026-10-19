# Owner guide

Visitors use `/`. Manage the directory at `/manage` by signing in with the Google account configured as `ADMIN_EMAIL`. Deployment and account setup are documented in [README.md](../README.md).

## Edit text and the disclaimer

1. Open `/manage?tab=settings`, or select **Edit text & disclaimer** above your visitor view.
2. The prayer-time disclaimer opens first. Edit the Bangla and English wording separately and check the preview.
3. Press **Save text changes** at the bottom. If saving fails, your entries remain available for a retry.
4. Use **Open visitor page** to check the saved result.

This page also controls the website name, heading, introduction, timetable-photo request and colours. For other wording, select **All other text** and search for the sentence. **Restore original text** removes that entry's custom wording. No HTML or coding is required.

## Manage mosques and localities

Select a mosque in **Mosques** to edit its names, address, locality, source link and map position. Add a mosque with **New mosque**, or hide an incorrect listing while checking it. Confirm the source before moving a pin. If the exact location is unknown, leave both coordinate fields empty; the listing remains searchable without a map marker or walking route.

Use **Locality groups** to rename, add and reorder areas. Move a group's mosques elsewhere before removing the group. Kudrat Ullah is selected as the first listing. Other names are alphabetical within each locality in the chosen language.

## Review reports

Open **Reports & suggestions** and check the mosque, contributor's public name, dates, times and evidence before publishing. The name is supplied by the contributor and is not verified identity. Reports require a photo or an explanation of how the time was checked. Timetable photos should contain no people, animals, private contact details or other personal information.

Enter only known jamaat times. For Jummah, use congregation starts rather than the start of a talk. Up to three Friday congregations are supported. If the end date is unknown, keep it equal to the checked date.

New reports and photos remain pending until published. Withdraw a report when it is incorrect. Corrections and missing-mosque suggestions appear in the same review queue.

## Dates and confirmations

Reports are ordered by observation date before upload date. Partial reports affect only the prayers included. Conflicting observations from the same date remain marked as disagreements.

Fajr and Maghrib reports receive a fresh-check label after three days; other prayers after seven days. An explicit end date takes precedence. These are application rules, not mosque rules. Attendance confirmations do not extend a report's validity.

A person can confirm another contributor's time only after that congregation, within its reported date range. Jummah confirmation is limited to Fridays. Self-confirmations and repeat daily confirmations are rejected.

## Backups and day-to-day operation

Use **Export records** to download reports, directory changes, settings and review history. Keep the export private. Photo files are stored separately in R2 and require their own backup. A source ZIP does not contain live records or uploaded photos.

In-app changes are saved in D1 and survive code deployments. Review new submissions and flagged times regularly. After a release, check public browsing, owner sign-in, one timetable publication and a photo upload on the live site.

## Directory coverage

The seed directory has 166 entries: 151 with sourced map positions and 15 with address or locality details only. Locality groups are browsing categories, not official boundaries. Coverage is incomplete and some nearby records still need local duplicate checks. See [MOSQUE-DATA-NOTES.md](MOSQUE-DATA-NOTES.md) and the source-audit JSON files for evidence and limitations.

## Phone use

On Android, choose **Install app** or **Add to Home screen** in the browser menu. On iPhone, use Safari's Share menu and **Add to Home Screen**. Internet access is required for current reports and maps. Saved mosques are stored on the device and do not sync between phones.
