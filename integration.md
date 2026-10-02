# Consumer API v2 endpoint: frontend integration

This is the frontend's read-only boundary. It does not perform discovery, extraction, refresh, storage fetches or population mutations. No database credentials, provider keys or research-table knowledge are needed by a frontend.

## Changelog

Newest first. Older entries are in [CHANGELOG.md](CHANGELOG.md).

### 2026-10-02 — round 76

2026-10-02 -- round 76: the search index states its real size limits: it is whole for up to 5,000 models and 10,000 served versions, and beyond them it answers 503 TEMPORARILY_UNAVAILABLE, never a partial index.

A documentation change: nothing changes shape and `apiVersion` remains `"1"`. Round 74's text said the index was "one request whatever the size of the catalogue"; in fact it refused (503) beyond 1,000 models or 4,000 versions, and those bounds are now raised. The same bounds apply to the other list reads (see [Errors, consistency and deployment](#errors-consistency-and-deployment)). Today's Portugal catalogue is far below them.

### 2026-10-02 — round 74

2026-10-02 -- round 74: GET /api/public/v2/search-index serves one compact row per served version, with the domains over the whole index; seats is a new version specification; every public price is a whole number of euros.

An additive change: nothing existing changes shape, and `apiVersion` remains `"1"` -- the contract is pre-stable, and its rule is that a change lands under the same `apiVersion` and is recorded here. Regenerate your copy of `contracts.ts`, `definitions.ts`, `schema.json` and the fixtures.

