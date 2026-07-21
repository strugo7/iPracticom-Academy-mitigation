# migration — Stage 2.3 transform (Base44 → load-ready NDJSON)

Transforms the raw Base44 backup into load-ready files that the company's team
lead loads into the MySQL DB (`schema/DDL_mysql.sql`). **This script only
*prepares* data — it never connects to a database.**

## Run

```bash
npm run migrate:transform
```

Reads the latest `data/app-backup-*.json`, writes to `migration/output/`
(gitignored — real PII). Node ≥ 22.6 runs the TypeScript directly via
`--experimental-strip-types` (no build step, no extra dependency).

## Output (`migration/output/`)

- `<table>.jsonl` — one NDJSON file per non-empty table, one record per line.
- `manifest.json` — every DB table in **FK-safe import order** with row counts
  and the file name (or `null` for tables with no backup data). Load in this order.
- `user_map.json` — `{id, email}` per user, for the company's future auth linkage.
- `run-log.txt` — per-table counts and every triage action taken.

## What it does (`docs/35 §3`, `schema/RELATIONSHIPS.md`)

- **Field renames:** `created_date→created_at`, `updated_date→updated_at`,
  `created_by_id→created_by`, `_id→id`; per-entity: `system_role→role`,
  `Topic.module_id→shared_module_id`, `Exam.time_limit→time_limit_minutes`.
- **IDs preserved** verbatim (Base44 ObjectIDs) — never renumbered. jsonb columns
  (blocks, flow_data, design, …) pass through unchanged.
- **Drops** `is_sample` everywhere and Base44-internal user fields
  (`progress_stats`, `system_role`, `app_id`, `is_service`, `collaborator_role`,
  `_app_role`, `two_fa*`, `bypass_2fa`).
- **Junctions:** splits embedded arrays into 6 junction files — `exam_questions`,
  `lesson_questions`, `concept_lessons`, `user_completed_tracks`,
  `user_retake_scores`, `user_wizard_states`.
- **Invite tokens** are SHA-256 hashed to `token_hash`; the raw token is discarded.
- **Orphan triage** (Appendix ג׳): orphaned topics dropped (their lessons kept
  with `topic_id` nulled); orphaned `created_by` / `candidate_assessments.invite_id`
  / `role_upgrade_requests.user_id` / `exams.linked_lesson_id` set NULL;
  `user_progress` dimension refs kept as-is (append-only history).

## Structure

`transform.ts` (orchestrator) → `readBackup` → `idSets` (pass 1) →
`build`/`process` (pass 2, using `config/*`) → `writeOutput`. Pure logic
(`helpers`, `process`, `build`) is unit-tested in `transform.test.ts`.
