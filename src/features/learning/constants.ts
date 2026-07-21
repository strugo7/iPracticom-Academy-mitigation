/**
 * הודעות "עדיין לא זמין" ל-CTAs ששלב 3.2 (נגן-השיעור) לא סוגר — כל אחד מוצג
 * disabled עם ה-title המתאים, במקום קישור-מת שקט (כלל CLAUDE.md §6.5: אין
 * TODO/קוד מת בלי לומר זאת במפורש). נגן-שיעורים עצמו כבר מחובר (LessonRow,
 * TrackProgressHeader) — הנותרים כאן הם phases נפרדים: נגן-מבחנים, תעודות.
 */
export const EXAM_PLAYER_UNAVAILABLE_MESSAGE =
  'נגן המבחנים ייבנה בשלב נפרד — עדיין אי-אפשר לגשת למבחן בפועל.'

export const CERTIFICATE_VIEWER_UNAVAILABLE_MESSAGE =
  'צפייה בתעודה תיפתח בשלב התעודות — עדיין אי-אפשר לצפות בתעודה בפועל.'
