# Contract changelog

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
