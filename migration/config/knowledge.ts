/**
 * Domain E — knowledge: Concept (related_lessons[] -> concept_lessons junction)
 * and TroubleshootingFlow (flow_data and friends stay as JSON).
 */
import type { JunctionSpec, TableConfig } from '../types.ts'
import { asArray } from '../helpers.ts'

const conceptLessons: JunctionSpec = {
  target: 'concept_lessons',
  sourceFields: ['related_lessons'],
  build: (conceptId, row) =>
    asArray(row.related_lessons).flatMap((lid) =>
      typeof lid === 'string' && lid !== ''
        ? [{ concept_id: conceptId, lesson_id: lid }]
        : [],
    ),
}

export const conceptsConfig: TableConfig = {
  source: 'Concept',
  target: 'concepts',
  // related_terms stays JSON (display strings, not ids); related_lessons -> junction.
  junctions: [conceptLessons],
}

export const troubleshootingFlowsConfig: TableConfig = {
  source: 'TroubleshootingFlow',
  target: 'troubleshooting_flows',
}
