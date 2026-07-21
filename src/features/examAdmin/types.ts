/**
 * טיפוסי-תצוגה של מאגר-השאלות ובונה-המבחנים (Phase 6.6) — לא ישויות
 * (הישויות Question/Exam ב-@/types/entities). כאן: טיוטת-טופס לעריכה, מצב-סינון,
 * ופריט-שאלה מועשר לבונה.
 */
import type {
  ContentStatus,
  DifficultyLevel,
  ExamType,
  QuestionType,
  UserRole,
} from '@/lib/constants/enums'
import type { OrderSequenceItem, Question } from '@/types/entities'

/** סטטוס הניתן לעריכה בטופס (ללא 'deleted'). */
export type EditableStatus = Extract<
  ContentStatus,
  'draft' | 'published' | 'archived'
>

/**
 * טיוטת-עריכה של שאלה — מחזיקה את *כל* השדות של כל הסוגים במקביל, כדי שמעבר
 * בין סוגים לא יאבד קלט. המיפוי לצורת-האחסון (options/correct_answer_index/
 * order_items) נעשה ב-questionForm.ts בעת השמירה.
 */
export interface QuestionDraft {
  questionType: QuestionType
  questionText: string
  category: string
  topicTags: string[]
  difficulty: DifficultyLevel
  points: number
  explanation: string
  status: EditableStatus
  /** רב-ברירה */
  options: string[]
  correctIndex: number
  /** נכון/לא-נכון: true = "נכון" (correct_answer_index=0) */
  trueFalseCorrect: boolean
  /** סידור */
  orderItems: OrderSequenceItem[]
}

/** מפתחות-הסינון של מאגר-השאלות (design-export: 5 פילטרים). */
export interface QuestionFilters {
  search: string
  category: string | null
  questionType: QuestionType | null
  difficulty: DifficultyLevel | null
  status: EditableStatus | null
}

export const EMPTY_QUESTION_FILTERS: QuestionFilters = {
  search: '',
  category: null,
  questionType: null,
  difficulty: null,
  status: null,
}

/** שורת-שאלה בבונה: הפניה (question_id, points) + השאלה-המלאה מהמאגר. */
export interface ExamQuestionRow {
  question: Question
  /** ניקוד ה-override של המבחן (ExamQuestionRef.points) */
  points: number
}

/**
 * טיוטת-עריכה של פרטי-מבחן (אזור עליון בבונה).
 * הערת-סקופ: ה-design-export מציג שדה "מקושר אל" (בורר יעד track/module/topic/
 * lesson). בורר-ישות חוצה-היררכיה הוא feature נפרד (מסמך 12) — בשלב זה השדה
 * מוחלף ב-`category` (Exam.category, שדה חובה ב-SRS §1.4), שממלא את אותו תפקיד
 * סיווג ותואם RLS. exam_type נשמר כסיווג. הקישור הספציפי (linked_*_id) יתווסף
 * כשבורר-הישות ייבנה.
 */
export interface ExamDraft {
  title: string
  description: string
  category: string
  examType: ExamType
  difficulty: DifficultyLevel
  passingScore: number
  topicTags: string[]
  isEntrance: boolean
  targetRoles: UserRole[]
  targetDepartments: string[]
  status: EditableStatus
}
