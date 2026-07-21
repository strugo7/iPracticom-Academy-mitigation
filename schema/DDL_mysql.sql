-- ═══════════════════════════════════════════════════════════════════════════
-- iPracticom Academy — MySQL 8 DDL (שלב 2.2, handoff to dev team)
-- ═══════════════════════════════════════════════════════════════════════════
-- Scope: the 36 surviving entities from docs/CLEANUP_MAP.md (16 with data,
--        20 schema-only) + 6 junction tables replacing denormalized ID arrays.
-- Dropped entities (do NOT create): Course, ModuleExam, ExamResult, AIJob,
--        UserOtp, SearchLog, LearningPath, GammaPresentation.
--
-- Conventions
--   * ENGINE=InnoDB, CHARSET=utf8mb4, COLLATE=utf8mb4_0900_ai_ci.
--   * Primary keys hold the original Base44/Mongo ObjectIDs AS-IS (24 hex
--     chars). Type: CHAR(24) CHARACTER SET ascii COLLATE ascii_bin — fixed
--     24-byte index entries instead of up-to-97-byte utf8mb4 VARCHAR.
--     >> OPEN ITEM for dev team: new-row IDs must keep the 24-hex format
--     (generate ObjectID-style ids server-side). If you prefer UUIDs instead,
--     widen every id/FK column to VARCHAR(36) ascii_bin BEFORE first insert.
--   * Audit trio on every table (import maps created_date→created_at,
--     updated_date→updated_at, created_by_id→created_by):
--       created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
--       updated_at DATETIME(3) NULL     ON UPDATE CURRENT_TIMESTAMP(3)
--       created_by CHAR(24)  NULL       FK → users(id) ON DELETE SET NULL
--   * All DATETIME(3) values are UTC.
--   * Enum-like fields: VARCHAR + named CHECK (MySQL ≥ 8.0.16 enforces CHECK).
--     Value lists match src/lib/constants/enums.ts (single source of truth).
--   * Arrays of scalar VALUES / embedded objects stay JSON (tags, target_roles,
--     blocks, options, synonyms…). Arrays of ENTITY IDS became junction tables.
--
-- Import rules (שלב 2.3 must apply — verified against app-backup-2026-06-29):
--   1. Global field renames as above; `is_sample` dropped everywhere (0 real
--      sample rows); `role` is canonical (legacy `system_role` dropped).
--   2. invites: compute token_hash = SHA-256(raw token) then DISCARD the raw
--      token (33 rows carry a raw token today). Raw tokens are never stored.
--   3. Orphaned references found in the backup — NULL them at import (column
--      is nullable) or triage (marked ⚠):
--        created_by  → orphaned on many tables (e.g. questions 282/317,
--                      invites 56/56, candidate_assessments 10/10) → NULL.
--        candidate_assessments.invite_id: 3/10 orphaned → NULL.
--        role_upgrade_requests.user_id: 2/2 orphaned → NULL (snapshots kept).
--        exams.linked_lesson_id: 1/12 orphaned → NULL.
--        ⚠ topics.shared_module_id: 9/39 point to deleted modules (16 draft
--          lessons + 42 progress events hang under them) → re-parent or drop
--          the subtree BEFORE import; column is NOT NULL by design.
--        ⚠ track_modules: 1 malformed row (module-shaped fields, missing
--          shared_module_id) → fix or drop before import.
--        user_progress.lesson_id: 97 events reference deleted lessons —
--          KEPT as-is (dimension columns have no FK; see user_progress).
--   4. users: progress_stats cache is NOT migrated (stats derive from
--      user_progress events); wizard arrays (dismissed_wizards,
--      completed_wizards, wizard_progress) become user_wizard_states rows;
--      retake_exam_scores becomes user_retake_scores rows.
-- ═══════════════════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS ipracticom_academy
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE ipracticom_academy;

-- ═══ DOMAIN A · USERS & ACCESS ══════════════════════════════════════════════

