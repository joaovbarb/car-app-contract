# Contract changelog

## 2026-10-05 — round 91 (additive)

- Every photo carries `view`: `"exterior" | "interior" | "detail" | null` -- what it shows, from the backend's vision
  check: the outside, the inside, or a close-up of a part (inside or outside). `null` when not classified with
  confidence; nothing is guessed. The same image has the same value everywhere (`model.photo`, `data.photos`,
  `version.photos`). `detail` and `null` photos belong to "all photos" views only. A client pinned to the previous
  schema ignores the field; `apiVersion` remains `"1"`. New schema `photoViewSchema`, type `PhotoView`. The entry is at
  the top of [integration.md](integration.md), and the meaning is beside its gallery paragraph.

## 2026-10-05 — round 89 (documentation)

- A version may appear later than its model or its first versions: new versions under doubt of being duplicates are
  held until resolved. A new version that may duplicate another is held, not served anywhere, until more data
  publishes it or merges it into the version it duplicates. Nothing changes shape; `apiVersion` remains `"1"`. The
  entry is at the top of [integration.md](integration.md), and the rule is in its "Rendering rules".

## 2026-10-02 — round 76 (documentation)

- The search index's real size limits: it is whole for up to 5,000 models and 10,000 served versions (raised from
  1,000 and 4,000), and beyond them it answers 503 `TEMPORARILY_UNAVAILABLE`, never a partial index. Round 74's
  "one request whatever the size of the catalogue" is withdrawn. The same bounds apply to the other list reads.
  Nothing changes shape; `apiVersion` remains `"1"`. The entry is at the top of [integration.md](integration.md),
  and the limits are in its "Search index" section.

## 2026-10-02 — round 74 (additive)

- `GET /api/public/v2/search-index` (new route, `kind: "search_index"`): one compact row per served version and
  the domains over the whole index; the new `seats` specification; every public price a whole number of euros. Body
  type is deliberately not provided. `apiVersion` remains `"1"` (pre-stable: changes land under the same version and
  are recorded). The full entry is at the top of [integration.md](integration.md), and the route is documented in
  its "Search index" section.

## 2026-09-24 — round 31 (breaking)

- Availability values are the backend's own (`current`, `upcoming`, `discontinued`, `unknown`);
  `includeHistorical` is now `includeDiscontinued`; `definitions.ts` uses the `/definitions`
  field names and gains `category` and `description`; ladders lose `none`; each version gains
  `battery`; `batteryBasis` is removed; fixtures use only current keys. Each change and its reason
  is listed in the changelog at the top of [integration.md](integration.md), which is where new
  entries go from now on.

## 2026-09-23 — definitions.ts mirrors the catalogues; nominal and usable battery capacity

- `definitions.ts` now mirrors the architect's catalogues in `backend/interfaces/definitions.ts`
  exactly: `specDefinitions` (`key`, `label`, `valueType`, `unit`, `values` for an enumerated
  specification) and a new `featureDefinitions` (`key`, `label`, `type`, `levels` for a `level`
  feature, `unit` for a numeric one). The old keys (`power_kw`, `boot_l`, `boot_l_max`,
  `zero_to_100_s`, `fuel_type`, `displacement_cc`, `battery_comparison_kwh`,
  `battery_capacity_kwh`, `battery_gross_kwh`, `battery_usable_kwh`) are gone, and entries no
  longer carry `description`. A backend test fails whenever the two files differ.
- A battery is two specifications: `battery_capacity_nominal` (gross) and `battery_capacity_usable`
  (net), each when a source states it; a single unqualified figure is nominal. Where one figure is
  needed, use the nominal capacity when known, otherwise the usable one. Never convert one into the
  other.
- The fixtures use the new specification keys. Feature fixtures are unchanged.
- The response schemas in `contracts.ts` are unchanged; `apiVersion` remains `"1"`. Regenerate
  `frontend/src/generated/contract/`.

## 2026-09-23 — fixed specification and feature definitions (additive)

- Each feature in the `definitions` response may carry `type` (`boolean`, `level`, `number`,
  `number_with_window`) and `levels` (the ladder, least to most, for a `level` feature; null
  otherwise). Both are optional so responses served before them still parse. The schemas are
  exported as `featureTypeSchema` and `featureDefinitionSchema`.
