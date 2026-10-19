# Sylhet Jamat owner guide

Updated 19 October 2026. Owner instructions, separate from the visitor pages.

[Open the searchable HTML guide](OWNER-GUIDE.html)

## Contents

- [Start here](#start)
- [Where to find each task](#navigation)
- [Connect hosting once](#hosting)
- [Connect Google sign-in](#google)
- [The six GitHub secrets](#secrets)
- [Check the live website before sharing](#launch)
- [Change wording and colours](#text)
- [Add, edit or hide a mosque](#mosques)
- [Check and change a map pin](#map)
- [Arrange locality groups](#localities)
- [Report actual jamaat times](#times)
- [Review, publish and withdraw](#review)
- [Understand dates, disagreements and confirmations](#status)
- [Back up records and photos](#backup)
- [Future edits and recovery](#updates)
- [Find and fix a problem](#troubleshooting)
- [Costs, limits and reference links](#costs)
- [Files and help for a developer](#handover)

<a id="start"></a>

## Start here

শুরু করুন

This guide is for you, the owner of Sylhet Jamat. The detailed instructions use simple English. Bangla tab names are included so you can find the same controls in either language.

Visitors use the home page at /. Your controls are at /manage. Sign in with the Google email saved as ADMIN_EMAIL. Being signed in with any other Google account does not grant owner access.

The code is prepared for Cloudflare Workers, with D1 for records and private R2 storage for photos. A public launch is complete only after the accounts are connected, the deploy job succeeds, and the live checks below pass. The repository and this guide alone do not mean the site is live.

[Your GitHub repository](https://github.com/TheGzar/Sylhet-Jamat)

[Build and deployment runs](https://github.com/TheGzar/Sylhet-Jamat/actions)

<a id="navigation"></a>

## Where to find each task

কোন কাজ কোথায়

Mosques / মসজিদ: find or add a mosque, edit its name, locality, address and pin, hide a listing, or submit times.

Locality groups / এলাকার বিভাগ: rename areas, change their order, and choose the first mosque. Kudrat Ullah is the default first listing.

Reports & suggestions / সময়সূচি ও অনুরোধ: review times and photos, handle corrections, withdraw incorrect reports, and export records.

Edit text & disclaimer / লেখা ও নোট বদলান: change the notice, site name, heading, introduction, upload request, other visitor wording and colours.

Owner guide / আপনার ব্যবহারবিধি: search this guide or jump through its contents. Each tab has its own bookmarkable address. Open visitor view shows what people see. Only an owner sees the owner shortcuts on that page.

In the live site: /manage?tab=mosques

<a id="hosting"></a>

## Connect hosting once

হোস্টিং চালু করুন

1. Open Cloudflare and create or sign into your account. In Workers & Pages, choose your account’s free workers.dev subdomain. The site address will be https://sylhet-jamat.YOUR-SUBDOMAIN.workers.dev. Record the exact address, without a trailing slash.

2. Enable R2 storage. Check the activation screen for payment-method requirements. Do not buy a domain or upgrade a plan unless you decide you need it. Keep the photo bucket private.

3. Copy your Cloudflare Account ID. Create an account-scoped API token with Workers Scripts: Edit, Workers R2 Storage: Edit, D1: Edit, and Account Settings: Read. Use the correct account as the resource. Keep the token in a password manager until you save it in GitHub Secrets.

4. Complete the Google sign-in setup in the next section. Then add the six GitHub secrets listed below.

5. In GitHub, open Settings > Secrets and variables > Actions > Variables. Create a repository variable named DEPLOY_ENABLED with the value true. Leave PUBLIC_ORIGIN unset when using workers.dev.

6. Open Actions > Check and deploy Sylhet Jamat > Run workflow. Choose main. Both check and deploy must finish successfully. Open the Verify public website step to find the actual website address.

7. The workflow creates or reuses the named database and photo bucket, applies migrations, deploys the existing app, installs runtime secrets and checks public routes. Do not configure a second Cloudflare Builds deployment pipeline for the same app.

[Cloudflare dashboard](https://dash.cloudflare.com/)

[GitHub Actions variables](https://github.com/TheGzar/Sylhet-Jamat/settings/variables/actions)

<a id="google"></a>

## Connect Google sign-in

Google সাইন ইন

1. Open Google Cloud Console and create a project for Sylhet Jamat. Open Google Auth Platform. Set the app name to Sylhet Jamat and provide your real support/contact email.

2. Use an External audience. Request only openid and email. Do not add Drive, Gmail or other unrelated permissions.

3. Create an OAuth client with application type Web application. Add an Authorized redirect URI that exactly matches your site address plus /api/auth/callback. Example: https://sylhet-jamat.YOUR-SUBDOMAIN.workers.dev/api/auth/callback. There must be no trailing slash after callback.

4. Copy the client ID and client secret into the matching GitHub Secrets. Never put the secret into a source file.

5. For an initial test, add your owner Google account as a test user if Google requires it. Before opening contributions to everyone, change the app audience to production and complete any branding, domain, privacy or verification requirements Google displays. Use a separate Google project/client for localhost development.

6. After deployment, test sign-in from the website in a normal browser. Google must return you to the same site, and your owner account must be able to open /manage.

[Google Cloud Console](https://console.cloud.google.com/)

[Official Google OAuth guide](https://developers.google.com/identity/protocols/oauth2/web-server)

<a id="secrets"></a>

## The six GitHub secrets

প্রয়োজনীয় ছয়টি সেটিং

Open the repository’s Settings > Secrets and variables > Actions > Secrets, then New repository secret. Add each name exactly as written. Secret values are private; do not paste them into a chat, issue or public file.

CLOUDFLARE_ACCOUNT_ID: your Cloudflare Account ID. CLOUDFLARE_API_TOKEN: the scoped token created above.

GOOGLE_CLIENT_ID: your Web application client ID. GOOGLE_CLIENT_SECRET: the matching client secret.

AUTH_SECRET: at least 32 securely random characters. Generate and store it once. Keep it unchanged across normal deployments. Changing it signs everyone out.

ADMIN_EMAIL: the complete Google email address you will use to manage the site. This is not a GitHub username. Only one owner email is supported by the current version.

To generate AUTH_SECRET on a computer with Node installed, run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))". Copy the output into GitHub Secrets, not the repository. Replacing a secret requires running the deployment workflow again.

[Open GitHub Actions secrets](https://github.com/TheGzar/Sylhet-Jamat/settings/secrets/actions)

<a id="launch"></a>

## Check the live website before sharing

সবার জন্য দেওয়ার আগে

1. Open the public address in a private/incognito window, without signing in. Check the Bangla and English pages. No owner controls, setup notes, pending submissions or private exports should appear.

2. Search for Kudrat Ullah, Al-Hamra and Al-Marjan. Check locality groups, all six prayer fields and inline report details. Unknown means there is no published report for that prayer. It is not a reason to invent a time.

3. On a phone, open Map, select a marker, view a mosque and return to the list. Test Near me with location permission allowed and denied. Directions should appear only for a listing with a real pin.

4. Sign in as the owner. Change one small piece of wording, save it, reload, and confirm it on the visitor page. Change it back if it was only a test.

5. Submit one genuine timetable report with known times, a public contributor name, the checked date and a readable photo or explanation. Confirm that it is hidden from a signed-out visitor before approval.

6. Open Reports & suggestions, inspect the details and photo, then publish. Check the signed-out page again. Withdraw the report and confirm its time and photo disappear from public view. Republish genuine information only after checking it.

7. Use a second account to test attendance confirmation after the actual congregation. Do not create false reports or attendance just to fill the directory.

8. Check Cloudflare’s request errors, CPU usage and D1/R2 usage after real requests. Local tests do not prove the app fits every free-plan limit. Record the final public URL and save a backup before sharing widely.

<a id="text"></a>

## Change wording and colours

লেখা ও রং বদলান

The time notice is visitor information. Hosting status and setup instructions belong in this guide. There are no public draft or prototype labels in the supplied interface. Existing custom wording already stored in a live database must be reviewed separately.

1. Open Edit text & disclaimer. The prayer-time notice opens first. Edit the Bangla and English fields separately.

2. For the title, heading, introduction or timetable-photo request, open the matching heading. The preview shows the selected language. Do not leave required fields empty.

3. To edit other wording, choose All other text and search for the sentence. Edit the Bangla or English value. Restore original text resets only that entry, and it is saved when you press Save text changes.

4. Open Website colours to change the button and background colours. The server rejects colours that make the main text unreadable. Keeping the existing green and light background is a safe starting point.

5. Press Save text changes. Wait for confirmation. Open visitor page and reload to check the result. If saving fails, keep the page open, correct the error, and retry. Unsaved changes are not published.

In the live site: /manage?tab=settings

<a id="mosques"></a>

## Add, edit or hide a mosque

মসজিদের তথ্য বদলান

The directory currently starts with 166 entries. It is not a complete census. Al-Marjan and other address-only entries need a locally checked position before a map pin can be added. Hiding a listing does not delete its historical reports or their photo files.

1. Open Mosques. Search in Bangla or English and check for duplicates before adding a record. Use the locality filter to shorten the list.

2. Choose a mosque to edit, or press New mosque. Enter the English name, Bangla name if available, locality group, area and address or nearby landmark. Add a source link you have actually checked.

3. A new record starts without a pin. Leave both coordinate fields empty if the exact position is unknown. The mosque can still appear in the list without appearing on the map.

4. Press Save changes. Reopen the listing with View listing to verify the saved name and address. Press Add jamaat times to submit a separate timetable report with evidence.

5. To remove a duplicate or incorrect listing from visitors, choose Hide from visitors and save. The record remains in your controls. To hide the first mosque, first choose a different featured mosque in Locality groups.

In the live site: /manage?tab=mosques

<a id="map"></a>

## Check and change a map pin

মানচিত্রের পিন ঠিক করুন

The current coordinate bounds cover the supplied Sylhet directory. Do not stretch them to add a distant mosque without reviewing the coverage and map behaviour. Basemap tiles need internet access and may fail independently of the mosque list.

1. Check the actual mosque building or entrance against a reliable source and, when possible, someone who knows it. A shopping centre’s centre point may not be the prayer room entrance.

2. In the mosque editor, click the correct place on the map, drag an existing pin, or type the latitude and longitude. Latitude is around 24.89 and longitude around 91.87 in central Sylhet. These examples are not a mosque location.

3. Add the source link and choose the checking status that matches what you did. Keep uncertainty or duplicate-check notes in Location-check notes.

4. If the pin is unverified or wrong, press Remove map pin. Both coordinate fields should be empty. Save changes, then check the visitor listing.

5. Open Directions and check the destination before recommending it to others. Distances from Near me are straight-line estimates, not walking distance or travel time.

In the live site: /manage?tab=mosques

<a id="localities"></a>

## Arrange locality groups

এলাকার বিভাগ সাজান

1. Open Locality groups. Rename the English and Bangla labels as needed. Use the arrows to change the group order.

2. The chosen first mosque appears first, and its locality leads the directory. Other mosques are alphabetical within each locality in the selected language. Near me temporarily changes this to distance order.

3. To add an area, press Add locality, replace both New locality names, then Save all changes. Go to Mosques to assign the relevant listings to that new area.

4. To remove an area, move every mosque in it to another group and save those records first. Then remove the empty group and save the groups. Hidden mosques count too. Other localities is kept for newly approved suggestions and cannot be removed.

5. Check the public list and locality selector after saving. Keep Bodikuna separate from central Bandar Bazar and Collectorate records.

In the live site: /manage?tab=categories

<a id="times"></a>

## Report actual jamaat times

জামাতের সময় যোগ করুন

1. Open a mosque, then Report times, or use Add jamaat times in the owner editor. Sign-in returns you to the selected task.

2. Use a public contributor name and agree to display it. The name is self-reported. It is not a verified identity badge. Account email is not shown to visitors.

3. Fill only known congregation start times for Fajr, Dhuhr, Asr, Maghrib, Isha and Jummah. Leave unknown prayers blank. Jummah allows up to three congregations. Do not enter the start of a talk.

4. Enter the date you checked the timetable and the last date you know it applies. If the last date is unknown, keep it equal to the checked date. Checked dates must be within the last 31 days; the end date can be no more than 31 days after that date.

5. Attach a JPG, PNG or WebP photo under 15 MB. The browser resizes it and converts it to JPG under 2 MB for upload. Photograph only the timetable. Exclude people, animals, private contact details and other personal information.

6. If you do not attach a photo, write at least 10 characters explaining where and how you checked the time. Add useful exceptions in the optional note.

7. Submit for review. It is not public until approved. If submission fails, the text is preserved for retry. Text can be restored on this browser, but a photo must be selected again after a reload. Avoid shared-device storage for private information.

<a id="review"></a>

## Review, publish and withdraw

সময়সূচি পর্যালোচনা

1. Open Reports & suggestions. Waiting for review shows pending reports first. Use Show > Published to find a report you need to withdraw, or All reports to see both.

2. Check the mosque, contributor name, checked date, last applicable date, each prayer and its AM/PM value, source, explanation and photo. Compare with the actual timetable. Uploaded date alone does not prove a time is current.

3. If the report is correct, tick I have checked the details and evidence and press Publish. If it is incorrect or unreadable, add a clear review note and press Reject. The current version does not edit another contributor’s times in place. Reject it and request a corrected report.

4. For an incorrect time flag, check the underlying report. Withdraw flagged report removes that report from public view. Reject dismisses the flag and leaves the report published. These actions have different consequences.

5. For a directory correction, press Edit mosque details, make and save the correction, return to Reports & suggestions, add a note explaining what changed, then Mark corrected.

6. For a missing mosque suggestion, check duplicates and location before publishing it. After approval, find it in Mosques, assign the right locality and improve its address. Suggestions may arrive without coordinates.

7. For an already published report, press Withdraw when it is wrong. Its photo is no longer available to ordinary visitors. The record remains in the private export for history. The author and owner may still access it. Keep review notes suitable for the contributor to read.

In the live site: /manage?tab=reports

<a id="status"></a>

## Understand dates, disagreements and confirmations

তারিখ ও নিশ্চিতকরণ

The app selects each prayer independently, using the checked date first and the upload date second. A partial report changes only the prayers it contains. Two different times checked on the same latest date are shown as a disagreement.

Fajr and Maghrib need a fresh check after more than 3 days. Other prayers need a fresh check after more than 7 days. The explicit last applicable date takes precedence. An expired report stays labelled as expired until newer information is supplied.

Attendance confirmation means someone says they prayed at that time today. It is allowed after the congregation, within the reported date range. Jummah confirmation is restricted to Friday. People cannot confirm their own report or add repeated confirmations for the same prayer/time in one day.

Confirmations do not extend validity and are not a guarantee. There is no calculated prayer-window time substituted for a missing jamaat time. Dates and daily limits use Bangladesh time.

Daily limits in the current code are 15 report attempts, 40 confirmation attempts and 10 suggestion attempts per account. Repeated attempts may use the limit. These protect the small community service from misuse.

<a id="backup"></a>

## Back up records and photos

ব্যাকআপ রাখুন

1. In Reports & suggestions, press Export records. Save the JSON in a private dated folder. It includes reports, confirmations, suggestions, mosque changes, settings, review history and the seed directory. It contains account identifiers and must not be published.

2. Back up the actual D1 database separately before hosting moves or database changes. In Cloudflare, open the sylhet-jamat D1 database. Use its export/backup controls, or have a developer run: pnpm exec wrangler d1 export sylhet-jamat --remote --output=backup.sql.

3. Back up uploaded photo objects from the private sylhet-jamat-timetables R2 bucket. Keep their exact object keys, such as timelines/....jpg, so database references still work. For many objects, a developer should use an authenticated R2-compatible backup tool.

4. Keep three things together: the source code, the database backup, and the photo-object backup. A source ZIP contains neither live reports nor uploaded photos. The JSON export contains record data and photo references, not photo bytes.

5. There is no one-click restore/import screen in this version. A developer must restore to a separate test database and private bucket first, verify records and photo links, and then plan any production replacement. Do not overwrite live data just to test a backup.

[Cloudflare D1 export reference](https://developers.cloudflare.com/d1/best-practices/import-export-data/)

[Cloudflare R2 documentation](https://developers.cloudflare.com/r2/)

In the live site: /manage?tab=reports

<a id="updates"></a>

## Future edits and recovery

পরবর্তী পরিবর্তন

Everyday mosque and wording changes use /manage and save to D1. They take effect without a GitHub commit. The visitor page reloads reports when opened or when the tab becomes active. Reload a page if you are checking a recent edit.

Code changes go to the existing TheGzar/Sylhet-Jamat repository. A push to main runs the checks, then deploys to the same Cloudflare Worker if DEPLOY_ENABLED is true and all secrets are configured. Pull requests run checks without deploying.

If a check fails, open the failed step in Actions. Later steps do not count as completed. If the check job passed but deploy was skipped, publishing has not happened. Never treat a green check job alone as a live deployment.

To pause future deployments, change DEPLOY_ENABLED to false. This does not take the current site offline. For a bad code release, revert the offending code commit and let checks run again. Database migrations are separate: reverting source does not undo database changes. Back up first and get developer help for schema recovery.

The framework is pinned to Vinext 1.0.0-beta.5, Vite 8 and React 19. Do not update all dependencies at once just for a version label. A developer should check release notes and run the complete tests before an upgrade.

For a custom domain later, configure the actual Cloudflare domain, set PUBLIC_ORIGIN to its exact HTTPS origin without a trailing slash, add the matching Google callback URI, and rerun deployment. Test login and reports on the new address before sharing it.

[Repository files](https://github.com/TheGzar/Sylhet-Jamat)

[Actions history](https://github.com/TheGzar/Sylhet-Jamat/actions)

<a id="troubleshooting"></a>

## Find and fix a problem

সমস্যা হলে

**Owner access required**
Sign out and sign in with the Google email in ADMIN_EMAIL. If the secret changed, redeploy. There is no owner password reset form.

**Google redirect_uri_mismatch**
Copy the exact live origin plus /api/auth/callback into the Google Web client. Check spelling, HTTPS and trailing slashes. Check PUBLIC_ORIGIN.

**Only Google test users can sign in**
Check the Google Auth Platform audience and testing status. Publish the consent configuration and complete requirements Google displays.

**Check passed but no website appeared**
Open the deploy job. If skipped, set DEPLOY_ENABLED=true. Add all six secrets. Run the workflow on main and inspect the Verify public website step.

**Cloudflare setup fails**
Check the account ID, token resource/account and permissions, workers.dev subdomain and R2 activation. Do not recreate or delete the database.

**Photo preparation or upload fails**
Choose JPG, PNG or WebP under 15 MB, crop to the timetable and retry. If necessary submit a truthful evidence explanation without a photo. A reload requires choosing the photo again.

**Times say Unknown**
There is no published report for that prayer. Submit genuine times and approve them after checking. A mosque directory entry is not a timetable report.

**Report expired or times disagree**
Check the mosque again and submit a new dated report. Review conflicting reports. Do not remove the date label to make old times look current.

**Mosque missing from the map**
Check the locality/search filters and whether the listing has both coordinates. Pinless listings stay in the list. Do not add a guessed pin.

**Changes are not visible**
Press the correct Save button and read the result. Reload the visitor page. For code changes, check the latest deploy job and confirm you are using the same live address.

**Cannot remove a locality or hide the first mosque**
Move every mosque out of the group before deleting it. Choose another first mosque before hiding the current featured listing.

**Site stops responding or exceeds limits**
Check Cloudflare errors, CPU and D1/R2 usage. Free Workers CPU limits can affect even low-traffic requests. Measure first; optimise or decide whether a paid plan is needed.

**Saved mosques are missing on another phone**
Saved mosques are stored only in that browser. They do not sync across devices or accounts.

<a id="costs"></a>

## Costs, limits and reference links

খরচ ও সীমা

Checked 19 October 2026 against the official links below. Start with Workers Free and the included storage allowances. There is no requirement to buy a domain. Check your account’s actual billing settings before accepting a paid service.

Workers Free: 100,000 dynamic requests per day and 10 milliseconds CPU per invocation. Static asset requests are free and unlimited. The app’s server rendering and API work must fit the runtime limit. Workers Paid starts at USD 5 per month plus usage.

D1 Free: 5 million rows read per day, 100,000 rows written per day and 5 GB total storage. Queries can fail at the daily limits. R2 Standard includes 10 GB-month storage, 1 million Class A and 10 million Class B operations per month; excess usage is chargeable. R2 activation may require a payment method.

The app requests no paid Google APIs. Google OAuth and GitHub Actions still have account policies and quotas. Monitor all relevant dashboards rather than assuming unlimited free operation.

The supplied source includes no API secrets. Keep required font and component licences, and OpenStreetMap attribution. Professional presentation does not require removing licence notices.

[Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)

[D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)

[R2 pricing](https://developers.cloudflare.com/r2/pricing/)

[Google OAuth production policy](https://developers.google.com/identity/protocols/oauth2/production-readiness/policy-compliance)

<a id="handover"></a>

## Files and help for a developer

ফাইল ও ডেভেলপার সহায়তা

Keep this guide and the project ZIP. Open docs/OWNER-GUIDE.html in a browser for the searchable offline guide. Use its Print button to print or save a PDF. It needs no login and contains no secrets. Local links to your management page work only when you open the guide inside the live app.

The editable guide source is data/owner-guide.json. Run pnpm guide:build to regenerate the Markdown and standalone HTML versions. Other owner documentation is under docs/. The visitor homepage is app/page.tsx, owner controls are app/manage/page.tsx, API routes are app/api/[...path]/route.ts, and styling is app/globals.css.

For a developer handover, share the repository link, failing step/error, relevant screenshot and what you expected. Give only the minimum account access needed. Do not publish exports or copy passwords into an issue.

The local verification commands are: pnpm install --frozen-lockfile; pnpm typecheck; pnpm test; pnpm test:api; pnpm build; pnpm test:production; pnpm deploy:check. Use Node 24 and the package manager version pinned in package.json.

Functional checks can test permissions, saved records, photos and production HTTP responses. They do not replace live Google login, real phone/browser checks, accessibility checks or a short try-out by someone who has not seen the app before. Ask them to find a mosque and check a reported time, then observe where they need help.

