/** טיפוסי-תצוגה של ה-ExamPlayer — לא ישויות (אלה ב-@/types/entities). */

export type ExamPlayerView = 'player' | 'overview' | 'result'

/**
 * מצב-ריבוע בניווט-ה-grid (מסמך 14 + design-export/Exam Player.dc.html).
 * flagged/skipped/notseen הם client-only — אין להם שדה ב-ExamAttempt (SRS §1.4);
 * רק current_index/user_answers נשמרים בפועל.
 */
export type QuestionStatus =
  | 'current'
  | 'answered'
  | 'flagged'
  | 'skipped'
  | 'notseen'
