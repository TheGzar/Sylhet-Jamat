# Interface design

The interface uses white and deep green, readable Bangla typography, simple controls and compact timetable rows. Wording stays plain and factual. Photographs are limited to submitted timetable evidence; the interface contains no images of living beings.

The public page centres on finding a mosque and checking its reported jamaat times. Each listing shows locality, address, all six prayer fields and available report evidence. Kudrat Ullah appears first, followed by names grouped by locality and sorted alphabetically. Desktop users see a list and map; phone users can switch between them.

Report dates, contributor names and evidence remain visible beside times. Unknown, old, expired and conflicting reports have distinct labels. No calculated prayer-window time is presented as a mosque's jamaat time.

Owner controls are available separately at `/manage`. Text, disclaimer, locality groups, mosque details, map positions and colours can be edited without changing source code. Save status and failed submissions remain visible, and failed saves preserve entered text.

Layouts must support narrow screens, keyboard navigation, visible focus and reduced-motion preferences. Device and accessibility checks are documented in the test report.
