/**
 * טיפוסי-התצוגה של feature הגיוס (Phase 8, מסמך 35) — לא הישויות עצמן
 * (Invite/CandidateAssessment ב-types/entities.ts), אלא הצורות שה-UI צורך.
 */
import type { InviteStatus, UserRole } from '@/lib/constants/enums'

/** טיוטת הזמנת-מועמד (טופס CandidateInviteModal) → createCandidateInvite. */
export interface CandidateInviteDraft {
  email: string
  fullName: string
  department: string
  /** '' = ללא מבחן-כניסה */
  examId: string
  /** '' = ללא מסלול משויך */
  assignedTrackId: string
  requireAssessment: boolean
  /** התפקיד שייקבע בקליטה (target_system_role) */
  targetRole: UserRole
}

export const EMPTY_CANDIDATE_INVITE_DRAFT: CandidateInviteDraft = {
  email: '',
  fullName: '',
  department: '',
  examId: '',
  assignedTrackId: '',
  requireAssessment: true,
  targetRole: 'user',
}

/** ספירת-מועמדים לפי שלב בצינור (pipeline) — נגזר מ-Invite.status. */
export interface StageCount {
  status: InviteStatus
  count: number
}

/** אפשרות-בחירה גנרית ל-SelectField (מחלקה / מבחן / מסלול). */
export interface SelectOption {
  value: string
  label: string
}

/** קהל דף-הנחיתה של ההזמנה (Welcome Invite.dc.html — audience). */
export type InviteAudience = 'candidate' | 'employee'

/** שאלת מבחן-כניסה מוכנה לרינדור למועמד (Question + ניקוד מה-ref). */
export interface CandidateExamQuestion {
  id: string
  text: string
  options: string[]
  correctIndex: number
  maxPoints: number
}

/** נתוני מבחן-הכניסה שנשלפו למועמד (fetchExamDataForCandidate). */
export interface CandidateExamData {
  examTitle: string
  timeLimitMinutes: number | null
  questions: CandidateExamQuestion[]
}

/** מודל-התצוגה של דף נחיתת-ההזמנה (Welcome Invite.dc.html), נגזר מ-Invite. */
export interface WelcomeInviteView {
  audience: InviteAudience
  inviteeName: string
  inviteeEmail: string
  inviterName: string
  inviterInitials: string
  department: string
  roleLabel: string
  subtitle: string
  expiryDate: string
  steps: { num: string; title: string; text: string }[]
}
