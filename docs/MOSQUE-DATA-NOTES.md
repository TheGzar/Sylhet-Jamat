# City expansion, 18 October 2026

The directory has 166 entries, increased from 69. New research focused on inner-city neighbourhoods, shopping-centre prayer spaces, markets, hospitals and madrassas. Sources include individual PraySalat listings, PrayersConnect, Mosjid.info, Cybo, Trip.com, local news and a UCB document for Al-Marjan’s building address only.

151 entries have source-based coordinates. Where a source published a shortened plus code, it was recovered within Sylhet’s 7MPH code region and decoded to the code cell’s centre. Other coordinates come from the source-linked map destination. These are record locations, not surveyed doorways. 15 listings have no coordinates, appear in the list and are omitted from map markers, distance estimates and walking directions.

Al-Hamra Shopping City mosque is included using the Kazi Ilias Road listing and the owner’s local report. The similarly named Al Hamra mosque at Jotorpur is kept separate. Al-Marjan is a local report from the owner, not an independently confirmed mosque listing. The UCB reference confirms its building and Zindabazar address. Floor, entrance, access hours and jamaat times are not guessed.

Matched previously unnamed OSM records for Noya Shorok and Kazi Jalal Uddin. Matched the university mosque to the existing agricultural-university point. Kept the original IDs and coordinates to preserve reports. Nearby Baitunnur and Shonarpara records need local duplicate checking. Uncertain Osmani-campus and Mojumdar-para identities were held out rather than counted again.

Cybo contains unrelated district records and repeated city-centre placeholders. These were excluded. Some further directory pages were blocked, so this release does not claim every city mosque is covered. No municipal boundary verification or field survey has been completed.

`city-expansion-audit.json` records additions, sources and matching decisions. `location-audit.json` is the earlier audit of the original 69 entries. Bangla names newly transliterated for readability can be corrected by the owner. The original OSM database attribution remains required.

## Earlier source notes

# Sylhet mosque data notes

Checked 17 October 2026 UTC (18 October in Bangladesh).

## What the seed contains

`mosques.json` contains 69 mapped mosque locations, including 6 without a specific recorded name. All 126 small map-extract requests in the stated search rectangle completed successfully. Eight shrine/Eidgah-labelled records were excluded and five duplicate representations removed. It does not contain verified jamaat times. Every entry links to its location source. Names and coordinates are mapping records, not mosque-management confirmation. Building coordinates are approximate centers, not entrance coordinates.

The search rectangle is 24.86–24.95 north and 91.81–91.95 east. This covers central Sylhet and nearby urban areas, including parts of the university and Shah Paran areas. It is not an official city-corporation boundary. Do not label this directory as every mosque in Sylhet city.

## Sources and attempts

- Direct OpenStreetMap API map extracts, divided into small geographic boxes because a large request exceeded the API's node limit. Example: https://api.openstreetmap.org/api/0.6/map?bbox=91.86,24.89,91.87,24.90
- OpenStreetMap-derived Mapcarta pages helped identify and cross-check initial places. Example: https://mapcarta.com/W537098429 for Hazrat Shahjalal Jame Masjid, distinctly separate from the adjacent shrine.
- Google Maps was searched directly in the browser for “mosques in Sylhet city” and then “mosque Sylhet Bangladesh”. The observed searches returned only two historical mosques outside Sylhet city, near Moulvibazar/Sreemangal. This is inadequate city coverage. These results were not imported.
- A secondary directory at https://praysalat.com/mosques/bangladesh/sylhet advertises 95 entries. Inspection showed duplicates and out-of-city entries, including Golapganj and Osmaninagar. It was not used as an all-city inventory and its data was not copied into the seed.
- Overpass public endpoints returned HTTP errors in this environment. Direct OSM API extracts were successful.

## Filtering and corrections

Selected Muslim places of worship and buildings explicitly tagged as mosques. Excluded names explicitly indicating a shrine/Mazar or Eidgah pending separate local verification. A shrine can have an adjacent mosque, but they must not automatically share an identity or daily schedule. Exclusions are retained in `mosques-excluded.json` for review.

Records were deduplicated by OSM object identity and matching nearby names. Four close or overlapping duplicate representations were manually consolidated: an unnamed university mosque polygon near its named point; overlapping Shah Paran Hall Mosque/Hall mosque polygons; an unnamed polygon near the named Central Mosque polygon; and nearby Islampur Colony/Koloni point and polygon records. Nearby mosques with different names were retained where they may be distinct.

Removed the apparent navigation-text prefix “Directions” from Collectorate Jame Mosque's display name, preserving the original source name.

No times, confirmation counts, amenity claims or reporter identities were invented. Empty or generic mosque names still need local naming. Some map tags may be stale or inaccurate. A named mosque does not establish that Friday prayers are held there.

## Reuse and attribution

Data: © OpenStreetMap contributors, available under the Open Database License (ODbL). Show attribution and a license link. Keep the downloadable derived mosque directory available under ODbL, with source identifiers intact.

https://www.openstreetmap.org/copyright
https://opendatacommons.org/licenses/odbl/1-0/

Google Places results cannot simply be harvested into a permanent independent directory. Its policies restrict caching/storage and require Google Maps for displaying API results on a map. Google Maps directions links can still be offered for independently sourced OSM locations.

https://developers.google.com/maps/documentation/places/web-service/policies

## How to complete local coverage

Agree the city boundary, obtain or verify all ward boundaries, and review each ward with local volunteers. Compare names and positions in person or against an authorized mosque list. Ask mosque committees to identify missing mosques and separate mosque entrances from shrine compounds. Keep missing-mosque submissions pending review. Record source, checked date and location confidence independently of jamaat-time freshness.

A directory is complete only after a documented local coverage review. Search-engine result counts and the size of the seed are not proof of completeness.
