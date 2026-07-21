/**
 * Aggregates the per-domain table configs and defines the FK-safe import order.
 *
 * CONFIGS — one entry per Base44 source entity that carries data. Entities with
 * 0 records or dropped by CLEANUP_MAP (Course, ModuleExam, ExamResult, AIJob,
 * KnowledgeArticle, …) have no config and are never emitted.
 *
 * IMPORT_ORDER — every target table + junction in topological (FK-safe) order,
 * derived from schema/RELATIONSHIPS.md. The writer emits a .jsonl for each entry
 * that produced rows and records the full ordered list in manifest.json, so the
 * team lead loads in exactly this sequence.
 */
import type { TableConfig } from '../types.ts'
import { usersConfig } from './users.ts'
import {
  learningTracksConfig,
  moduleLessonsConfig,
  sharedModulesConfig,
  topicsConfig,
  trackModulesConfig,
} from './learning.ts'
import { examsConfig, questionsConfig, userProgressConfig } from './assessment.ts'
import {
  candidateAssessmentsConfig,
  invitesConfig,
  roleUpgradeRequestsConfig,
} from './recruitment.ts'
import { conceptsConfig, troubleshootingFlowsConfig } from './knowledge.ts'
import { appSettingsConfig, wizardConfigsConfig } from './system.ts'

export const CONFIGS: TableConfig[] = [
  usersConfig,
  learningTracksConfig,
  sharedModulesConfig,
  trackModulesConfig,
  topicsConfig,
  questionsConfig,
  examsConfig,
  moduleLessonsConfig,
  invitesConfig,
  candidateAssessmentsConfig,
  roleUpgradeRequestsConfig,
  userProgressConfig,
  conceptsConfig,
  troubleshootingFlowsConfig,
  appSettingsConfig,
  wizardConfigsConfig,
]

export const IMPORT_ORDER: string[] = [
  'users',
  'learning_tracks',
  'shared_modules',
  'track_modules',
  'topics',
  'questions',
  'exams',
  'module_lessons',
  'exam_questions',
  'lesson_questions',
  'lesson_versions',
  'lesson_notes',
  'shared_guide_links',
  'invites',
  'candidate_assessments',
  'role_upgrade_requests',
  'exam_attempts',
  'user_progress',
  'concepts',
  'concept_lessons',
  'knowledge_articles',
  'troubleshooting_flows',
  'flow_feedback',
  'certificate_templates',
  'user_certificates',
  'procedures',
  'procedure_acknowledgements',
  'ai_lesson_jobs',
  'agent_knowledge_sources',
  'prompt_logs',
  'work_sessions',
  'app_settings',
  'wizard_configs',
  'user_wizard_states',
  'notifications',
  'changelogs',
  'system_feedback',
  'security_logs',
  'content_approval_logs',
  'assistance_requests',
  'user_completed_tracks',
  'user_retake_scores',
]
