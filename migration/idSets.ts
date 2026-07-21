/**
 * Pass 1: build id-sets for every table referenced by an fkRef, so pass 2 can
 * NULL orphaned foreign keys. The `topics` set holds only SURVIVING topics
 * (those whose shared_module_id resolves) so module_lessons.topic_id is nulled
 * against post-triage topics (RELATIONSHIPS Appendix ג׳).
 */
import type { Entities, Row } from './types.ts'

function idSet(records: Row[] | undefined): Set<string> {
  const set = new Set<string>()
  for (const r of records ?? []) {
    const id = r.id ?? r._id
    if (typeof id === 'string' && id !== '') set.add(id)
  }
  return set
}

export function buildIdSets(entities: Entities): Record<string, Set<string>> {
  const shared_modules = idSet(entities.SharedModule)

  // Topics with an orphaned parent are dropped before import, so exclude them.
  const topics = new Set<string>()
  for (const t of entities.Topic ?? []) {
    const parent = t.module_id ?? t.shared_module_id
    const id = t.id ?? t._id
    if (typeof id === 'string' && typeof parent === 'string' && shared_modules.has(parent)) {
      topics.add(id)
    }
  }

  return {
    users: idSet(entities.User),
    learning_tracks: idSet(entities.LearningTrack),
    shared_modules,
    topics,
    module_lessons: idSet(entities.ModuleLesson),
    questions: idSet(entities.Question),
    exams: idSet(entities.Exam),
    invites: idSet(entities.Invite),
  }
}
