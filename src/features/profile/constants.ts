/**
 * הודעות "עדיין לא זמין" לקטעי הפרופיל שהישות התומכת שלהם לא קיימת עדיין
 * בשכבת הנתונים — לא type, לא zod schema, לא IResource (UserCertificate:
 * מוגדר ב-SRS §1.6 אך אפס מימוש בקוד; LessonNote: גם ב-SRS אין הגדרת שדות).
 * מוצג בכל זאת כקלף בפריסת העמוד (1:1 עם doc 09), במקום קישור-מת שקט —
 * כלל CLAUDE.md §6 סעיף 5: אין TODO/קוד מת בלי לומר זאת במפורש. תבנית
 * זהה ל-EXAM_PLAYER_UNAVAILABLE_MESSAGE (learning/constants.ts).
 */
export const PROFILE_CERTIFICATES_UNAVAILABLE_MESSAGE =
  'גלריית התעודות תתחבר בשלב התעודות — ישות UserCertificate עדיין לא קיימת בשכבת הנתונים.'

export const PROFILE_NOTES_UNAVAILABLE_MESSAGE =
  'רשימת ההערות תתחבר בשלב נפרד — ישות LessonNote עדיין לא מוגדרת ב-SRS או בקוד.'

export const PROFILE_SETTINGS_UNAVAILABLE_MESSAGE =
  'ניהול הגדרות החשבון (סיסמה, אימות דו-שלבי, העדפות התראות) ייבנה בשלב ייעודי (מסמך 16 — אשכול ההגדרות).'
