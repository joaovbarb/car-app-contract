# Contract changelog

## 2026-09-17 — v1 packaging

- Established this directory as the authoritative home of existing v1 schemas and spec definitions; no HTTP behavior or schema changes.
- Added self-contained frontend setup and integration instructions.
- Extended reproducible synthetic fixtures to all routes, empty states, pagination, model-only coverage, unverified prices and all five error codes.
- Defined an independently installed frontend consumption pattern using generated local copies and frontend-local Zod.

HTTP envelopes still use `apiVersion: "1"`. This packaging revision does not add endpoints or imply that live population acceptance is complete.
