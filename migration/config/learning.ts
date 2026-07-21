/**
 * Domain B — learning content hierarchy: LearningTrack ← TrackModule →
 * SharedModule → Topic → ModuleLesson. Orphan triage per RELATIONSHIPS ג׳.
 */
import type { JunctionSpec, Row, TableConfig } from '../types.ts'
import { asArray } from '../helpers.ts'

export const learningTracksConfig: TableConfig = {
  source: 'LearningTrack',
  target: 'learning_tracks',
}

export const sharedModulesConfig: TableConfig = {
  source: 'SharedModule',
  target: 'shared_modules',
}

export const trackModulesConfig: TableConfig = {
  source: 'TrackModule',
  target: 'track_modules',
  transform: (row, ctx) => {
    // 1 malformed backup row carries module fields but no shared_module_id.
    if (typeof row.track_id !== 'string' || typeof row.shared_module_id !== 'string') {
      ctx.bump('track_modules_dropped_malformed')
      return null
    }
    return row
  },
}

export const topicsConfig: TableConfig = {
  source: 'Topic',
  target: 'topics',
  renames: { module_id: 'shared_module_id' },
  transform: (row, ctx) => {
    // shared_module_id is NOT NULL: an orphaned topic cannot be nulled, so the
    // subtree is dropped (its lessons keep their data with topic_id nulled).
    const parent = row.shared_module_id
    if (typeof parent !== 'string' || !ctx.idSets.shared_modules.has(parent)) {
      ctx.bump('topics_dropped_orphan')
      return null
    }
    return row
  },
}

const lessonQuestions: JunctionSpec = {
  target: 'lesson_questions',
  sourceFields: ['linked_question_ids'],
  build: (lessonId, row) =>
    asArray(row.linked_question_ids).flatMap((qid, index) =>
      typeof qid === 'string' && qid !== ''
        ? [{ lesson_id: lessonId, question_id: qid, order_index: index }]
        : [],
    ),
}

export const moduleLessonsConfig: TableConfig = {
  source: 'ModuleLesson',
  target: 'module_lessons',
  // linked_exam_id is a deferred FK — NULL orphans defensively.
  fkRefs: [{ field: 'linked_exam_id', refTable: 'exams' }],
  junctions: [lessonQuestions],
  transform: (row, ctx) => {
    // If topic_id points to a dropped/missing topic, NULL it (nullable column).
    const topicId = row.topic_id
    if (typeof topicId === 'string' && !ctx.idSets.topics.has(topicId)) {
      row.topic_id = null
      ctx.bump('module_lessons.topic_id_nulled')
    }
    // DDL CHECK requires a parent: topic_id OR (legacy) shared_module_id. A
    // lesson left with neither is part of an orphaned subtree — drop it so the
    // output loads (its user_progress events keep their dangling lesson_id).
    const hasLegacyParent = typeof row.shared_module_id === 'string' && row.shared_module_id !== ''
    if (row.topic_id == null && !hasLegacyParent) {
      ctx.bump('module_lessons_dropped_orphan_subtree')
      return null
    }
    return row
  },
}
