# Phase 0.3 — API Client Layer (Data Access Abstraction) — Design

> Status: approved (2026-07-09). Decision: **factory approach per doc 36**, superseding
> the MSW paragraph in CLAUDE.md §2 (CLAUDE.md updated as part of this phase).
> vitest approved as the project's test runner.

## Goal

A single abstraction (`apiClient.*`) that all business logic talks to. During development
it is backed by `MockApi` reading the real Base44 backup (`data/app-backup-2026-06-29.json`,
19 entities, 5,729 records). In Phase 12 the factory switches to `RealApi` against the
company's internal REST API — one layer swapped, zero logic changes.

## Key data fact

`ModuleLesson` is 59MB of the 63MB backup (89 lessons with block content). The mock
therefore loads fixtures **lazily per entity** (`import.meta.glob`), never the whole backup.

## Decisions

- **Factory, not MSW.** The company's REST wire contract does not exist yet; MSW would
  force inventing endpoints/envelopes that get thrown away. `RealApi` (Phase 12) adapts
  the real contract to the same TypeScript interfaces. MSW may be added in Phase 12 for
  contract tests. Env flag: `VITE_USE_MOCK` (already in `.env.example`).
- **IDs preserved.** Imported Base44 ObjectIDs stay as-is (string PKs). Mock `create`
  generates 24-hex ids for dev-created records only; the real API generates ids server-side.
- **Field names per doc 35:** `role`, `created_date`, `updated_date`, `created_by_id`,
  `managed_department`.
- **zod at the boundary, incrementally.** Each resource accepts an optional zod schema;
  `User` gets one now (pattern-setter), remaining entities per feature phase.
- **Mutations are in-memory only** (lost on reload) — sufficient for development.

## Components

| File | Responsibility |
|---|---|
| `scripts/split-backup.mjs` | Splits the backup into `src/lib/api/mock/fixtures/<Entity>.json` (gitignored, regenerable via `npm run fixtures`) |
| `src/types/entities.ts` | `BaseEntity` + full `User` type (doc 35 §6.1); other 18 entities get base-derived types, enriched per feature |
| `src/lib/api/types.ts` | `IResource<T>` (findById, findMany(query), create, update, delete, count), `ResourceQuery<T>` (equality filter, `sort: 'field' \| '-field'`, limit, offset), `IApiClient` (19 resources) |
| `src/lib/api/schemas.ts` | zod schema for `User` |
| `src/lib/api/mock/mockApi.ts` | `createMockResource<T>`: lazy fixture load, in-memory store, filter/sort/paging, simulated small latency, returns deep clones |
| `src/lib/api/real/realApi.ts` | Interface-complete stub; every method throws `ApiNotConnectedError`; `VITE_API_BASE_URL`/`VITE_API_KEY` wiring points ready |
| `src/lib/api/client.ts`, `index.ts` | Factory selecting mock/real by `VITE_USE_MOCK`; exports singleton `apiClient` |
| `src/app/providers.tsx` + `App.tsx` | `QueryClientProvider`; demo section fetching a real user via `useQuery` (the phase sanity check) |

## Out of scope (deliberate)

`uploadFile` (media phase), zod schemas for the other 18 entities (per feature),
mutation persistence across reloads, MSW.

## Testing

vitest unit tests for MockApi logic: findById returns a real backup user (the doc-36
sanity check, automated), equality filter, sort asc/desc, limit/offset, create/update/
delete/count, clone-safety (mutating a returned object does not corrupt the store).

## Build caveat

`import.meta.glob` statically registers the fixtures, so a local `npm run build` emits
them as lazy chunks in `dist/` (~62MB, real company data). Mitigation: fixtures are
gitignored, so CI/clean-checkout builds contain none of them. Before any manual deploy
of a locally-built `dist/`, delete `src/lib/api/mock/fixtures/` and rebuild.

## Error handling

`findById` → `null` when missing; `update`/`delete` on missing id → typed `ApiError`
(`not_found`); `RealApi` → `ApiNotConnectedError` until Phase 12. Zod parse failures
throw with entity + issue detail (never swallowed).
