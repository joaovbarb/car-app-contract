# Consumer API v1: frontend integration

This is the frontend's read-only boundary. It does not perform discovery, extraction, refresh, storage fetches or population mutations. No database credentials, provider keys or research-table knowledge are needed by a frontend.

## Start here

- [Versioned TypeScript/Zod contracts](contracts.ts): browser-safe; requires Zod 4.6.1. Use the independently installed frontend pattern in [README](README.md).
- [Spec definitions](definitions.ts): browser-safe canonical meanings. Runtime feature definitions come from the API and are open-ended.
- [Synthetic JSON fixtures](fixtures/synthetic-v1.json): validate against `responseSchema`. The top-level `synthetic` flag, `scenarios`, `errors`, names and `httpStatus` belong to the fixture wrapper, not HTTP responses. Serve each entry’s `response` as the mock body (200 for scenarios, the supplied status for errors); validate success with `responseSchema` and errors with `errorSchema`. These examples are never inserted into a database. Image/source URLs use example.com placeholders; provide an image fallback when rendering fixtures.
- [Contract changes](CHANGELOG.md).

## Routes

All routes use GET under `/api/public/v1`. HEAD and OPTIONS are supported; other methods receive JSON 405. There is no public refresh endpoint.

| Route | Result |
| --- | --- |
| `/makes` | Makes with browsable models in the selected scope; `q` searches make names |
| `/models` | Model cards; `q` searches canonical make/model names and known model aliases |
| `/models/{modelId}` | One card and a paginated list of its published comparison versions |
| `/versions/{versionId}` | One published version and its three-way preference assessment |
| `/compare?ids={id1},{id2}` | Two to four versions, aligned rows and preference assessments |
| `/definitions` | Controlled spec definitions and dynamically discovered feature definitions |

Every successful response has `apiVersion: "1"`, `asOf` (UTC ISO timestamp), `market`, `powertrain` and a `data` object discriminated by `kind`. Comparison cells follow the order of the requested IDs. A missing, unpublished or out-of-scope requested version makes the entire detail/comparison request return 404, rather than silently dropping it.

## Query parameters

| Parameter | Meaning |
| --- | --- |
| `market` | Uppercase ISO country; default `PT`. Deployment allowlist defaults to PT; unavailable markets return 400 `MARKET_UNAVAILABLE` |
| `powertrain` | `bev` (default), `phev`, `hybrid`, `mhev`, `hydrogen`, `petrol`, `diesel`, `all` |
| `q` | Literal case-insensitive substring, maximum 100 characters; `%` is not a wildcard |
| `makeId` | Optional make UUID |
| `limit`, `offset` | Default 20/0; limit 1–50, offset 0–10000; use returned `nextOffset`, null means end |
| `includeHistorical` | Explicit `true` includes known historical and upcoming offerings; default `false` |
| `ids` | Compare only: 2–4 distinct version UUIDs, comma separated |
| `preferences` | URL-encoded JSON array with at most 10 supported preferences, maximum 4000 characters |
| `uncertainty` | `strict` (default) or `include`; controls preference filtering in browse/model-version lists |

Unknown or repeated parameters are rejected. Requests are capped at 8192 URL characters. No implicit currency conversion is performed. Initial tax geography is the market's default fiscal region; region overrides are not exposed in v1. `all` removes the powertrain filter but still requires a resolved, recognized powertrain for version publication.

## Examples

```
GET /api/public/v1/makes?market=PT&powertrain=bev
GET /api/public/v1/models?market=PT&powertrain=bev&q=Explorer&limit=12
GET /api/public/v1/models/MODEL_UUID?limit=20
GET /api/public/v1/versions/VERSION_UUID
GET /api/public/v1/compare?ids=VERSION_UUID_1,VERSION_UUID_2
GET /api/public/v1/definitions
```

Use real returned UUIDs; placeholders above are intentionally not valid requests. Fixture UUIDs work with a fixture-backed frontend, not the production database.

```ts
const params = new URLSearchParams({
  market: "PT", powertrain: "bev", uncertainty: "include",
  preferences: JSON.stringify([
    { kind: "spec", key: "battery_usable_kwh", op: "gte", value: 60 },
    { kind: "feature", key: "seat_massage:position=driver", fitment: "standard" },
    { kind: "price", maxAmountMinor: 4000000 },
  ]),
});
const response = await fetch(`${apiBase}/api/public/v1/models?${params}`);
const payload = await response.json();
if (!response.ok) throw new Error(payload.error.message);
// Optionally validate responseSchema.parse(payload).
```

