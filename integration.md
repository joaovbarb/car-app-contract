# Consumer API v2 endpoint: frontend integration

This is the frontend's read-only boundary. It does not perform discovery, extraction, refresh, storage fetches or population mutations. No database credentials, provider keys or research-table knowledge are needed by a frontend.

## Changelog

Newest first. Older entries are in [CHANGELOG.md](CHANGELOG.md).

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

- [Versioned TypeScript/Zod contracts](contracts.ts): browser-safe; requires Zod 4.6.1. Use the independently installed frontend pattern in [README](README.md).
- [Definitions](definitions.ts): the fixed specification and feature definitions, browser-safe, in exactly the shape the `/definitions` route serves. Generated from the backend's catalogues; never edit it by hand.
- [Synthetic JSON fixtures](fixtures/synthetic-v1.json): validate against `responseSchema`. The top-level `synthetic` flag, `scenarios`, `errors`, names and `httpStatus` belong to the fixture wrapper, not HTTP responses. Serve each entry’s `response` as the mock body (200 for scenarios, the supplied status for errors); validate success with `responseSchema` and errors with `errorSchema`. These examples are never inserted into a database. Image/source URLs use example.com placeholders; provide an image fallback when rendering fixtures.

## Routes

All routes use GET under `/api/public/v2`. HEAD and OPTIONS are supported; other methods receive JSON 405. There is no public refresh endpoint and `/api/public/v1` no longer exists.

The endpoint version and payload version are deliberately distinct: the URL is v2, while successful and error envelopes carry `apiVersion: "1"`. The catalogue uses its own IDs; old URLs and IDs have no redirects, mappings or fallback behavior, so clients discover IDs from the browse routes.

| Route | Result |
| --- | --- |
| `/makes` | Makes with browsable models in the selected scope; `q` searches make names |
| `/models` | Model cards; `q` searches canonical make/model names and known model aliases |
| `/models/{modelId}` | One card, its model gallery (`data.photos`), and a paginated list of published comparison versions |
| `/versions/{versionId}` | One published version and its three-way preference assessment |
| `/compare?ids={id1},{id2}` | Two to four versions, aligned rows and preference assessments |
| `/definitions` | The fixed specification and feature definitions: exactly `specDefinitions` and `featureDefinitions` from [definitions.ts](definitions.ts) |

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

Unknown or repeated parameters are rejected with 400 `INVALID_REQUEST`. Requests are capped at 8192 URL characters. No implicit currency conversion is performed. Tax geography is the market's default fiscal region. `all` removes the powertrain filter but still requires a resolved, recognized powertrain for version publication.

## Examples

```
GET /api/public/v2/makes?market=PT&powertrain=bev
GET /api/public/v2/models?market=PT&powertrain=bev&q=Explorer&limit=12
GET /api/public/v2/models?includeDiscontinued=true
GET /api/public/v2/models/MODEL_UUID?limit=20
GET /api/public/v2/versions/VERSION_UUID
GET /api/public/v2/compare?ids=VERSION_UUID_1,VERSION_UUID_2
GET /api/public/v2/definitions
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

Numeric spec preferences support `gte`, `lte`, `eq`; enum preferences support string `eq`. Feature preferences use a returned feature row `key` and a required fitment (`standard`, `optional`, `pack_only`, `unavailable`). Missing rows, disputed values, not-applicable measurements, unknown fitment and stale/unverified prices produce `unknown`, never false/zero. Any verified failed criterion yields `mismatch`; otherwise any unknown criterion yields `unknown`; only all verified successes yield `match`. Reasons are returned on version detail and comparison. Browse includes a model only when one coherent published version meets all criteria; it never combines different versions' strengths. `include` admits uncertain candidates, but still excludes confirmed mismatches.

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
- Prices represent exact-version cash purchase estimates, never monthly payments, deposits or conditional financing totals. Prices use integer minor currency units (EUR cents), `taxInclusive: true`, exact `versionId`, tax basis, estimate method, last successful live check, freshness, validity and selected public source. A null price means no supported estimate. Freshness is supplied by the server: `fresh` means a successful check within its configured interval (default 24 hours), `stale` means older, and `unverified` means no usable past check. Do not recompute freshness from source publication dates. A stale/unverified estimate must be labelled with its true age; it is not a confirmed preference match. Expired offers are omitted.
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

Gallery order comes from each photo's `order`. Version pagination (`limit`, `offset`, `nextOffset`) applies only to `versions`; every page for a model can carry the same gallery. Photos contain final public URLs, dimensions where known, order, labels and attribution. Respect `representative` and `equipmentDisclaimer`; a model/generation picture does not establish a trim's equipment. The gallery contains photos applicable to this model/generation (`model_wide` or matching `generation_wide`); keep scope metadata and disclaimers. There is no client-side storage URL construction or signed upload URL.

`data.photos` is optional in the schema: absence means the response did not supply the gallery; an explicit `[]` means a supported empty gallery. `version.photos` is deprecated and may be `[]` even when the model gallery is populated; never infer that a model has no photos from it.

## Errors, consistency and deployment

Errors use `{ "apiVersion": "1", "error": { "code": "...", "message": "..." } }`. Codes: `INVALID_REQUEST`/400, `MARKET_UNAVAILABLE`/400, `NOT_FOUND`/404, `METHOD_NOT_ALLOWED`/405, `TEMPORARILY_UNAVAILABLE`/503. Errors are not cached. Handle 503 with ordinary bounded client retries.

Publication, prices and galleries share a consistent snapshot within each response. Offset ordering is deterministic by make/model/name/ID; a later request may observe intervening population updates. Deduplicate pagination by ID and refresh the list when appropriate. This is not a cross-request snapshot cursor.

Success responses permit 30 seconds of browser caching and 60 seconds of shared caching. A read is bounded to 1000 matching models, 4000 trims and 10000 related records per query; excessive scope returns 503 rather than a silently incomplete result. Narrow `q`/`makeId` or use detail routes if this deployment outgrows the bound.

Same-origin frontend calls use an empty API base URL. For another deployment, configure the frontend with the public origin supplied by the backend operator (for example `https://catalogue.example.com`), without `/api/public/v2` or a trailing slash. CORS is open by default; if the operator restricts it, give them your exact frontend origin. No admin credentials, cookies or credentials mode are required. Deployment protection can prevent access: ask the operator for a publicly accessible endpoint; never embed bypass secrets.

`V2_PUBLIC_API_ENABLED=true` enables read-only consumer access. It does not authorize or enable research: `V2_LIVE_ENABLED`, budgets, events, and `V2_SCHEDULES_ENABLED` remain separate controls.

The deployment supports PT. Ask the operator about market enablement, image availability or live data readiness. Empty galleries and zero published versions are valid states. Synthetic fixtures unblock development before live data is ready. Record missing capabilities or contract change requests in your frontend's `docs/api-requests.md`; do not inspect backend code or configure backend environments.