- **`/search-index`** (new route, `data.kind: "search_index"`): every served version of the market and powertrain in one body, for filtering models by their versions' properties on the frontend's side. See [Search index](#search-index) below for every field, its unit, precision and null meaning, the domains and the validation. New schemas: `searchIndexVersionSchema`, `searchIndexPriceSchema`, `searchIndexDomainsSchema`, `searchIndexDomainSchema`, `drivetrainSchema`; new types `SearchIndex`, `SearchIndexVersion`, `SearchIndexDomains`, `Drivetrain`.
- **`seats`** (new specification definition, category `dimensions`, `type: "number"`, `numericUnit: "seats"`): the maximum number of seats the version can be ordered with, as the manufacturer states it (homologated) -- a version sold with 5 seats, or 7 with an optional third row, has 7. A whole number. It appears in `/definitions`, `definitions.ts`, `version.specs` and comparisons like any specification, and as `seats` in the search index. Coverage starts empty and grows as research and imports record it: unknown is not "no seats".
- **Prices in whole euros**: every public price amount is rounded to the euro, half up -- `price.amountMinor` (still in cents, now always a multiple of 100) on versions, comparisons, model cards' `priceSummary`, and `amountEur` in the search index. Field types do not change. Reason: prices are approximate cash estimates, and cents suggested a precision they do not have.
- **Body type is deliberately not provided**, in the search index or anywhere: infer it from `lengthMm`, `heightMm` and `seats` if you need it.
- The fixtures gain two scenarios (a full index with a row of nulls, and an empty index) and the `seats` definition.

### 2026-09-30 — round 65

2026-09-30 -- round 65: every response carries a `server-timing` header (durations only), exposed to browsers with `access-control-expose-headers: Server-Timing`.

No schema change; `apiVersion` remains `"1"`. Nothing to regenerate.

### 2026-09-30 — round 63

2026-09-30 -- round 63: successful responses are cached much longer: `cache-control: public, max-age=60, s-maxage=3600, stale-while-revalidate=86400`.

No schema change; `apiVersion` remains `"1"`. Nothing to regenerate.

- **Caching**: success responses previously sent `public, max-age=60, s-maxage=300, stale-while-revalidate=60`. They now allow 60 seconds of browser caching, an hour of shared (CDN) caching and up to a day more of a stale copy served while it refreshes in the background. A response is normally at most about an hour old; the first request after a quiet period can receive an older copy (up to about 25 hours) while the refresh happens. A frontend's own cache adds to this, and revalidating a frontend page does not purge this CDN copy. Errors are still not cached (`no-store`). Reason: after an idle period a visitor waited for the function's cold start (14.4 s measured); now the cached answer is served and the cold start happens behind the scenes.

### 2026-09-28 — round 54

2026-09-28 -- round 54: GET /api/public/v2/contract serves the contract as JSON Schema; contract/schema.json holds the same; the README is written for frontends in other repositories. The contract is pre-stable.

No change to any existing body; `apiVersion` remains `"1"`, and `contracts.ts`, `definitions.ts` and the fixtures are unchanged. Nothing to regenerate.

- **`/contract`** (new route): in the usual envelope and with the usual cache header, `data` holds `kind: "contract"`, `apiVersion`, `status: "pre-stable"`, `routes` (the JSON Schema of each route's success body, keyed by its path), `error` (the JSON Schema of the error body), `$defs` (the schemas the routes share) and `definitions` (`specs` and `features`, exactly as `/definitions`). The whole `data` is one JSON Schema document (draft 2020-12, declared once in its root `$schema`): every `$ref` is `#/$defs/...` from that root, so load the document whole and compile a route by pointer, e.g. `#/routes/~1models~1{modelId}`. It is generated at runtime from `contracts.ts` and `definitions.ts`, so it always matches the deployed API, and it reads no catalogue data. `responseSchema` does not list the kind `contract`: read this route as plain JSON, or with its own schema in `routes["/contract"]`.
- **`schema.json`** (new file): the same document without the envelope and `kind`, for frontends not written in TypeScript. It is generated; a backend test fails when it differs from the contract.
- **Pre-stable**: the contract may still change; every change is recorded here, newest first. No versioning promise is made yet.
- **README.md** is rewritten for a frontend in another repository: getting the contract (the mirror repository or `/contract`) and the rules for a frontend (parse leniently, null and absent, caching, stable IDs, photo credits, no credentials).

### 2026-09-28 — round 53

2026-09-28 -- round 53: photos carry attribution (the source site's name) and sourceUrl (the source page).

No `apiVersion` change: it remains `"1"` (an added field; our frontend is the only consumer and deploys in the same push). Regenerate the frontend's contract copy.

- **`attribution`** (`string | null`, already present, null until now): the name of the site the photo was found on, e.g. `"audi.com"` -- the host of the source page without `www.`.
- **`sourceUrl`** (`string | null`, new): the page the photo was found on.
- Both are null when the photo's source page is not known. They appear wherever a photo does: `model.photo`, `data.photos` and the deprecated `version.photos`. Whether to show a credit is the site's choice.

### 2026-09-28 — round 52

2026-09-28 -- round 52: successful responses are cached longer: `cache-control: public, max-age=60, s-maxage=300, stale-while-revalidate=60`.

No schema change; `apiVersion` remains `"1"`. Nothing to regenerate.

- **Caching**: success responses previously sent `public, max-age=30, s-maxage=60`. They now allow 60 seconds of browser caching, 300 seconds of shared (CDN) caching and up to 60 seconds more of a stale copy while it refreshes, so an API response may be up to about five minutes old. Errors are still not cached (`no-store`). Reason: fewer function and database runs per page view.

### 2026-09-26 — round 46

2026-09-26 -- round 46: models can be sorted by coverage (sort=coverage), and each carries coverageScore.

An additive schema change; `apiVersion` remains `"1"`. Regenerate `src/generated/contract/` and update the frontend.

- **`/models` accepts `sort`**: `name` (the default, today's order by make and model name) or `coverage` (highest `coverageScore` first, ties in name order). Paging (`limit`, `offset`, `nextOffset`) applies after sorting, so `sort=coverage&limit=30` returns the 30 best documented models of the whole list. Other routes ignore it.
- **Each model in a `/models` list carries `coverageScore`**, a number from 0 to 100: how well documented the model is -- priced versions 40, versions with specifications 30, good photos 20 (at least 1,024 px, up to ten), an exterior main photo 10. `listedModelSchema` is the list item (`modelSchema` plus `coverageScore`, type `ListedModel`); the card on `/models/{modelId}` is unchanged. Reason: the homepage picks among the best documented models of the whole catalogue, not only the first page of the alphabetical list.

### 2026-09-25 — round 37

2026-09-25 -- round 37: retired versions are served by ID and in compare with retired: true, so saved IDs stay valid; they are not listed.

A schema change; `apiVersion` remains `"1"`. Regenerate `src/generated/contract/` and update the frontend.

- **Each version has `retired: boolean` and `retiredAt: string | null`** (UTC ISO timestamp; null when not retired). `/versions/{versionId}` and `/compare` serve a retired version with `retired: true`, so saved and shared comparisons keep working. This replaces round 36's 404 for a retired version. Reason: public IDs and saved comparisons stay stable.
- A retired version is still left out of a model's `versions`, its card's version count and "from" price, and every list. A client can say, wherever a retired version appears, that it is no longer sold.

### 2026-09-25 — round 36

A change in which versions are served; no schema change. `apiVersion` remains `"1"`, and `contracts.ts`, `definitions.ts` and the fixtures are unchanged.

- **A retired version is not served.** The backend retires a version the manufacturer no longer sells, by hand or automatically on very strong evidence after 90 days. A retired version is treated exactly like an unknown one: `/versions/{versionId}` answers 404 `NOT_FOUND`; it is absent from a model's `versions`, from its card's version count and "from" price, and from the model availability derived from versions. Its model is still served, with its gallery, even when every version is retired. Reason: a version no longer sold should not sit beside its replacement (a facelift's old versions were listed with the new ones).
- **A comparison naming a retired version returns 404 as a whole**, under the existing rule that a missing requested version fails the request. A saved or shared comparison that contains a retired version ID therefore stops working. Handle that 404 as for any comparison: tell the visitor a car in it is no longer available and let them rebuild it from the browse routes.
- A retired version keeps its ID. If it is restored, it is served again under the same ID.

### 2026-09-24 — round 31

A deliberate breaking change, made once, so that the contract speaks the backend's language. `apiVersion` remains `"1"`. Regenerate `src/generated/contract/` and update the frontend.

- **Availability values** are now `current`, `upcoming`, `discontinued` and `unknown`; `confirmed_current`, `not_yet_available` and `historical` are gone. Reason: one name for one thing -- backend and API use the same words, since translation layers only let the two sides drift.
- **`includeHistorical` is now `includeDiscontinued`** (same meaning); `includeHistorical` is rejected as an unknown parameter. The default lists serve `current`, `upcoming` and `unknown` models. Reason: upcoming cars are welcome early, and hiding unknowns would have hidden the Renault 5 and Kia EV3.
- **`definitions.ts` uses the `/definitions` response's field names**: every definition has `key`, `label`, `category`, `description`, `type`, `numericUnit`, and `values` (an enumerated specification) or `levels` (a level feature). It is generated from the backend's catalogues and the `/definitions` response serves exactly it. Reason: one name for one thing -- the file and the API cannot disagree.
- **Feature ladders no longer contain `none`** (`bidirectional_charging`, `parking_camera`, `heated_seats`, `ventilated_seats`, `panoramic_roof`, `apple_carplay`, `android_auto`). A feature a version lacks has fitment `unavailable`; a level feature may carry no level when the source states the feature but not its level. Reason: keep data rather than force a guess, and one fact should have one form.
- **Each version has `battery: { capacityKwh, basis } | null`**: the nominal capacity when known, otherwise the usable one, never converted. Reason: nominal and usable are both kept, and nominal is preferred where one figure is needed -- now decided once, by the backend.
- **The unused `batteryBasis` field on specification values is removed**; `battery.basis` says which capacity a figure is. Reason: it was never emitted, and a value's key already says its basis.
- **Fixtures use only the current fixed keys** (no `seat_massage`, `glass_roof`, `frunk`, `power_kw`, `boot_l`, `battery_comparison_kwh`), the new availability values and `battery`. The scenario "Definitions before feature population" is gone: the definitions are fixed lists and are never empty. Reason: comparison needs one key and one unit, so research and the API record only the fixed lists.

## Start here

- [Versioned TypeScript/Zod contracts](contracts.ts): browser-safe; requires Zod 4.6.1. Copy it into your frontend as described in the [README](README.md).
- [JSON Schema](schema.json): the same contract as JSON Schema, for frontends not written in TypeScript; also served by `/contract`. Generated; never edit it by hand.
- [Definitions](definitions.ts): the fixed specification and feature definitions, browser-safe, in exactly the shape the `/definitions` route serves. Generated from the backend's catalogues; never edit it by hand.
- [Synthetic JSON fixtures](fixtures/synthetic-v1.json): validate against `responseSchema`. The top-level `synthetic` flag, `scenarios`, `errors`, names and `httpStatus` belong to the fixture wrapper, not HTTP responses. Serve each entry’s `response` as the mock body (200 for scenarios, the supplied status for errors); validate success with `responseSchema` and errors with `errorSchema`. These examples are never inserted into a database. Image/source URLs use example.com placeholders; provide an image fallback when rendering fixtures.

## Routes

All routes use GET under `/api/public/v2`. HEAD and OPTIONS are supported; other methods receive JSON 405. There is no public refresh endpoint and `/api/public/v1` no longer exists.

The endpoint version and payload version are deliberately distinct: the URL is v2, while successful and error envelopes carry `apiVersion: "1"`. The catalogue uses its own IDs; old URLs and IDs have no redirects, mappings or fallback behavior, so clients discover IDs from the browse routes.

| Route | Result |
| --- | --- |
| `/makes` | Makes with browsable models in the selected scope; `q` searches make names |
| `/models` | Model cards, each with `coverageScore`; `q` searches canonical make/model names and known model aliases; `sort=coverage` orders by `coverageScore` |
| `/models/{modelId}` | One card, its model gallery (`data.photos`), and a paginated list of published comparison versions |
| `/versions/{versionId}` | One published version and its three-way preference assessment |
| `/compare?ids={id1},{id2}` | Two to four versions, aligned rows and preference assessments |
| `/definitions` | The fixed specification and feature definitions: exactly `specDefinitions` and `featureDefinitions` from [definitions.ts](definitions.ts) |
| `/search-index` | One compact row per served version of the market and powertrain, the numeric domains over the whole index and the drivetrain values; see [Search index](#search-index). Takes only `market` and `powertrain` |
| `/contract` | The contract itself: `apiVersion`, `status` (`"pre-stable"`), the JSON Schema of every route's success body (`routes`, keyed by path) and of the error body (`error`), and the definitions. The same as [schema.json](schema.json); reads no catalogue data |

Every successful response has `apiVersion: "1"`, `asOf` (UTC ISO timestamp), `market`, `powertrain` and a `data` object discriminated by `kind`. Comparison cells follow the order of the requested IDs. A missing, unpublished or out-of-scope requested version makes the entire detail/comparison request return 404, rather than silently dropping it; a retired version is served, with `retired: true`.

## Query parameters

| Parameter | Meaning |
| --- | --- |
| `market` | Uppercase ISO country; default `PT`. Deployment allowlist defaults to PT; unavailable markets return 400 `MARKET_UNAVAILABLE` |
| `powertrain` | `bev` (default) or `all`. A powertrain is binary: `bev` is battery-electric only, and a published version's `powertrain` is `bev` or `not_bev` |
| `q` | Literal case-insensitive substring, maximum 100 characters; `%` is not a wildcard |
| `makeId` | Optional make UUID |
| `limit`, `offset` | Default 20/0; limit 1–50, offset 0–10000; use returned `nextOffset`, null means end |
| `includeDiscontinued` | `true` also serves discontinued models; default `false` (current, upcoming and unknown models only) |
| `ids` | Compare only: 2–4 distinct version UUIDs, comma separated |
| `preferences` | URL-encoded JSON array with at most 10 supported preferences, maximum 4000 characters |
| `uncertainty` | `strict` (default) or `include`; controls preference filtering in browse/model-version lists |
| `sort` | `/models` only: `name` (default; by make and model name) or `coverage` (highest `coverageScore` first, ties by name) |

`/search-index` accepts only `market` and `powertrain`; every other parameter, including `limit`, `offset`, `q` and `includeDiscontinued`, is rejected there as unknown. Unknown or repeated parameters are rejected with 400 `INVALID_REQUEST`. Requests are capped at 8192 URL characters. No implicit currency conversion is performed. Tax geography is the market's default fiscal region. `all` removes the powertrain filter but still requires a resolved, recognized powertrain for version publication.

## Examples

```
GET /api/public/v2/makes?market=PT&powertrain=bev
GET /api/public/v2/models?market=PT&powertrain=bev&q=Explorer&limit=12
GET /api/public/v2/models?includeDiscontinued=true
GET /api/public/v2/models?sort=coverage&limit=30
GET /api/public/v2/models/MODEL_UUID?limit=20
GET /api/public/v2/versions/VERSION_UUID
GET /api/public/v2/compare?ids=VERSION_UUID_1,VERSION_UUID_2
GET /api/public/v2/definitions
GET /api/public/v2/search-index?market=PT&powertrain=bev
GET /api/public/v2/contract
```

Use real returned UUIDs; placeholders above are intentionally not valid requests. Fixture UUIDs work with a fixture-backed frontend, not the production database.

```ts
const params = new URLSearchParams({
  market: "PT", powertrain: "bev", uncertainty: "include",
  preferences: JSON.stringify([
    { kind: "spec", key: "battery_capacity_nominal", op: "gte", value: 60 },
    { kind: "feature", key: "heat_pump", fitment: "standard" },
    { kind: "price", maxAmountMinor: 4000000 },
  ]),
});
const response = await fetch(`${apiBase}/api/public/v2/models?${params}`);
const payload = await response.json();
if (!response.ok) throw new Error(payload.error.message);
// Optionally validate responseSchema.parse(payload).
```

Numeric spec preferences support `gte`, `lte`, `eq`; enum preferences support string `eq`. A price preference (`maxAmountMinor`, in cents) is judged against the shown price, the whole-euro `amountMinor` the response carries: a price equal to the maximum matches. Feature preferences use a returned feature row `key` and a required fitment (`standard`, `optional`, `pack_only`, `unavailable`). Missing rows, disputed values, not-applicable measurements, unknown fitment and stale/unverified prices produce `unknown`, never false/zero. Any verified failed criterion yields `mismatch`; otherwise any unknown criterion yields `unknown`; only all verified successes yield `match`. Reasons are returned on version detail and comparison. Browse includes a model only when one coherent published version meets all criteria; it never combines different versions' strengths. `include` admits uncertain candidates, but still excludes confirmed mismatches.

## Search index

`GET /api/public/v2/search-index?market=PT&powertrain=bev` returns, in one body, every **served** version of the market and powertrain -- the versions the models list would show, by the same rules: published, not retired, of a model the default list serves (current, upcoming or unknown availability; discontinued models are not in the index). It is meant for filtering models by the properties of their versions on the frontend's side: the backend does no matching, sorting or paging. A model matches a set of filters when **one** of its rows satisfies every filter; never combine two rows of a model into an imaginary version. Use `modelId` to join a row to its model card from `/models`, and `versionId` to open the version (`/versions/{versionId}`) or to list the model's versions that matched.

**Parameters.** `market` and `powertrain` only, validated exactly as for `/models`: `market` an uppercase ISO country, default `PT`, 400 `MARKET_UNAVAILABLE` when not enabled; `powertrain` `bev` (default) or `all`. Any other parameter (`limit`, `offset`, `q`, `makeId`, `includeDiscontinued`, `sort`, a filter of your own) is rejected with 400 `INVALID_REQUEST`, as is a repeated parameter: the index is always whole, never a page. A failed read answers 503 `TEMPORARILY_UNAVAILABLE`, never an empty index.

**Body.** The usual envelope (`apiVersion`, `asOf`, `market`, `powertrain`) around `data`:

| Field | Meaning |
| --- | --- |
| `kind` | `"search_index"` |
| `versions` | One row per served version, ordered by `modelId` then `versionId` (a model's rows are adjacent). An empty array is a valid index |
| `domains` | For each numeric attribute, `{ min, max }`: the smallest and largest **known** value over the **whole index** (every row of the market and powertrain, never a page or a filtered subset), or `null` when no row knows it. Use them to initialise sliders; they move only when the catalogue does |
| `drivetrains` | Every value a row's `drivetrain` can take, always `["fwd", "rwd", "awd"]`, whether or not a row has it now |

The domains are `priceEur` (from `price.amountEur`), `batteryNominalKwh`, `rangeWltpKm`, `lengthMm`, `heightMm`, `bootVolumeL` and `seats`, in the rows' units. Each row of `versions`:

| Field | Type, unit, precision | Meaning; `null` |
| --- | --- | --- |
| `modelId` | UUID | The version's model (the `id` of a `/models` card) |
| `versionId` | UUID | The version (`/versions/{versionId}`) |
| `price` | object or `null` | The version's **shown** price -- the same price `/versions/{versionId}` serves as `price` -- or `null` when it shows none |
| `price.amountEur` | integer, whole euros | Approximate cash purchase price, taxes included, rounded to the euro (half up); never a monthly payment |
| `price.verifiedAt` | UTC ISO timestamp or `null` | When the price was last confirmed on its source; `null` when no check is recorded |
| `price.sourceKind` | `official`, `dealer_estimate` or `unclassified` | The kind of source, as a price's `method`: do not present `unclassified` as official |
| `batteryNominalKwh` | number, kWh, 1 decimal | The **nominal** (gross) battery capacity (`battery_capacity_nominal`). `null` when the nominal capacity is not known -- even when a usable capacity is: the usable figure never stands in for it, and neither is converted from the other |
| `rangeWltpKm` | integer, km | Combined WLTP range (`range_wltp`) |
| `drivetrain` | `fwd`, `rwd`, `awd` | Driven wheels: front, rear or all (`drivetrain`) |
| `lengthMm` | integer, mm | Overall length (`length`) |
| `heightMm` | integer, mm | Overall height (`height`) |
| `bootVolumeL` | integer, litres | Boot volume with the rear seats up (`boot_volume`); `0` is a real figure (no boot), `null` is unknown |
| `seats` | integer, seats | The most seats the version can be ordered with (`seats`, below) |

Every attribute is `null` when it is **unknown, never zero**: not recorded yet, disputed, not published, or published only for the model where the model's figure varies between its versions. A `null` value cannot satisfy an active filter on that attribute, and must not exclude a row when that filter is inactive. A row's values are the active, current, published values the version's own page shows (`version.specs`, `version.price`), so a row and its version agree.

**Body type is deliberately not provided** -- here or anywhere in the contract. If you need one, infer it from `lengthMm`, `heightMm` and `seats`, and present it as your own inference.

**Seats.** `seats` is a version specification (also in `/definitions` and `version.specs`): the maximum number of seats the version can be ordered with, as the manufacturer states it (homologated). A version sold with 5 seats, or 7 with an optional third row, has 7. A served value is a whole number from 1 to 9; nothing else about it is guaranteed.

**Caching and `asOf`.** Cached exactly like every other success: `cache-control: public, max-age=60, s-maxage=3600, stale-while-revalidate=86400`, with a `server-timing` header. `asOf` is when the API built the body; a cached copy keeps its `asOf`, so it tells you how old the index you hold is (normally up to an hour, up to about 25 hours after a quiet period). Fetch the index on your server, keep it, and refresh it on a schedule; do not fetch it per visitor.

**Size limits.** The index is one request (about 300 bytes per version, so 10,000 versions stay within the platform's 4.5 MB response limit), and it is whole for a catalogue of up to **5,000 models and 10,000 served versions**. Beyond those limits the API answers 503 `TEMPORARILY_UNAVAILABLE` rather than a partial index, so an index you receive is always complete; keep using the last one you hold.

**Request:**

```
GET /api/public/v2/search-index?market=PT&powertrain=bev
```

**Response** (sanitized; the IDs are synthetic, used only by the fixtures' search-index scenarios): a full row, a row with nulls (only a usable battery is known, so `batteryNominalKwh` is null, and no price is shown), and the domains:

```json
{
  "apiVersion": "1",
  "asOf": "2026-10-02T12:00:00.000Z",
  "market": "PT",
  "powertrain": "bev",
  "data": {
    "kind": "search_index",
    "versions": [
      {
        "modelId": "00000000-0000-4000-8000-000000000300",
        "versionId": "00000000-0000-4000-8000-000000000301",
        "price": { "amountEur": 24600, "verifiedAt": "2026-10-01T08:00:00.000Z", "sourceKind": "official" },
        "batteryNominalKwh": 63.2,
        "rangeWltpKm": 410,
        "drivetrain": "rwd",
        "lengthMm": 4310,
        "heightMm": 1620,
        "bootVolumeL": 380,
        "seats": 5
      },
      {
        "modelId": "00000000-0000-4000-8000-000000000300",
        "versionId": "00000000-0000-4000-8000-000000000303",
        "price": null,
        "batteryNominalKwh": null,
        "rangeWltpKm": null,
        "drivetrain": null,
        "lengthMm": 4310,
        "heightMm": 1620,
        "bootVolumeL": null,
        "seats": null
      }
    ],
    "domains": {
      "priceEur": { "min": 24600, "max": 39000 },
      "batteryNominalKwh": { "min": 60, "max": 82 },
      "rangeWltpKm": { "min": 410, "max": 520 },
      "lengthMm": { "min": 4310, "max": 4400 },
      "heightMm": { "min": 1550, "max": 1620 },
      "bootVolumeL": { "min": 380, "max": 410 },
      "seats": { "min": 5, "max": 7 }
    },
    "drivetrains": ["fwd", "rwd", "awd"]
  }
}
```

The domains above are over the fixture's four rows, two of which are shown. The complete example, and an empty index whose every domain is `null`, are in [fixtures/synthetic-v1.json](fixtures/synthetic-v1.json) (the scenarios named "Search index: ..."). Validate a body with `responseSchema`, or a row with `searchIndexVersionSchema`.

**Matching, for example:** a model whose versions are A (EUR 30,000, 320 km, 50 kWh) and B (EUR 45,000, 520 km, 80 kWh) does **not** match "at most EUR 35,000 and at least 450 km" (no single row satisfies both), and does match "EUR 40,000-50,000 and at least 450 km" through B, although A is cheaper. Its "from" price for that search is B's `price.amountEur`, with B's `verifiedAt` and `sourceKind`; the card's `priceSummary` stays the lowest known price of all its versions. Rows with a `null` price sort after priced ones in either direction, and fail an active price filter.

## Availability

A model card and a version carry `availability`, one of the backend's own values:

- `current`: on sale.
- `upcoming`: announced, not yet on sale.
- `discontinued`: no longer sold. Served only with `includeDiscontinued=true`.
- `unknown`: not established either way. It is not confirmation of sale.

The default lists serve `current`, `upcoming` and `unknown` models. Whether to label upcoming models is the frontend's choice; a stale "coming soon" label is worse than none.

## Definitions

[definitions.ts](definitions.ts) exports `specDefinitions` and `featureDefinitions`, and `/definitions` serves exactly them. Every definition has:

| Field | Meaning |
| --- | --- |
| `key` | The stable key used in `version.specs`, `version.features`, comparison rows and preferences |
| `label` | A display label |
| `category` | The group it is shown in: specifications `battery_and_charging`, `efficiency`, `performance`, `dimensions`; features `charging`, `comfort`, `driver_assistance`, `infotainment`, `exterior` |
| `description` | What it means, in one sentence |
| `type` | Specification: `number` or `enum`. Feature: `boolean`, `level`, `number` or `number_with_window` |
| `numericUnit` | The unit of a `number` or `number_with_window` value; null otherwise |
| `values` | Enumerated specifications only: the allowed values |
| `levels` | Level features only: the ladder, ordered from least to most |

The lists are fixed: the backend records no other key. A ladder lists only what a version can have; it never contains `none`.

## Rendering rules

- IDs are opaque stable entity UUIDs. A version ID is an existing trim ID, not an invented aggregate vehicle. Names are labels, not keys. Alias searches return canonical model identities.
- `model_only` is browsable research coverage, not a published comparison version. Zero versions is a valid result. Do not fill gaps with guessed variants.
- Published versions have a coherent supported grade/technical identity, exact-market applicability and resolved powertrain; other specifications may remain incomplete.
- Every spec has `{status, value, unit}`. Status is `resolved`, `unknown`, `disputed` or `not_applicable`. Only resolved values are non-null. Render distinct placeholders for the other states; never coerce null to zero, false or an empty specification. Numeric values are already in definition units.
- Every feature has `key` (the row key: align comparison rows and write feature preferences with it), `featureKey` (a feature key from the definitions), `label`, `category` (may be null), `attributes`, `evidence`, `fitment` and `numeric`. `fitment` is `standard`, `optional`, `unavailable` (the version lacks it), or `unknown`; `pack_only` remains in the schema. `attributes` carries `level` for a level feature, `note` (the source's own wording, shown and never compared) when there is one, and `fromPercent` and `toPercent` for a charge window. A level feature without `level` is stated by the source without its level: show it, and do not compare it. `numeric` carries the number of a `number` or `number_with_window` feature and may be resolved while fitment is unknown; compare `dc_charging_time` only between equal charge windows.
- Prices represent exact-version cash purchase estimates, never monthly payments, deposits or conditional financing totals. Prices use integer minor currency units (EUR cents) and, since round 74, are always a whole number of euros (`amountMinor` a multiple of 100, rounded half up), `taxInclusive: true`, exact `versionId`, tax basis, estimate method, last successful live check, freshness, validity and selected public source. A null price means no supported estimate. Freshness is supplied by the server: `fresh` means a successful check within its configured interval (default 24 hours), `stale` means older, and `unverified` means no usable past check. Do not recompute freshness from source publication dates. A stale/unverified estimate must be labelled with its true age; it is not a confirmed preference match. Expired offers are omitted.
- A price's `method` is the kind of source it came from: `official` (the manufacturer's own), `dealer_estimate` (a dealer's) or `unclassified` (the source could not be classified as the manufacturer's own or a dealer's, so the price is reported without that claim). Handle all three; do not present an `unclassified` price as official or as a dealer quote.
- Model cards say **Lowest known trim price**, explicitly with incomplete coverage. This is not a guaranteed model starting price. Retain the returned version association and freshness when displaying it.
- Facts are scoped vehicle descriptions with public source links. Render all database-origin labels/text as text, not HTML. No internal annotations, claim/run IDs or admin/provider diagnostics are part of the public contract.

## Battery capacity

A battery is recorded as two specifications, each when a source states it:

- `battery_capacity_nominal`: the nominal (gross) capacity. A single figure that a source does not qualify is recorded here.
- `battery_capacity_usable`: the usable (net) capacity.

Where one figure is needed -- a card, a list, a comparison headline -- use `version.battery`: `{ capacityKwh, basis }`, the nominal capacity when known, otherwise the usable one, with `basis` saying which (`nominal` or `usable`). It is null when neither is known. The backend never estimates or converts one from the other; do not calculate a value the response does not carry, and never show an unknown capacity as zero.

## Model galleries

The canonical gallery is `data.photos` on model detail, independent of versions. Cards carry `model.photo` as the hero. For a version page, use its `modelId` to fetch `/models/{modelId}` and render `data.photos` as **Model photos**, not trim photos. For a comparison, reuse one gallery per distinct model ID. A model with zero published versions may still have a full gallery.

Gallery order comes from each photo's `order`. Version pagination (`limit`, `offset`, `nextOffset`) applies only to `versions`; every page for a model can carry the same gallery. Photos contain final public URLs, dimensions where known, order, labels, `attribution` (the source site's name, e.g. "audi.com") and `sourceUrl` (the page the photo was found on); both are null when the source is not known. Respect `representative` and `equipmentDisclaimer`; a model/generation picture does not establish a trim's equipment. The gallery contains photos applicable to this model/generation (`model_wide` or matching `generation_wide`); keep scope metadata and disclaimers. There is no client-side storage URL construction or signed upload URL.

`data.photos` is optional in the schema: absence means the response did not supply the gallery; an explicit `[]` means a supported empty gallery. `version.photos` is deprecated and may be `[]` even when the model gallery is populated; never infer that a model has no photos from it.

## Errors, consistency and deployment

Errors use `{ "apiVersion": "1", "error": { "code": "...", "message": "..." } }`. Codes: `INVALID_REQUEST`/400, `MARKET_UNAVAILABLE`/400, `NOT_FOUND`/404, `METHOD_NOT_ALLOWED`/405, `TEMPORARILY_UNAVAILABLE`/503. Errors are not cached. Handle 503 with ordinary bounded client retries.

Publication, prices and galleries share a consistent snapshot within each response. Offset ordering is deterministic by make/model/name/ID (with `sort=coverage`, by `coverageScore` first); a later request may observe intervening population updates. Deduplicate pagination by ID and refresh the list when appropriate. This is not a cross-request snapshot cursor.

Success responses are sent with `cache-control: public, max-age=60, s-maxage=3600, stale-while-revalidate=86400`: 60 seconds of browser caching, an hour of shared (CDN) caching, and up to a day more of a stale copy served while it refreshes in the background. A catalogue change can therefore take up to an hour to reach the API's answers, and the first request after a quiet period may still receive a copy up to about 25 hours old while the refresh happens. A frontend's own cache adds to this: a page regenerated hourly from the API can show data about two hours old, and up to about a day old after a quiet period. Revalidating a frontend page (for example by hand) does not purge the API's CDN copy, so it does not force fresh data: the page is rebuilt from the CDN's copy, up to an hour old, or up to about 25 hours right after a quiet period. A read is bounded to 5000 matching models, 10000 versions and 10000 related records per query; excessive scope returns 503 rather than a silently incomplete result. Narrow `q`/`makeId` or use detail routes if this deployment outgrows the bound.

Every response carries `server-timing` (for example `proc;dur=3703.6, mod;dur=3161.9, compose;dur=0.0, db;dur=138.1, query;dur=255.6, build;dur=0.8, total;dur=256.5`): durations in milliseconds only -- since the server process started, since the route loaded, the phases that ran and the handler's total -- readable from a browser (`access-control-expose-headers: Server-Timing`). Entries overlap: `db` (the first database round trip) is part of `query`, and every phase is part of `total`. `first;desc="1"` marks the API route's first database read on its server instance (answers that read no database -- preflights, 400, 405, `/contract`, a 503 before any query -- do not count; a 503 from a failed query does); it is not necessarily the instance's first request. A cache hit may carry the stored header of the miss that filled it, so time a cold start with a cache miss (a new query string). It is diagnostic, not part of the payload contract.

Same-origin frontend calls use an empty API base URL. For another deployment, configure the frontend with the public origin supplied by the backend operator (for example `https://catalogue.example.com`), without `/api/public/v2` or a trailing slash. CORS is open by default; if the operator restricts it, give them your exact frontend origin. No admin credentials, cookies or credentials mode are required. Deployment protection can prevent access: ask the operator for a publicly accessible endpoint; never embed bypass secrets.

`V2_PUBLIC_API_ENABLED=true` enables read-only consumer access. It does not authorize or enable research: `V2_LIVE_ENABLED`, budgets, events, and `V2_SCHEDULES_ENABLED` remain separate controls.

The deployment supports PT. Ask the operator about market enablement, image availability or live data readiness. Empty galleries and zero published versions are valid states. Synthetic fixtures unblock development before live data is ready. Record missing capabilities or contract change requests in your frontend's `docs/api-requests.md`; do not inspect backend code or configure backend environments.