Numeric spec preferences support `gte`, `lte`, `eq`; enum preferences support string `eq`. Feature preferences use the exact returned semantic row key and required fitment (`standard`, `optional`, `pack_only`, `unavailable`). Missing rows, disputed values, not-applicable measurements, unknown fitment and stale/unverified prices produce `unknown`, never false/zero. Any verified failed criterion yields `mismatch`; otherwise any unknown criterion yields `unknown`; only all verified successes yield `match`. Reasons are returned on version detail and comparison. Browse includes a model only when one coherent published version meets all criteria; it never combines different versions' strengths. `include` admits uncertain candidates, but still excludes confirmed mismatches.

## Rendering rules

- IDs are opaque stable entity UUIDs. A version ID is an existing trim ID, not an invented aggregate vehicle. Names are labels, not keys. Alias searches return canonical model identities.
- `model_only` is browsable research coverage, not a published comparison version. Zero versions is a valid result. Do not fill gaps with guessed variants.
- Availability `confirmed_current` requires explicit current evidence; `unknown` is not confirmation of sale. Defaults retain unknown availability but exclude `historical` and `not_yet_available`; `includeHistorical=true` admits both. Published versions have a coherent supported grade/technical identity, exact-market applicability and resolved powertrain; other specifications may remain incomplete.
- Every spec has `{status, value, unit}`. Status is `resolved`, `unknown`, `disputed` or `not_applicable`. Only resolved values are non-null. Render distinct placeholders for the other states; never coerce null to zero, false or an empty specification.
- Gross/nominal, usable and unspecified battery capacities have separate keys. Do not substitute them for one another. Numeric values are already in definition units.
- Every feature has a semantic `key`, concept `featureKey`, label, category and public attributes. Render new concept keys dynamically. Driver and passenger are separate rows. `evidence` is distinct from `fitment`; `numeric` has its own status/value/unit and may be resolved while fitment is unknown.
- Prices represent exact-version cash purchase estimates, never monthly payments, deposits or conditional financing totals. Prices use integer minor currency units (EUR cents), `taxInclusive: true`, exact `versionId`, tax basis, estimate method, last successful live check, freshness, validity and selected public source. A null price means no supported estimate. Freshness is supplied by the server: `fresh` means a successful check within its configured interval (default 24 hours), `stale` means older, and `unverified` means no usable past check. Do not recompute freshness from source publication dates. A stale/unverified estimate must be labelled with its true age; it is not a confirmed preference match. Expired offers are omitted.
- Model cards say **Lowest known trim price**, explicitly with incomplete coverage. This is not a guaranteed model starting price. Retain the returned version association and freshness when displaying it.
- Photos contain final public URLs, dimensions where known, order, labels and attribution. Respect `representative` and `equipmentDisclaimer`; a model/generation picture does not establish a trim's equipment. There is no client-side storage URL construction or signed upload URL.
- Facts are scoped vehicle descriptions with public source links. Render all database-origin labels/text as text, not HTML. No internal annotations, claim/run IDs or admin/provider diagnostics are part of the public contract.

## Errors, consistency and deployment

Errors use `{ "apiVersion": "1", "error": { "code": "...", "message": "..." } }`. Codes: `INVALID_REQUEST`/400, `MARKET_UNAVAILABLE`/400, `NOT_FOUND`/404, `METHOD_NOT_ALLOWED`/405, `TEMPORARILY_UNAVAILABLE`/503. Errors are not cached. Handle 503 with ordinary bounded client retries, never with research calls.

Publication, prices and galleries share a consistent snapshot within each response. Offset ordering is deterministic by make/model/name/ID; a later request may observe intervening population updates. Deduplicate pagination by ID and refresh the list when appropriate. This is not a cross-request snapshot cursor.

Success responses permit 30 seconds of browser caching and 60 seconds of shared caching. The first implementation bounds a read to 1000 matching models, 4000 trims and 10000 related records per query; excessive scope returns 503 rather than a silently incomplete minimum or comparison. Narrow `q`/`makeId` or use detail routes if this deployment outgrows the initial bound.

Same-origin frontend calls use an empty API base URL. For another deployment, configure the frontend with the public origin supplied by the backend operator (for example `https://catalogue.example.com`), without `/api/public/v1` or a trailing slash. The backend operator must allow your exact frontend origin. No admin credentials, cookies or credentials mode are required. Deployment protection can prevent access: ask the operator for a publicly accessible endpoint; never embed bypass secrets.

The deployment initially supports PT. Ask the operator about market enablement, image availability or live data readiness. Empty galleries and zero published versions are valid states. Synthetic fixtures unblock development before live population is ready. Record missing capabilities or contract change requests in your frontend's `docs/api-requests.md`; do not inspect backend code or configure backend environments.