- A published feature keeps its shape: `fitment` is the equipment status; `numeric` carries the
  number of a `number` or `number_with_window` feature; `attributes` carries `level` for a `level`
  feature, `note` (the source's own wording, shown and never compared) when there is one, and
  `fromPercent` and `toPercent` for a charge window.
- Specification definitions are unchanged in shape; the backend now serves exactly the architect's
  fixed list (`backend/interfaces/definitions.ts`), so the keys differ from earlier responses.
- `apiVersion` remains `"1"`. Regenerate `frontend/src/generated/contract/`.

## 2026-09-22 — a price's source may be unclassified

- `price.method` (on `version.price` and on a model card's `priceSummary.price`) now admits a third
  value, `unclassified`: the source could not be classified as the manufacturer's own or a
  dealer's, so the price is reported without that claim. The schema is exported as
  `priceMethodSchema`, with the type `PriceMethod`.
- The catalogue has stored this value since prices began publishing, but the schema allowed only
  `official` and `dealer_estimate`, so a model list whose page contained such a price failed
  response validation and the route returned 503 instead of the list. Responses that never carried the value
  are unchanged.
- Added the fixture scenario "Browse: the lowest known price came from an unclassified source".
- `apiVersion` remains `"1"`: this widens an enum to the value the server already emits.
  Regenerate `frontend/src/generated/contract/` and handle all three values.

## 2026-09-21 — powertrain is binary

- Replaced the seven engine-type values with two: `bev` (battery-electric only) and `not_bev`
  (plug-in hybrid, hybrid, mild hybrid, hydrogen fuel-cell, petrol, diesel). A model is sold as
  several engine types at once, so a single engine type was never a property of a model; an
  electric car is always its own model here, so the binary value is permanently correct.
- The `powertrain` query parameter now accepts `bev` (default) and `all` only. `phev`, `hybrid`,
  `mhev`, `hydrogen`, `petrol` and `diesel` are rejected as `INVALID_REQUEST`; `not_bev` is a
  classification, not a filter, and is rejected too.
- `version.powertrain` is now `bev` or `not_bev`. No served version carried any of the removed
  values, and the deployed frontend requests `bev` only, so no current response or request changes
  shape. Regenerate `frontend/src/generated/contract/` before relying on the narrowed types.
- `apiVersion` remains `"1"`: this narrows an enum whose other members were never emitted.

## 2026-09-18 — v2 endpoint cutover; payload schema unchanged

- Made `/api/public/v2` the sole consumer URL and removed `/api/public/v1`.
- Preserved the existing response/error schemas and `apiVersion: "1"`; the URL change is not a payload-version change.
- Documented that replacement IDs/data are independent and old links or IDs are not mapped, imported, redirected, or used as fallbacks.
- Documented exact-origin CORS configuration and the separation between public read enablement and research execution.

## 2026-09-18 — model galleries and reported battery capacity (rollout pending)

- Added canonical model-detail `data.photos`; kept model-card hero `photo`. The new field is optional during rollout so current deployed responses still parse. Absent differs from an explicitly empty gallery.
- Deprecated `version.photos`; retained the field for legacy compatibility. Updated fixtures use model galleries and empty legacy version arrays, including a gallery for a model with no versions.
- Added `battery_comparison_kwh` and source-basis metadata `batteryBasis`. Select the sole reported value, or prefer reported nominal/gross when both nominal and usable are available. Never estimate or convert between bases. Existing basis-specific keys are unchanged.
- Added synthetic battery-policy scenarios and updated definitions/comparison cells and integration guidance.
- This is a contract-only change, not a backend deployment. HTTP `apiVersion` remains `1` for this additive revision. Runtime registry, selection and model-gallery serialization still need backend implementation.

## 2026-09-17 — v1 packaging

- Established this directory as the authoritative home of existing v1 schemas and spec definitions; no HTTP behavior or schema changes.
- Added self-contained frontend setup and integration instructions.
- Extended reproducible synthetic fixtures to all routes, empty states, pagination, model-only coverage, unverified prices and all five error codes.
- Defined an independently installed frontend consumption pattern using generated local copies and frontend-local Zod.

HTTP envelopes still use `apiVersion: "1"`. This packaging revision does not add endpoints or imply that live population acceptance is complete.
