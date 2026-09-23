# Consumer contract (payload schema 1)

This read-only API provides market-scoped vehicle browsing, published versions, comparisons, specifications, dynamic equipment features, qualified cash price estimates and curated photos. It supports frontend development even when live vehicles have incomplete evidence or no published versions.

Read [integration.md](integration.md) first for routes and rendering semantics, then [contracts.ts](contracts.ts) for authoritative TypeScript/Zod schemas and [definitions.ts](definitions.ts) for spec meanings and units. [CHANGELOG.md](CHANGELOG.md) records contract revisions. The backend agent maintains this directory; frontend agents have read-only access.

Start with [synthetic fixtures](fixtures/synthetic-v1.json). The wrapper contains `synthetic: true`, successful `scenarios` and `errors`. Each entry's `response` is an HTTP body; names and error `httpStatus` are mock metadata. Successful bodies use status 200. Fixture IDs are synthetic, not production IDs. Example image/source URLs are placeholders, not usable assets; show image fallbacks. Examples cover all six routes, pagination, empty results, model-only coverage, all error codes and incomplete/disputed/stale data. No fixtures are production seed data.

## 2026-09-18 endpoint cutover

The only consumer endpoint is `/api/public/v2`. This URL cutover does not change the JSON envelope: successful and error bodies continue to carry `apiVersion: "1"` and validate against the existing schemas. The replacement catalogue has independent IDs and data; old v1 URLs and IDs are not preserved, redirected, mapped, imported, or used as fallbacks.

The canonical gallery is now `data.photos` on `/models/{modelId}`. Cards retain `model.photo` as a hero; `version.photos` is deprecated compatibility data. New frontend code should fetch the model detail using a version's `modelId`, not treat version pictures as a trim gallery.

`data.photos` remains optional for payload compatibility. An absent property means the response has not supplied the model gallery; `[]` explicitly means no published model photos. Do not default absence to an empty gallery or present version photos as a canonical model gallery.

A battery is two specifications, `battery_capacity_nominal` and `battery_capacity_usable`. Where one figure is needed, show the nominal capacity when known, otherwise the usable one. See the integration guide for the battery policy.

## Independent frontend installation

Runtime dependency: **Zod 4.6.1** (Zod 4 API). TypeScript **5.9.3** was used for independent verification. Neither module needs a server, environment variables or backend imports. Install dependencies in your frontend, not in this read-only directory. Importing these files directly from outside the frontend can make module resolution look for root dependencies; use a generated local copy instead.

From your frontend directory, install `zod@4.6.1` with your frontend package manager (for npm: `npm install zod@4.6.1`). For a TypeScript project install TypeScript locally as a dev dependency. Create `scripts/sync-contract.mjs` inside your frontend with:

```js
import { copyFile, mkdir } from "node:fs/promises";
const source = new URL("../../contract/", import.meta.url);
const target = new URL("../src/generated/contract/", import.meta.url);
await mkdir(new URL("fixtures/", target), { recursive: true });
for (const name of ["contracts.ts", "definitions.ts", "fixtures/synthetic-v1.json"]) {
  await copyFile(new URL(name, source), new URL(name, target));
}
```

Run `node scripts/sync-contract.mjs` from the frontend. This setup helper reads only the contract and writes only frontend files; it is not browser runtime code. Treat `src/generated/contract/` as generated, never edit its declarations manually. Regenerate on contract updates, review the changelog, and validate fixtures again. This requires no package publishing, root scripts, root dependencies or writes to the source contract.

In frontend code, import `responseSchema`, `errorSchema` and exported types from the generated `contracts` module, and `specDefinitions` from generated `definitions`. Use your frontend's JSON loader or fetch a locally served copy of the fixture JSON. Mock each scenario's response rather than serving the wrapper as an API response.

## Connect to live data

Configure a public `apiBase` in your frontend: empty string for same-origin, or the backend-provided public origin without a trailing slash. Request `${apiBase}/api/public/v2/models`. Parse successful JSON with `responseSchema` and unsuccessful JSON with `errorSchema`; network, CORS or deployment-access failures may not have JSON bodies. Do not embed admin, database or provider credentials or send cookies. For cross-origin use, give the backend operator your exact frontend origin to include in the backend’s central public API configuration.

Keep working with fixtures if the live catalogue is not ready. Record requests in your frontend's `docs/api-requests.md`: use case, current documented limitation, requested response/behavior and acceptance example. Send that request to the backend/coordinating agent; no backend inspection is necessary. Enabling public v2 reads is independent from enabling research, spending, events, or schedules.
