/**
 * סריקת סימוני-מונח מתוך תוכן שיעורים — הצד ה"backlink" של הקישור (Obsidian-
 * style): "באילו שיעורים מופיע המונח". פונקציות טהורות, נבדקות בלי UI.
 *
 * המקור הוא ה-HTML של בלוקי-הטקסט (data-concept-id), ולא junction — כי כך זה
 * בדאטה האמיתי (`migrateConceptMarkers`, 8 מונחים ב-4 שיעורים בגיבוי). זה משלים
 * את `Concept.related_lessons` (קישור מפורש מהאשף): שם — מה שהעורך קישר ביודעין;
 * כאן — היכן המונח באמת מסומן בתוך הטקסט.
 */
import type { ModuleLesson } from '@/types/entities'

/** כל ה-concept-id-ים המסומנים בתוך בלוב-HTML כלשהו (בלוקים מסודרים כ-JSON). */
export function extractConceptIds(blob: string): string[] {
  const ids = new Set<string>()
  // תופס גם HTML גולמי וגם JSON עם escaping (data-concept-id=\"...\")
  const re = /data-concept-id=\\?"([a-f0-9]{24})\\?"/g
  let match: RegExpExecArray | null
  match = re.exec(blob)
  while (match !== null) {
    ids.add(match[1])
    match = re.exec(blob)
  }
  return [...ids]
}

/** ה-concept-id-ים המסומנים בשיעור בודד (סורק את כל הבלוקים שלו). */
export function conceptIdsInLesson(lesson: ModuleLesson): string[] {
  if (!lesson.blocks || lesson.blocks.length === 0) return []
  return extractConceptIds(JSON.stringify(lesson.blocks))
}

/**
 * מפת reverse-lookup: concept-id → רשימת השיעורים שבהם הוא מסומן.
 * חד-פעמי מעל כל השיעורים; ה-hook שומר במטמון react-query.
 */
export function buildConceptBacklinks(
  lessons: ModuleLesson[],
): Map<string, ModuleLesson[]> {
  const map = new Map<string, ModuleLesson[]>()
  for (const lesson of lessons) {
    for (const id of conceptIdsInLesson(lesson)) {
      const list = map.get(id)
      if (list) list.push(lesson)
      else map.set(id, [lesson])
    }
  }
  return map
}
