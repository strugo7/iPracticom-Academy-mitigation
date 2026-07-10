/**
 * הסכמות החדשות (שלב 3.1) מול הגיבוי האמיתי — כולל שתי האנומליות המתועדות
 * ב-entities.ts: רשומת TrackModule בלי shared_module_id, ו-9 ModuleLesson
 * יתומים בלי topic_id. הבדיקה מוודאת ש-parse לא נכשל על אף רשומה.
 */
import { describe, expect, it } from 'vitest'
import { createMockResource } from '@/lib/api/mock/mockApi'
import {
  learningTrackSchema,
  moduleLessonSchema,
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
})
