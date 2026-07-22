/**
 * הסכמות החדשות (שלב 3.1) מול הגיבוי האמיתי — כולל שתי האנומליות המתועדות
 * ב-entities.ts: רשומת TrackModule בלי shared_module_id, ו-9 ModuleLesson
 * יתומים בלי topic_id. הבדיקה מוודאת ש-parse לא נכשל על אף רשומה.
 */
import { describe, expect, it } from 'vitest'
import { createMockResource } from '@/lib/api/mock/mockApi'
import {
  conceptSchema,
  learningTrackSchema,
  moduleLessonSchema,
  procedureSchema,
  sharedModuleSchema,
  topicSchema,
  trackModuleSchema,
} from './schemas'

describe('סכמות היררכיית הלמידה מול הגיבוי האמיתי', () => {
  it('LearningTrack: 3 מסלולים, כולם עוברים parse', async () => {
    const tracks = await createMockResource(
      'LearningTrack',
      learningTrackSchema,
    ).findMany()
    expect(tracks).toHaveLength(3)
  })

  it('SharedModule: 11 מודולים, כולם עוברים parse', async () => {
    const modules = await createMockResource(
      'SharedModule',
      sharedModuleSchema,
    ).findMany()
    expect(modules).toHaveLength(11)
  })

  it('Topic: 39 נושאים, כולם עוברים parse', async () => {
    const topics = await createMockResource('Topic', topicSchema).findMany()
    expect(topics).toHaveLength(39)
  })

  it('TrackModule: 22 רשומות, כולל הרשומה החריגה בלי shared_module_id', async () => {
    const trackModules = await createMockResource(
      'TrackModule',
      trackModuleSchema,
    ).findMany()
    expect(trackModules).toHaveLength(22)
    const withoutModule = trackModules.filter((tm) => !tm.shared_module_id)
    expect(withoutModule).toHaveLength(1)
    expect(withoutModule[0]?.id).toBe('689c9b9431a6c2c373ad390a')
  })

  it('ModuleLesson: 89 שיעורים, כולל 9 רשומות יתומות בלי topic_id', async () => {
    // ה-fixture (57MB) — ה-transform שלו תחת עומס-מקביליות של הסוויט המלאה
    // חורג מ-timeout ברירת-המחדל (5s); timeout ארוך יותר, לא לוגיקה שונה.
    const lessons = await createMockResource(
      'ModuleLesson',
      moduleLessonSchema,
    ).findMany()
    expect(lessons).toHaveLength(89)
    expect(lessons.filter((l) => !l.topic_id)).toHaveLength(9)
  }, 20000)

  it('ModuleLesson: 76 שיעורי v2 עם blocks[], 13 legacy v1 בלי editor_version', async () => {
    const lessons = await createMockResource(
      'ModuleLesson',
      moduleLessonSchema,
    ).findMany()
    const v2 = lessons.filter((l) => l.editor_version === 'v2')
    const legacy = lessons.filter((l) => l.editor_version !== 'v2')
    expect(v2).toHaveLength(76)
    expect(legacy).toHaveLength(13)
    expect(
      v2.every((l) => Array.isArray(l.blocks) && l.blocks.length > 0),
    ).toBe(true)
  }, 20000)
})

describe('סכמת Concept מול הגיבוי האמיתי (שלב 6.8)', () => {
  it('96 מונחים, כולם עוברים parse', async () => {
    const concepts = await createMockResource(
      'Concept',
      conceptSchema,
    ).findMany()
    expect(concepts).toHaveLength(96)
  })

  it('category חורג מ-8 הקטגוריות של SRS — קטגוריות-ציוד עוברות as-is', async () => {
    const concepts = await createMockResource(
      'Concept',
      conceptSchema,
    ).findMany()
    const categories = new Set(concepts.map((c) => c.category))
    expect(categories.has('מצלמות אבטחה')).toBe(true)
    expect(categories.has('מרכזיות ענן (PBX)')).toBe(true)
  })

  it('related_lessons ריק בכל הרשומות — ה-junction concept_lessons טרם אוכלס', async () => {
    const concepts = await createMockResource(
      'Concept',
      conceptSchema,
    ).findMany()
    expect(concepts.every((c) => (c.related_lessons ?? []).length === 0)).toBe(
      true,
    )
  })
})

describe('סכמת Procedure מול הפיקסצ׳ר הזרוע (policies feature, SRS §2.6)', () => {
  it('כל נהלי-הדמו עוברים parse, וכולם עם title + content_type', async () => {
    const procedures = await createMockResource(
      'Procedure',
      procedureSchema,
    ).findMany()
    expect(procedures.length).toBeGreaterThan(0)
    expect(procedures.every((p) => p.title.length > 0)).toBe(true)
    expect(
      procedures.every((p) => ['html', 'file'].includes(p.content_type)),
    ).toBe(true)
  })

  it('נוהל content_type=html נושא blocks[], ונוהל content_type=file נושא file_url', async () => {
    const procedures = await createMockResource(
      'Procedure',
      procedureSchema,
    ).findMany()
    const htmlProc = procedures.find((p) => p.content_type === 'html')
    const fileProc = procedures.find((p) => p.content_type === 'file')
    expect(Array.isArray(htmlProc?.blocks)).toBe(true)
    expect(htmlProc?.blocks?.length).toBeGreaterThan(0)
    expect(fileProc?.file_url).toBeTruthy()
  })

  it('ProcedureAcknowledgement מתחילה ריקה (runtime-only) ותומכת ביצירה', async () => {
    const acks = createMockResource('ProcedureAcknowledgement')
    expect(await acks.findMany()).toHaveLength(0)
    const created = await acks.create({
      procedure_id: 'seed-procedure-01',
      user_id: 'u1',
      acknowledged_at: '2026-07-22T10:00:00.000Z',
    } as never)
    expect(created.id).toBeTruthy()
  })
})