CREATE TABLE users (
  id                        CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  -- identity
  email                     VARCHAR(255) NOT NULL,
  full_name                 VARCHAR(255) NOT NULL,
  phone                     VARCHAR(32)  NULL,
  profile_picture_url       TEXT         NULL,
  -- authorization (manager = managed_department IS NOT NULL, not role; doc 35 §6.3)
  role                      VARCHAR(20)  NOT NULL DEFAULT 'user',
  department                VARCHAR(100) NULL,
  managed_department        VARCHAR(100) NULL COMMENT 'set => this user manages that department',
  requested_role            VARCHAR(20)  NULL COMMENT 'pending role-upgrade wish (user/manager/system_admin)',
  -- lifecycle
  status                    VARCHAR(20)  NOT NULL DEFAULT 'active',
  is_verified               BOOLEAN      NOT NULL DEFAULT FALSE,
  disabled                  BOOLEAN      NOT NULL DEFAULT FALSE,
  disabled_reason           TEXT         NULL,
  force_password_reset      BOOLEAN      NOT NULL DEFAULT FALSE,
  last_activity_date        DATETIME(3)  NULL,
  last_login                DATETIME(3)  NULL,
  -- gamification (total_xp is recomputed by the progress engine from events)
  total_xp                  INT          NOT NULL DEFAULT 0,
  current_level             INT          NOT NULL DEFAULT 1,
  -- learning
  assigned_track_id         CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  entrance_exam_passed      BOOLEAN      NULL,
  entrance_exam_score       INT          NULL,
  entrance_exam_date        DATETIME(3)  NULL,
  bypass_sequential_lessons BOOLEAN      NOT NULL DEFAULT FALSE,
  -- onboarding / recruitment linkage
  invite_id                 CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  onboarding_completed      BOOLEAN      NOT NULL DEFAULT FALSE,
  profile_completed         BOOLEAN      NOT NULL DEFAULT FALSE,
  first_login_wizard_shown  BOOLEAN      NOT NULL DEFAULT FALSE,
  pending_entrance_exam_id  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  pending_retake_exam_id    CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  pending_retake_exam_invite_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  pending_retake_exam_title VARCHAR(255) NULL COMMENT 'display snapshot of the pending retake exam',
  -- preferences
  notifications_settings    JSON         NULL,
  profile                   JSON         NULL COMMENT '{bio, hire_date, lang, ...}',
  -- audit
  created_at                DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at                DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by                CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_department (department),
  KEY idx_users_managed_department (managed_department),
  CONSTRAINT chk_users_role   CHECK (role IN ('user','instructor','manager','admin')),
  CONSTRAINT chk_users_status CHECK (status IN ('active','suspended','deleted')),
  CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Deliberately NOT migrated from Base44 User: progress_stats (stale cache — stats derive from user_progress), system_role (role is canonical), app_id, is_service, collaborator_role, _app_role, two_fa_* and bypass_2fa (auth is enterprise-owned), is_sample. Junctioned out: completed_tracks, retake_exam_scores, dismissed/completed_wizards+wizard_progress.';
-- users.assigned_track_id / invite_id / pending_* FKs are added at the end of
-- this file (referenced tables are created later).

-- ═══ DOMAIN B · LEARNING CONTENT (Track → SharedModule → Topic → Lesson) ════

CREATE TABLE learning_tracks (
  id               CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title            VARCHAR(255) NOT NULL,
  description      TEXT         NULL,
  category         VARCHAR(100) NULL COMMENT 'matched against users.department by the progress engine (denominator)',
  target_roles     JSON         NULL COMMENT 'array of role values — not entity refs',
  difficulty_level VARCHAR(20)  NULL,
  estimated_hours  DECIMAL(6,2) NULL,
  is_mandatory     BOOLEAN      NOT NULL DEFAULT FALSE,
  icon             VARCHAR(100) NULL,
  color            VARCHAR(20)  NULL,
  image_url        TEXT         NULL,
  intro_video_url  TEXT         NULL,
  order_index      INT          NOT NULL DEFAULT 0,
  status           VARCHAR(20)  NOT NULL DEFAULT 'draft',
  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by       CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_tracks_status_category (status, category),
  CONSTRAINT chk_tracks_status CHECK (status IN ('draft','published','archived','deleted')),
  CONSTRAINT fk_tracks_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE shared_modules (
  id                 CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title              VARCHAR(255) NOT NULL,
  description        TEXT         NULL,
  estimated_duration INT          NULL COMMENT 'minutes',
  tags               JSON         NULL,
  status             VARCHAR(20)  NOT NULL DEFAULT 'draft',
  created_at         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at         DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by         CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  CONSTRAINT chk_modules_status CHECK (status IN ('draft','published','archived','deleted')),
  CONSTRAINT fk_modules_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Shared-object pattern: one module can appear in many tracks via track_modules.';

-- The existing M:N junction Track ↔ SharedModule. Kept as a full entity
-- (22 real rows with own ids/timestamps) — the model for the new junctions.
CREATE TABLE track_modules (
  id               CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  track_id         CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  shared_module_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  order_index      INT         NOT NULL DEFAULT 0,
  created_at       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3) NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by       CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_track_modules (track_id, shared_module_id),
  KEY idx_track_modules_order (track_id, order_index),
  KEY idx_track_modules_module (shared_module_id),
  CONSTRAINT fk_tm_track  FOREIGN KEY (track_id)         REFERENCES learning_tracks (id) ON DELETE CASCADE,
  CONSTRAINT fk_tm_module FOREIGN KEY (shared_module_id) REFERENCES shared_modules (id) ON DELETE RESTRICT,
  CONSTRAINT fk_tm_created_by FOREIGN KEY (created_by)   REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE topics (
  id               CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  shared_module_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'field name per doc 35 §2.1 (not module_id). Import ⚠: 9 backup rows reference deleted modules — triage before load.',
  title            VARCHAR(255) NOT NULL,
  description      TEXT         NULL,
  order_index      INT          NOT NULL DEFAULT 0,
  status           VARCHAR(20)  NOT NULL DEFAULT 'draft',
  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by       CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_topics_module_order (shared_module_id, order_index),
  CONSTRAINT chk_topics_status CHECK (status IN ('draft','published','archived','deleted')),
  CONSTRAINT fk_topics_module FOREIGN KEY (shared_module_id) REFERENCES shared_modules (id) ON DELETE CASCADE,
  CONSTRAINT fk_topics_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE module_lessons (
  id                        CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  topic_id                  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'canonical parent; NULL only on 9 legacy v1 rows',
  shared_module_id          CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'LEGACY v1 parent (no FK — 8/9 backup refs orphaned). New lessons must set topic_id.',
  title                     VARCHAR(255) NOT NULL,
  introduction_text         TEXT         NULL,
  learning_objectives       JSON         NULL,
  editor_version            VARCHAR(4)   NOT NULL DEFAULT 'v2',
  blocks                    JSON         NULL COMMENT 'v2 content: [{id,type,order_index,data,styling,visibility}] — 26 block types, doc 18 §1',
  pages                     JSON         NULL COMMENT 'legacy v1 renderer content',
  content                   LONGTEXT     NULL COMMENT 'legacy v1 plain content',
  video_url                 TEXT         NULL COMMENT 'legacy v1',
  multiple_choice_questions JSON         NULL COMMENT 'embedded inline quiz (not the question bank)',
  open_question             JSON         NULL,
  resources                 JSON         NULL,
  duration_minutes          INT          NOT NULL DEFAULT 0,
  xp_reward                 INT          NOT NULL DEFAULT 10,
  require_previous_lesson   BOOLEAN      NOT NULL DEFAULT FALSE,
  linked_exam_id            CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  order_index               INT          NOT NULL DEFAULT 0,
  status                    VARCHAR(20)  NOT NULL DEFAULT 'draft',
  last_updated_by_name      VARCHAR(255) NULL COMMENT 'display snapshot',
  last_updated_by_email     VARCHAR(255) NULL COMMENT 'display snapshot',
  created_at                DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at                DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by                CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_lessons_topic_status (topic_id, status, order_index),
  CONSTRAINT chk_lessons_status CHECK (status IN ('draft','published','archived','deleted')),
  CONSTRAINT chk_lessons_editor CHECK (editor_version IN ('v1','v2')),
  CONSTRAINT chk_lessons_parent CHECK (topic_id IS NOT NULL OR shared_module_id IS NOT NULL),
  CONSTRAINT fk_lessons_topic FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE,
  CONSTRAINT fk_lessons_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- module_lessons.linked_exam_id FK is added at the end (exams created later).

CREATE TABLE lesson_versions (
  id              CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  lesson_id       CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  version_number  INT          NOT NULL,
  description     TEXT         NULL,
  data            JSON         NOT NULL COMMENT 'full blocks snapshot',
  created_by_name VARCHAR(255) NULL,
  created_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by      CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_lesson_versions (lesson_id, version_number),
  CONSTRAINT fk_lv_lesson FOREIGN KEY (lesson_id) REFERENCES module_lessons (id) ON DELETE CASCADE,
  CONSTRAINT fk_lv_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[schema-only, 0 records]';

CREATE TABLE lesson_notes (
  id          CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id     CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  lesson_id   CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  content     TEXT        NULL,
  is_bookmark BOOLEAN     NOT NULL DEFAULT FALSE COMMENT 'notes double as bookmarks (doc 35 §2.1)',
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3) NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_notes_user_lesson (user_id, lesson_id),
  CONSTRAINT fk_ln_user   FOREIGN KEY (user_id)   REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_ln_lesson FOREIGN KEY (lesson_id) REFERENCES module_lessons (id) ON DELETE CASCADE,
  CONSTRAINT fk_ln_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[schema-only, 0 records]';

CREATE TABLE shared_guide_links (
  id         CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  token      VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'public share token. Dev-team decision: store raw or hashed (invites set the hash precedent).',
  lesson_id  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  view_count INT         NOT NULL DEFAULT 0,
  expires_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sgl_token (token),
  CONSTRAINT fk_sgl_lesson FOREIGN KEY (lesson_id) REFERENCES module_lessons (id) ON DELETE CASCADE,
  CONSTRAINT fk_sgl_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[schema-only, 0 records]';

-- ═══ DOMAIN C · ASSESSMENT ══════════════════════════════════════════════════

CREATE TABLE questions (
  id                   CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title                VARCHAR(500) NULL,
  question_text        TEXT         NOT NULL,
  question_type        VARCHAR(20)  NOT NULL DEFAULT 'multiple_choice',
  category             VARCHAR(100) NULL,
  topic_tags           JSON         NULL,
  difficulty_level     VARCHAR(20)  NULL,
  options              JSON         NULL COMMENT 'answer options (embedded)',
  correct_answer_index INT          NULL,
  order_items          JSON         NULL COMMENT 'for order_sequence questions',
  explanation          TEXT         NULL,
  points               INT          NOT NULL DEFAULT 1,
  usage_count          INT          NOT NULL DEFAULT 0,
  success_rate         DECIMAL(5,2) NULL,
  status               VARCHAR(20)  NOT NULL DEFAULT 'draft',
  created_at           DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at           DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by           CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_questions_category_status (category, status),
  CONSTRAINT chk_questions_type   CHECK (question_type IN ('multiple_choice','true_false','order_sequence')),
  CONSTRAINT chk_questions_status CHECK (status IN ('draft','published','archived','deleted')),
  CONSTRAINT fk_questions_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE exams (
  id                       CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  exam_id                  VARCHAR(64) NULL COMMENT 'legacy business key from Base44 — keep for import fidelity',
  title                    VARCHAR(255) NOT NULL,
  description              TEXT         NULL,
  category                 VARCHAR(100) NULL,
  exam_type                VARCHAR(30)  NULL COMMENT 'data values: lesson_exam / topic_exam / standalone_exam',
  difficulty_level         VARCHAR(20)  NULL,
  is_entrance_exam         BOOLEAN      NOT NULL DEFAULT FALSE,
  target_roles             JSON         NULL,
  target_departments       JSON         NULL,
  topic_tags               JSON         NULL,
  -- canonical anchor (used by the progress engine; polymorphic → no FK)
  context_type             VARCHAR(10)  NOT NULL DEFAULT 'none',
  context_id               CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  -- legacy anchors kept for data fidelity (import ⚠: 1 orphaned linked_lesson_id → NULL)
  linked_track_id          CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  linked_module_id         CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  linked_topic_id          CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  linked_lesson_id         CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  linked_entity_id         CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'legacy, superseded by context_id — no FK',
  -- behavior
  passing_score            INT          NOT NULL DEFAULT 70,
  time_limit_minutes       INT          NULL COMMENT 'renamed from time_limit (doc 35 §2.1)',
  max_attempts             INT          NULL,
  feedback_policy          VARCHAR(30)  NULL,
  show_correct_answers     BOOLEAN      NOT NULL DEFAULT FALSE,
  show_results_immediately BOOLEAN      NOT NULL DEFAULT FALSE,
  show_score_on_completion BOOLEAN      NOT NULL DEFAULT FALSE,
  shuffle_questions        BOOLEAN      NOT NULL DEFAULT FALSE,
  shuffle_answers          BOOLEAN      NOT NULL DEFAULT FALSE,
  usage_count              INT          NOT NULL DEFAULT 0,
  average_score            DECIMAL(5,2) NULL,
  status                   VARCHAR(20)  NOT NULL DEFAULT 'draft',
  created_at               DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at               DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by               CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_exams_exam_id (exam_id),
  KEY idx_exams_context (context_type, context_id),
  KEY idx_exams_entrance (is_entrance_exam),
  CONSTRAINT chk_exams_context CHECK (context_type IN ('lesson','topic','none')),
  CONSTRAINT chk_exams_status  CHECK (status IN ('draft','published','archived','deleted')),
  CONSTRAINT fk_exams_track  FOREIGN KEY (linked_track_id)  REFERENCES learning_tracks (id) ON DELETE SET NULL,
  CONSTRAINT fk_exams_module FOREIGN KEY (linked_module_id) REFERENCES shared_modules (id) ON DELETE SET NULL,
  CONSTRAINT fk_exams_topic  FOREIGN KEY (linked_topic_id)  REFERENCES topics (id) ON DELETE SET NULL,
  CONSTRAINT fk_exams_lesson FOREIGN KEY (linked_lesson_id) REFERENCES module_lessons (id) ON DELETE SET NULL,
  CONSTRAINT fk_exams_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='ModuleExam was dropped — a module-level exam is an Exam with the right context (CLEANUP_MAP §4.2).';

-- M:N junction Exam ↔ Question (replaces the embedded exams.questions array
-- [{question_id, order_index, points}]; 0 orphans, 0 duplicates in backup).
CREATE TABLE exam_questions (
  exam_id     CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  question_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  points      INT NULL COMMENT 'per-exam override; NULL = questions.points',
  PRIMARY KEY (exam_id, question_id),
  KEY idx_eq_question (question_id) COMMENT 'reverse lookup: where is this question used',
  CONSTRAINT fk_eq_exam     FOREIGN KEY (exam_id)     REFERENCES exams (id) ON DELETE CASCADE,
  CONSTRAINT fk_eq_question FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- M:N junction ModuleLesson ↔ Question (replaces linked_question_ids array;
-- 60 refs in backup, 0 orphans).
CREATE TABLE lesson_questions (
  lesson_id   CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  question_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  PRIMARY KEY (lesson_id, question_id),
  KEY idx_lq_question (question_id),
  CONSTRAINT fk_lq_lesson   FOREIGN KEY (lesson_id)   REFERENCES module_lessons (id) ON DELETE CASCADE,
  CONSTRAINT fk_lq_question FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE exam_attempts (
  id                 CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id            CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  exam_id            CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  attempt_number     INT         NOT NULL DEFAULT 1,
  status             VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  score              INT         NULL,
  passed             BOOLEAN     NULL,
  seed               INT         NULL COMMENT 'shuffle seed for reproducible question order',
  question_order     JSON        NULL,
  answer_orders      JSON        NULL,
  current_index      INT         NULL,
  user_answers       JSON        NULL,
  detailed_results   JSON        NULL,
  feedback_shown     BOOLEAN     NOT NULL DEFAULT FALSE,
  started_at         DATETIME(3) NULL,
  submitted_at       DATETIME(3) NULL,
  time_spent_seconds INT         NULL,
  created_at         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at         DATETIME(3) NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by         CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_attempts_user_exam (user_id, exam_id),
  KEY idx_attempts_exam (exam_id),
  CONSTRAINT chk_attempts_status CHECK (status IN ('in_progress','completed','abandoned','timed_out')),
  CONSTRAINT fk_ea_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_ea_exam FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE RESTRICT,
  CONSTRAINT fk_ea_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='[schema-only, 0 records] Go-forward employee attempt log. Phase 4 requires recording failed attempts too (PROGRESS_ENGINE §13.3).';

-- ═══ DOMAIN D · PROGRESS (append-only event log — the hottest table) ════════

CREATE TABLE user_progress (
  id                    CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id               CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  progress_type         VARCHAR(24) NOT NULL,
  -- Dimension references: indexed but deliberately WITHOUT FK constraints.
  -- 97 backup events reference deleted lessons; an append-only event log must
  -- retain historical ids after content deletion (SET NULL would destroy the
  -- engine's dedup keys, CASCADE would destroy history). PROGRESS_ENGINE §13.2.
  track_id              CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  module_id             CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  topic_id              CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  lesson_id             CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  exam_id               CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  completion_percentage INT           NULL,
  score                 INT           NULL,
  time_spent_minutes    DECIMAL(10,2) NULL COMMENT 'pre-2026-07-10 values are heartbeat artifacts — excluded by TIME_TRACKING_EPOCH (PROGRESS_ENGINE §9)',
  completed_at          DATETIME(3)   NULL COMMENT 'set only on completion/exam events; effective date = completed_at ?? created_at',
  exam_answers          JSON          NULL COMMENT '[{question_id,user_answer,is_correct,points_earned}]',
  created_at            DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at            DATETIME(3)   NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by            CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_up_user_type_created (user_id, progress_type, created_at),
  KEY idx_up_user_completed (user_id, completed_at),
  KEY idx_up_lesson (lesson_id),
  KEY idx_up_exam (exam_id),
  CONSTRAINT chk_up_type CHECK (progress_type IN
    ('lesson_started','lesson_completed','exam_attempt','exam_passed',
     'module_completed','topic_completed','track_completed','lesson_quiz_attempt')),
  CONSTRAINT fk_up_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_up_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='APPEND-ONLY by design: no UPDATE/DELETE (API returns 405). Source of truth for all progress stats — the old User.progress_stats cache is gone. lesson_quiz_attempt is a legacy value present in data, counted by no metric.';

-- ═══ DOMAIN A′ · RECRUITMENT (needs exams/tracks → created after them) ══════

CREATE TABLE invites (
  id                    CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  email                 VARCHAR(255) NOT NULL,
  candidate_full_name   VARCHAR(255) NULL,
  department            VARCHAR(100) NULL,
  type                  VARCHAR(20)  NULL COMMENT 'user | candidate (NULL on 23 legacy rows)',
  requested_role        VARCHAR(20)  NULL COMMENT 'employee | candidate',
  target_system_role    VARCHAR(20)  NULL COMMENT 'role granted on acceptance: user | manager',
  require_assessment    BOOLEAN      NOT NULL DEFAULT FALSE,
  exam_id               CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  assigned_track_id     CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  invited_by_user_id    CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  invited_by_user_email VARCHAR(255) NULL COMMENT 'display snapshot',
  status                VARCHAR(20)  NOT NULL DEFAULT 'pending',
  -- magic-link security: raw token is NEVER stored (SHA-256 hash only).
  jti                   VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'JWT id',
  token_hash            CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'SHA-256 hex of the raw token; import computes it and discards the raw value',
  token_expires_at      DATETIME(3)  NOT NULL,
  token_used_at         DATETIME(3)  NULL,
  magic_link_opened_at  DATETIME(3)  NULL,
  last_sent_at          DATETIME(3)  NULL,
  resend_count          INT          NOT NULL DEFAULT 0,
  assessment_completed_at DATETIME(3) NULL,
  decision_made_by      VARCHAR(255) NULL COMMENT 'decider snapshot (id/email as stored in Base44)',
  decision_made_at      DATETIME(3)  NULL,
  decision_notes        TEXT         NULL,
  notes                 TEXT         NULL,
  metadata              JSON         NULL,
  created_at            DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at            DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by            CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_invites_jti (jti),
  UNIQUE KEY uq_invites_token_hash (token_hash),
  KEY idx_invites_email (email),
  KEY idx_invites_status (status),
  CONSTRAINT chk_invites_type   CHECK (type IN ('user','candidate')),
  CONSTRAINT chk_invites_status CHECK (status IN ('pending','started','test_submitted','completed','hired','expired')),
  CONSTRAINT fk_inv_exam    FOREIGN KEY (exam_id)            REFERENCES exams (id) ON DELETE SET NULL,
  CONSTRAINT fk_inv_track   FOREIGN KEY (assigned_track_id)  REFERENCES learning_tracks (id) ON DELETE SET NULL,
  CONSTRAINT fk_inv_inviter FOREIGN KEY (invited_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_inv_created_by FOREIGN KEY (created_by)      REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE candidate_assessments (
  id                  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  invite_id           CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'import ⚠: 3/10 backup refs orphaned → NULL (candidate_email keeps traceability)',
  candidate_email     VARCHAR(255) NOT NULL,
  candidate_full_name VARCHAR(255) NULL,
  department          VARCHAR(100) NULL,
  answers             JSON         NULL,
  score               INT          NOT NULL,
  total_questions     INT          NULL,
  correct_answers     INT          NULL,
  time_spent_seconds  INT          NULL,
  submitted_at        DATETIME(3)  NOT NULL,
  attempt_number      INT          NOT NULL DEFAULT 1,
  is_retake           BOOLEAN      NOT NULL DEFAULT FALSE,
  evaluation_decision VARCHAR(30)  NOT NULL DEFAULT 'pending_review',
  evaluation_date     DATETIME(3)  NULL,
  evaluator_notes     TEXT         NULL,
  ai_summary          TEXT         NULL,
  ip_address          VARCHAR(45)  NULL,
  user_agent          TEXT         NULL,
  assessment_metadata JSON         NULL,
  user_id             CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'linked only after hire',
  created_at          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at          DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by          CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_ca_invite (invite_id),
  KEY idx_ca_email (candidate_email),
  CONSTRAINT chk_ca_decision CHECK (evaluation_decision IN ('pending_review','approved','rejected','requires_interview')),
  CONSTRAINT fk_ca_invite FOREIGN KEY (invite_id) REFERENCES invites (id) ON DELETE SET NULL,
  CONSTRAINT fk_ca_user   FOREIGN KEY (user_id)   REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_ca_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='ExamResult was dropped — this entity won the duplicate (CLEANUP_MAP §4.3).';

CREATE TABLE role_upgrade_requests (
  id             CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id        CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'import ⚠: 2/2 backup refs orphaned → NULL (snapshots keep identity)',
  user_email     VARCHAR(255) NULL COMMENT 'snapshot',
  user_name      VARCHAR(255) NULL COMMENT 'snapshot',
  requested_role VARCHAR(20)  NOT NULL,
  current_role   VARCHAR(20)  NULL,
  department     VARCHAR(100) NULL,
  justification  TEXT         NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'pending',
  reviewed_by    CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  reviewed_at    DATETIME(3)  NULL,
  review_notes   TEXT         NULL,
  created_at     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at     DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by     CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_rur_status (status),
  KEY idx_rur_user (user_id),
  CONSTRAINT chk_rur_status CHECK (status IN ('pending','approved','rejected')),
  CONSTRAINT fk_rur_user     FOREIGN KEY (user_id)     REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_rur_reviewer FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_rur_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Server MUST forbid manager-granting-admin (privilege-escalation rule).';

-- M:N junction User ↔ LearningTrack (replaces users.completed_tracks array;
-- empty in backup — schema-ready).
CREATE TABLE user_completed_tracks (
  user_id      CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  track_id     CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  completed_at DATETIME(3) NULL,
  PRIMARY KEY (user_id, track_id),
  KEY idx_uct_track (track_id),
  CONSTRAINT fk_uct_user  FOREIGN KEY (user_id)  REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_uct_track FOREIGN KEY (track_id) REFERENCES learning_tracks (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Replaces users.retake_exam_scores array of objects. Surrogate PK: the same
-- user may retake the same exam more than once. Kept separate from
-- exam_attempts on purpose — these rows are result snapshots, not attempt logs.
CREATE TABLE user_retake_scores (
  id             CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id        CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  exam_id        CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  exam_title     VARCHAR(255) NULL COMMENT 'display snapshot',
  score          INT          NULL,
  passed         BOOLEAN      NULL,
  attempt_number INT          NULL,
  completed_at   DATETIME(3)  NULL,
  PRIMARY KEY (id),
  KEY idx_urs_user (user_id),
  CONSTRAINT fk_urs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_urs_exam FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ═══ DOMAIN E · KNOWLEDGE ═══════════════════════════════════════════════════

CREATE TABLE concepts (
  id               CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  term             VARCHAR(255) NOT NULL,
  short_description TEXT        NULL,
  full_description LONGTEXT     NULL,
  category         VARCHAR(100) NULL,
  difficulty_level VARCHAR(20)  NULL,
  image_url        TEXT         NULL,
  synonyms         JSON         NULL,
  related_terms    JSON         NULL COMMENT 'display labels (Hebrew term strings, NOT entity ids) — stays JSON by data reality',
  examples         JSON         NULL,
  external_links   JSON         NULL COMMENT '[{title, url}]',
  view_count       INT          NOT NULL DEFAULT 0,
  status           VARCHAR(20)  NOT NULL DEFAULT 'draft',
  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by       CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_concepts_status_category (status, category),
  CONSTRAINT chk_concepts_status CHECK (status IN ('draft','published','archived','deleted')),
  CONSTRAINT fk_concepts_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- M:N junction Concept ↔ ModuleLesson (replaces related_lessons array;
-- empty in backup — schema-ready, SRS-defined relation).
CREATE TABLE concept_lessons (
  concept_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  lesson_id  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  PRIMARY KEY (concept_id, lesson_id),
  KEY idx_cl_lesson (lesson_id),
  CONSTRAINT fk_cl_concept FOREIGN KEY (concept_id) REFERENCES concepts (id) ON DELETE CASCADE,
  CONSTRAINT fk_cl_lesson  FOREIGN KEY (lesson_id)  REFERENCES module_lessons (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE knowledge_articles (
  id          CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title       VARCHAR(255) NOT NULL,
  content     LONGTEXT     NULL COMMENT 'rich HTML — sanitized before render (client rule)',
  category    VARCHAR(100) NULL,
  type        VARCHAR(30)  NULL,
  tags        JSON         NULL,
  views       INT          NOT NULL DEFAULT 0,
  is_featured BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_ka_category (category),
  CONSTRAINT fk_ka_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[schema-only, 0 records] KMS core entity.';

CREATE TABLE troubleshooting_flows (
  id                  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title               VARCHAR(255) NOT NULL,
  description         TEXT         NULL,
  category            VARCHAR(100) NULL,
  difficulty_level    VARCHAR(20)  NULL,
  tags                JSON         NULL,
  flow_data           JSON         NOT NULL COMMENT '{nodes:[], connections:[]} — node types: start/question/action/solution/end/linked_flow',
  is_published        BOOLEAN      NOT NULL DEFAULT FALSE,
  usage_count         INT          NOT NULL DEFAULT 0,
  success_rate        DECIMAL(5,2) NULL,
  avg_completion_time DECIMAL(8,2) NULL,
  version             INT          NOT NULL DEFAULT 1,
  version_history     JSON         NULL,
  edit_permissions    JSON         NULL,
  share_settings      JSON         NULL,
  created_at          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at          DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by          CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_flows_published_category (is_published, category),
  CONSTRAINT fk_tf_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE flow_feedback (
  id                       CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  flow_id                  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id                  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  was_helpful              BOOLEAN      NULL,
  rating                   TINYINT      NULL,
  customer_sentiment       VARCHAR(20)  NULL,
  feedback_text            TEXT         NULL,
  suggestions              TEXT         NULL,
  would_recommend          BOOLEAN      NULL,
  solution_found           BOOLEAN      NULL,
  resolved_at_step         INT          NULL,
  step_number              INT          NULL,
  duration_minutes         DECIMAL(8,2) NULL,
  session_log              JSON         NULL,
  missing_flow             BOOLEAN      NOT NULL DEFAULT FALSE,
  missing_flow_description TEXT         NULL,
  handled                  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at               DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at               DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by               CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_ff_flow (flow_id),
  CONSTRAINT chk_ff_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_ff_flow FOREIGN KEY (flow_id) REFERENCES troubleshooting_flows (id) ON DELETE CASCADE,
  CONSTRAINT fk_ff_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_ff_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[schema-only, 0 records]';

-- ═══ DOMAIN F · CERTIFICATES & PROCEDURES ═══════════════════════════════════

CREATE TABLE certificate_templates (
  id           CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title        VARCHAR(255) NOT NULL,
  description  TEXT         NULL,
  type         VARCHAR(30)  NOT NULL,
  target_id    CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'polymorphic (track/module/exam…) — no FK',
  target_title VARCHAR(255) NULL,
  design       JSON         NULL,
  criteria     JSON         NULL,
  auto_issue   BOOLEAN      NOT NULL DEFAULT FALSE,
  send_email   BOOLEAN      NOT NULL DEFAULT FALSE,
  status       VARCHAR(20)  NOT NULL DEFAULT 'active',
  created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by   CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_ct_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[schema-only, 0 records]';

CREATE TABLE user_certificates (
  id                 CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id            CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  template_id        CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'SET NULL — deleting a template must not void issued certificates',
  certificate_title  VARCHAR(255) NULL,
  achievement_type   VARCHAR(30)  NULL,
  achievement_id     CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'polymorphic — no FK',
  achievement_title  VARCHAR(255) NULL,
  user_name          VARCHAR(255) NULL COMMENT 'snapshot at issue time',
  user_email         VARCHAR(255) NULL COMMENT 'snapshot at issue time',
  issue_date         DATETIME(3)  NULL,
  score              INT          NULL,
  design             JSON         NULL,
  pdf_url            TEXT         NULL,
  certificate_number VARCHAR(64)  NULL,
  verification_code  VARCHAR(64)  NULL,
  shared_public      BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at         DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by         CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_uc_number (certificate_number),
  UNIQUE KEY uq_uc_verification (verification_code),
  KEY idx_uc_user (user_id),
  CONSTRAINT fk_uc_user     FOREIGN KEY (user_id)     REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_uc_template FOREIGN KEY (template_id) REFERENCES certificate_templates (id) ON DELETE SET NULL,
  CONSTRAINT fk_uc_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[schema-only, 0 records]';

CREATE TABLE procedures (
  id                       CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title                    VARCHAR(255) NOT NULL,
  summary                  TEXT         NULL,
  content                  LONGTEXT     NULL COMMENT 'rich HTML — sanitized before render',
  content_type             VARCHAR(10)  NOT NULL DEFAULT 'html',
  file_url                 TEXT         NULL,
  category                 VARCHAR(100) NULL,
  departments              JSON         NULL COMMENT 'targeting config (department values) — stays JSON',
  assigned_user_ids        JSON         NULL COMMENT 'targeting config — stays JSON (not a lifecycle M:N; acknowledgements are the relational record)',
  version                  VARCHAR(16)  NULL,
  requires_acknowledgement BOOLEAN      NOT NULL DEFAULT TRUE,
  published_date           DATETIME(3)  NULL,
  status                   VARCHAR(20)  NOT NULL DEFAULT 'draft',
  created_at               DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at               DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by               CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  CONSTRAINT chk_procedures_content_type CHECK (content_type IN ('html','file')),
  CONSTRAINT chk_procedures_status CHECK (status IN ('draft','published','archived','deleted')),
  CONSTRAINT fk_proc_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[schema-only, 0 records]';

CREATE TABLE procedure_acknowledgements (
  id              CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  procedure_id    CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id         CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_name       VARCHAR(255) NULL COMMENT 'audit snapshot',
  user_email      VARCHAR(255) NULL COMMENT 'audit snapshot',
  acknowledged_at DATETIME(3)  NOT NULL,
  ip_address      VARCHAR(45)  NULL,
  created_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by      CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pa_procedure_user (procedure_id, user_id),
  CONSTRAINT fk_pa_procedure FOREIGN KEY (procedure_id) REFERENCES procedures (id) ON DELETE CASCADE,
  CONSTRAINT fk_pa_user      FOREIGN KEY (user_id)      REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_pa_created_by FOREIGN KEY (created_by)  REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[schema-only, 0 records]';

-- ═══ DOMAIN G · AI & OPERATIONS ═════════════════════════════════════════════

CREATE TABLE ai_lesson_jobs (
  id                  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  job_id              VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'n8n job key (202+callback pattern)',
  status              VARCHAR(20)  NOT NULL DEFAULT 'pending',
  assigned_track_id   CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  assigned_module_id  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  created_lesson_id   CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  progress_percentage INT          NOT NULL DEFAULT 0,
  error_message       TEXT         NULL,
  payload             JSON         NULL COMMENT 'job input/config',
  created_at          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at          DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by          CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_alj_job_id (job_id),
  KEY idx_alj_status (status),
  CONSTRAINT fk_alj_track  FOREIGN KEY (assigned_track_id)  REFERENCES learning_tracks (id) ON DELETE SET NULL,
  CONSTRAINT fk_alj_module FOREIGN KEY (assigned_module_id) REFERENCES shared_modules (id) ON DELETE SET NULL,
  CONSTRAINT fk_alj_lesson FOREIGN KEY (created_lesson_id)  REFERENCES module_lessons (id) ON DELETE SET NULL,
  CONSTRAINT fk_alj_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='[schema-only, 0 records] AIJob was dropped — this entity won the duplicate (CLEANUP_MAP §4.4).';

CREATE TABLE agent_knowledge_sources (
  id         CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title      VARCHAR(255) NULL,
  file_url   TEXT         NOT NULL,
  file_type  VARCHAR(20)  NULL,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_aks_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[schema-only, 0 records]';

CREATE TABLE prompt_logs (
  id           CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_prompt  LONGTEXT    NULL,
  work_summary LONGTEXT    NULL,
  ai_insight   LONGTEXT    NULL,
  created_at   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3) NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by   CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_pl_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[schema-only, 0 records]';

CREATE TABLE work_sessions (
  id               CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id          CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  start_time       DATETIME(3)   NOT NULL,
  end_time         DATETIME(3)   NULL,
  duration_minutes DECIMAL(10,2) NULL,
  status           VARCHAR(20)   NULL,
  created_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)   NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by       CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_ws_user_start (user_id, start_time),
  CONSTRAINT fk_ws_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_ws_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='[schema-only, 0 records] exportWorkHours depends on this.';

-- ═══ DOMAIN H · SYSTEM & CONFIG ═════════════════════════════════════════════

CREATE TABLE app_settings (
  id          CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  -- `key` is a MySQL reserved word — kept for client compatibility, always backtick it.
  `key`       VARCHAR(100) NOT NULL,
  value       JSON         NULL,
  description TEXT         NULL,
  created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_app_settings_key (`key`),
  CONSTRAINT fk_as_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE wizard_configs (
  id                  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  wizard_id           VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'business key (e.g. managerDashboard, troubleshooting)',
  title               VARCHAR(255) NULL,
  description         TEXT         NULL,
  role                VARCHAR(20)  NULL COMMENT 'target audience role',
  is_enabled          BOOLEAN      NOT NULL DEFAULT TRUE,
  show_on_first_login BOOLEAN      NOT NULL DEFAULT FALSE,
  steps               JSON         NULL,
  created_at          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at          DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by          CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_wizard_configs_wizard_id (wizard_id),
  CONSTRAINT fk_wc_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- M:N junction User ↔ WizardConfig — replaces the users.dismissed_wizards /
-- completed_wizards arrays + wizard_progress object (all wizard ids in the
-- backup resolve against wizard_configs.wizard_id — verified, 0 orphans).
CREATE TABLE user_wizard_states (
  user_id   CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  wizard_id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  progress  JSON    NULL COMMENT '{viewed_steps, started_at, last_accessed}',
  PRIMARY KEY (user_id, wizard_id),
  KEY idx_uws_wizard (wizard_id),
  CONSTRAINT fk_uws_user   FOREIGN KEY (user_id)   REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_uws_wizard FOREIGN KEY (wizard_id) REFERENCES wizard_configs (wizard_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE notifications (
  id         CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id    CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  type       VARCHAR(40)  NOT NULL COMMENT 'candidate_assessed, exam_failed, ai_lesson_ready, … (SRS §1.10)',
  title      VARCHAR(255) NOT NULL,
  message    TEXT         NULL,
  priority   VARCHAR(10)  NOT NULL DEFAULT 'medium',
  is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
  link       TEXT         NULL,
  dedupe_key VARCHAR(255) NULL,
  metadata   JSON         NULL,
  created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_notif_user_read (user_id, is_read, created_at) COMMENT 'the unread-bell query',
  KEY idx_notif_dedupe (dedupe_key),
  CONSTRAINT chk_notif_priority CHECK (priority IN ('low','medium','high')),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_notif_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[schema-only, 0 records]';

CREATE TABLE changelogs (
  id           CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title        VARCHAR(255) NOT NULL,
  content      TEXT         NULL,
  publish_date DATETIME(3)  NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'draft',
  created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3)  NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by   CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_cl_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[schema-only, 0 records]';

CREATE TABLE system_feedback (
  id         CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id    CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  category   VARCHAR(30) NULL,
  rating     TINYINT     NULL,
  message    TEXT        NULL,
  status     VARCHAR(20) NOT NULL DEFAULT 'new',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  CONSTRAINT chk_sf_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_sf_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_sf_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[schema-only, 0 records]';

CREATE TABLE security_logs (
  id           CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  email        VARCHAR(255) NULL,
  ip_address   VARCHAR(45)  NULL,
  user_agent   TEXT         NULL,
  attempt_type VARCHAR(30)  NULL,
  status       VARCHAR(20)  NULL,
  path         VARCHAR(255) NULL,
  details      TEXT         NULL,
  metadata     JSON         NULL,
  created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_sl_email_created (email, created_at),
  KEY idx_sl_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='[schema-only, 0 records] Append-only audit log — no updated_at/created_by on purpose. Every sensitive action must be recorded here (security charter).';

CREATE TABLE content_approval_logs (
  id          CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  entity_type VARCHAR(30) NOT NULL,
  entity_id   CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'polymorphic — no FK',
  action      VARCHAR(20) NOT NULL,
  by_user_id  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  notes       TEXT        NULL,
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3) NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_cal_entity (entity_type, entity_id),
  CONSTRAINT fk_cal_user FOREIGN KEY (by_user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_cal_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[schema-only, 0 records]';

CREATE TABLE assistance_requests (
  id         CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id    CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  track_id   CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  lesson_id  CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  status     VARCHAR(20) NOT NULL DEFAULT 'open',
  priority   VARCHAR(10) NOT NULL DEFAULT 'medium',
  message    TEXT        NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NULL ON UPDATE CURRENT_TIMESTAMP(3),
  created_by CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (id),
  KEY idx_ar_status (status),
  CONSTRAINT fk_ar_user   FOREIGN KEY (user_id)   REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_ar_track  FOREIGN KEY (track_id)  REFERENCES learning_tracks (id) ON DELETE SET NULL,
  CONSTRAINT fk_ar_lesson FOREIGN KEY (lesson_id) REFERENCES module_lessons (id) ON DELETE SET NULL,
  CONSTRAINT fk_ar_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='[schema-only, 0 records]';

-- ═══ DEFERRED CROSS-DOMAIN FKs (referenced tables created after the owner) ══

ALTER TABLE users
  ADD CONSTRAINT fk_users_assigned_track       FOREIGN KEY (assigned_track_id)             REFERENCES learning_tracks (id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_users_invite               FOREIGN KEY (invite_id)                     REFERENCES invites (id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_users_pending_entrance     FOREIGN KEY (pending_entrance_exam_id)      REFERENCES exams (id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_users_pending_retake       FOREIGN KEY (pending_retake_exam_id)        REFERENCES exams (id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_users_pending_retake_invite FOREIGN KEY (pending_retake_exam_invite_id) REFERENCES invites (id) ON DELETE SET NULL;

ALTER TABLE module_lessons
  ADD CONSTRAINT fk_lessons_linked_exam FOREIGN KEY (linked_exam_id) REFERENCES exams (id) ON DELETE SET NULL;

-- ═══ END — 36 entity tables + 6 junction tables ═════════════════════════════
