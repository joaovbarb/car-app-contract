# Car App public contract

The read-only API of a catalogue of new battery-electric cars on sale in Portugal: makes, models, versions (trims),
specifications, equipment features, approximate cash prices and photos. This directory is the whole contract a
frontend needs. It is written for a frontend **in another repository**, which knows nothing about the backend.

## Status: pre-stable

The contract may still change. Every change, breaking or not, is recorded in the changelog at the top of
[integration.md](integration.md), newest first, with a date; [CHANGELOG.md](CHANGELOG.md) holds older revisions.
**Check the changelog whenever you update your copy.** No versioning promise is made yet: until a stable version is
declared, a change may land under the same `apiVersion` (`"1"`).

## What is here

| File | What it is |
| --- | --- |
| [integration.md](integration.md) | Routes, parameters, rendering rules, errors, caching, and the changelog. Read it first. |
| [contracts.ts](contracts.ts) | The authoritative Zod 4 schemas and TypeScript types of every body. Browser-safe, no imports but `zod`. |
| [definitions.ts](definitions.ts) | The fixed specification and feature definitions, exactly as `/definitions` serves them. |
| [schema.json](schema.json) | The same contract as JSON Schema (draft 2020-12): every route's success body, the error body, the definitions. |
| [fixtures/synthetic-v1.json](fixtures/synthetic-v1.json) | Synthetic example bodies for every route and error. |
| [fixtures/stats-v1.json](fixtures/stats-v1.json) | Synthetic example bodies of `/stats` (same wrapper as `synthetic-v1.json`: `scenarios` and `errors`). |

`definitions.ts` and `schema.json` are generated; never edit them by hand.

## Getting the contract

- **From the public mirror repository**, which holds only this directory: copy the files, add it as a git submodule,
  or read the raw files. Pin the commit you built against and review the changelog before moving to a newer one.
- **From the API itself**: `GET /api/public/v2/contract` returns, in the usual envelope, `apiVersion`, `status`
  (`"pre-stable"`) and the JSON Schema of every route's success body and of the error body, plus the definitions.
  It is generated from `contracts.ts` and `definitions.ts` at runtime, so it always matches the deployed API.
  `schema.json` is the same document (without the envelope and `kind`).

**TypeScript frontends** copy `contracts.ts`, `definitions.ts` and the fixtures into their own source (for example
`src/generated/contract/`), install `zod` 4 (4.6.1 or later) in their own project, import `responseSchema`,
`errorSchema` and the exported types, and treat the copy as generated: replace it on update, never edit it. This is what
the frontend in the backend's own repository does. **Other frontends** use `schema.json` or the `/contract` route.

## Rules for a frontend

- **Parse leniently.** Tolerate fields you do not know, and new values of an enumeration: a new value is not an error.
  Show what you understand and skip or label the rest. (The JSON Schema leaves objects open to new fields, but lists
  enumeration values as they are today; do not let a strict validator reject a body over a new value.)
- **Absent and null mean what the contract says.** `null` means not known or not available; it is never zero, false or
  an empty list. An absent optional field is not the same as an empty one (`data.photos` absent is "not supplied", `[]`
  is "no photos"). Unknown specifications and features are shown as unknown.
- **Cache; do not call the API per visitor.** Fetch on your server or at build time, keep the result, and refresh it
  on a schedule. Respect the cache headers: a success is
  `public, max-age=60, s-maxage=3600, stale-while-revalidate=86400`, so a response may be about an hour old, and older
  (up to about 25 hours) on the first request after a quiet period; errors are `no-store`. Your own cache adds to
  this, and revalidating your pages does not purge the API's CDN copy, so it does not force fresh data. Retry a 503 a
  few times with a delay.
- **IDs are stable.** Store make, model and version IDs freely. A retired version (no longer sold) stays reachable by
  its ID and in `compare`, with `retired: true`; it is left out of lists. Names are labels, not keys.
- **Photo credits.** Each photo carries `attribution` (the source site's name) and `sourceUrl` (the page it was found
  on), both null when unknown. Showing a credit is your choice; the data is there for it.
- **No credentials.** The API is public and read-only: no keys, no cookies, no credentials mode. CORS is open by
  default; if an operator restricts it, give them your exact origin.

## The envelope

Every success body has `apiVersion: "1"`, `asOf` (UTC ISO timestamp), `market`, `powertrain` and a `data` object
discriminated by `kind`. Every error body is `{ "apiVersion": "1", "error": { "code": "...", "message": "..." } }`.
The URL version (`/api/public/v2`) and the payload version (`apiVersion: "1"`) are deliberately distinct.

## Synthetic fixtures

Start with [fixtures/synthetic-v1.json](fixtures/synthetic-v1.json): a wrapper with `synthetic: true`, successful
`scenarios` and `errors`. Each entry's `response` is an HTTP body (status 200 for scenarios, the entry's `httpStatus` for
errors); names and `httpStatus` are mock metadata. The IDs are synthetic, not production IDs, and image and source URLs
are placeholders, so render an image fallback. The examples cover every data route (the search index included), pagination, empty results, models
without versions, every error code, and incomplete, disputed and stale data.

## Rendering notes

- The canonical gallery is `data.photos` on `/models/{modelId}`; a card's `model.photo` is its hero. `version.photos`
  is deprecated: never treat it as a trim gallery. For a version page, fetch its model's gallery by `modelId`.
- Each photo's `view` (round 91) is `exterior`, `interior`, `detail` (a close-up of a part) or `null` (not classified
  with confidence; nothing is guessed), the same for an image everywhere. Exterior and interior views of a gallery show
  only photos with that value; `detail` and `null` photos belong to "all photos" views only.
- A battery is two specifications, `battery_capacity_nominal` and `battery_capacity_usable`. Where one figure is
  needed, use `version.battery` (`{ capacityKwh, basis }`, nominal when known, otherwise usable).
- Availability is `current`, `upcoming`, `discontinued` or `unknown`; discontinued models only with
  `includeDiscontinued=true`. A model with zero versions, or an empty gallery, is a valid state.
- A version may appear later than its model or its first versions: new versions under doubt of being duplicates are held until resolved. Nothing changes shape: a held version is simply not served until then (round 89).
- Prices are approximate cash prices of an exact version, taxes included, in integer cents and always a whole number
  of euros (`amountMinor` a multiple of 100, rounded half up, since round 74); show their freshness.
- **To filter models by their versions' properties**, fetch `/search-index` once (one compact row per served version:
  shown price in whole euros, nominal battery, WLTP range, drivetrain, length, height, boot and seats, each null when
  unknown, never zero; and each attribute's `{ min, max }` over the whole index) and match on your side: a model
  matches when one of its rows satisfies every filter. The index is whole for up to 5,000 models and 10,000 served
  versions; beyond that it answers 503, never a partial index. See [integration.md](integration.md#search-index).
- `seats` (a version specification since round 74) is the most seats the version can be ordered with. **Body type is
  deliberately not provided**: infer it from length, height and seats if you need it.
