/**
 * מגירת פרטי-המשתמש (design-export שורות 204-283): כותרת-זהות, שדות
 * (תפקיד/סטטוס), מבט-מהיר (שימוש חוזר ב-ProfileStatsBlock/ProfileTrackProgress
 * של feature הפרופיל — אותו מנוע-התקדמות, לא מספרים ממציאים), ופעולות
 * (מבחן-כניסה/הודעה/שלח-שוב-הזמנה). "איפוס סיסמה" הושמט — אין עדיין
 * מערכת-אימות אמיתית מאחוריו (CLAUDE.md: אין UI ללא פעולה אמיתית).
 */
import { useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Icon,
  IconButton,
  Loader,
  ProgressBar,
  Tabs,
  Toggle,
  type TabItem,
} from '@/components/ui'
import { useProfilePage, ProfileStatsBlock } from '@/features/profile'
import { USER_ROLES, type UserRole } from '@/lib/constants/enums'
import type { Department, Exam, Invite, User } from '@/types/entities'
import { ROLE_META, initialsOf } from '../constants'
import { ExamCheckIcon, MessageIcon } from '../icons'
import type { EntranceExamOption } from '../types'

interface Props {
  user: User
  department: Department
  isDepartmentManager: boolean
  entranceExamOptions: EntranceExamOption[]
  pendingInvite: Invite | null
  onClose: () => void
  onRoleChange: (role: UserRole) => Promise<unknown>
  onToggleActive: (active: boolean) => Promise<unknown>
  onSendExam: (exam: Exam) => Promise<unknown>
  onSendMessage: (message: string) => Promise<unknown>
  onResendInvite: (invite: Invite) => Promise<unknown>
}

const ROLE_TABS: TabItem[] = USER_ROLES.map((r) => ({ id: r, label: ROLE_META[r].label }))

export function UserDetailDrawer({
  user,
  department,
  isDepartmentManager,
  entranceExamOptions,
  pendingInvite,
  onClose,
  onRoleChange,
  onToggleActive,
  onSendExam,
  onSendMessage,
  onResendInvite,
}: Props) {
  const profile = useProfilePage(user.id)
  const active = !user.disabled
  const [action, setAction] = useState<'exam' | 'message' | null>(null)
  const [examPick, setExamPick] = useState<string | null>(entranceExamOptions[0]?.exam.id ?? null)
  const [messageText, setMessageText] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSendExam = async () => {
    const option = entranceExamOptions.find((o) => o.exam.id === examPick)
    if (!option) return
    setBusy(true)
    try {
      await onSendExam(option.exam)
      setAction(null)
    } finally {
      setBusy(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) return
    setBusy(true)
    try {
      await onSendMessage(messageText.trim())
      setMessageText('')
      setAction(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex justify-start">
      <button
        type="button"
        aria-label="סגור"
        onClick={onClose}
        className="absolute inset-0 bg-neutrals-charcoal/40 backdrop-blur-sm"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="פרטי משתמש"
        className="relative flex h-full w-full max-w-[440px] flex-col overflow-y-auto bg-white shadow-menu"
      >
        <div className="relative flex-none bg-accent-gradient p-6 text-white">
          <IconButton
            variant="ghost"
            size="md"
            onClick={onClose}
            aria-label="סגור"
            className="absolute start-4 top-4 !bg-white/20 !text-white"
          >
            <Icon name="Close" size={18} />
          </IconButton>
          <div className="flex items-center gap-4">
            <span className="flex size-[60px] shrink-0 items-center justify-center rounded-full border-2 border-white/50 bg-white/20 text-[22px] font-semibold">
              {initialsOf(user.full_name)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-h4">{user.full_name}</span>
                {isDepartmentManager && (
                  <span className="rounded-md bg-white/20 px-2.5 py-0.5 text-tiny font-semibold">
                    מנהל מחלקה
                  </span>
                )}
              </div>
              <div dir="ltr" className="mt-1 text-end text-small text-[#DCEEFF]">
                {user.email}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-tiny-bold text-neutrals-nickel">מחלקה</label>
              <div className="flex h-10 items-center truncate rounded-lg border border-neutrals-silver bg-neutrals-whisper px-3 text-small text-neutrals-charcoal">
                {department.name}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-tiny-bold text-neutrals-nickel">מזהה</label>
              <div className="flex h-10 items-center truncate rounded-lg border border-neutrals-silver bg-neutrals-whisper px-3 text-tiny text-neutrals-nickel">
                {user.id}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-tiny-bold text-neutrals-nickel">תפקיד</label>
            <Tabs
              variant="pill"
              tabs={ROLE_TABS}
              value={user.role}
              onChange={(id) => onRoleChange(id as UserRole)}
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg bg-neutrals-whisper p-4">
            <div className="min-w-0">
              <div className="font-semibold text-small text-neutrals-charcoal">חשבון פעיל</div>
              <div className="mt-0.5 text-tiny text-neutrals-nickel">
                {active ? 'המשתמש יכול להתחבר ולגשת לתוכן' : 'המשתמש חסום מהתחברות'}
              </div>
            </div>
            <Toggle checked={active} onChange={(v) => onToggleActive(v)} />
          </div>

          <div>
            <label className="mb-2 block text-tiny-bold text-neutrals-nickel">מבט מהיר</label>
            {profile.isLoading ? (
              <Loader size="sm" />
            ) : profile.isError || !profile.data ? (
              <Alert kind="error" title="לא ניתן לטעון נתוני התקדמות">
                נסו לסגור ולפתוח שוב את המגירה.
              </Alert>
            ) : (
              <div className="flex flex-col gap-3">
                <ProfileStatsBlock stats={profile.data.stats} />
                {profile.data.track && (
                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-small text-neutrals-charcoal">
                        {profile.data.track.title}
                      </span>
                      <span className="text-tiny font-semibold text-accent">
                        {profile.data.track.percent}%
                      </span>
                    </div>
                    <ProgressBar percent={profile.data.track.percent} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-tiny-bold text-neutrals-nickel">פעולות</label>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setAction((a) => (a === 'exam' ? null : 'exam'))}
                className="flex w-full items-center gap-3 rounded-lg border border-neutrals-silver bg-white p-3 text-start transition-colors hover:border-neutrals-palladium"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-hues-sky text-accent">
                  <ExamCheckIcon size={17} />
                </span>
                <span className="flex-1 font-semibold text-small text-neutrals-charcoal">
                  שלח מבחן כניסה
                </span>
                <Icon
                  name="ChevronDown"
                  size={16}
                  className={`text-neutrals-nickel transition-transform ${action === 'exam' ? 'rotate-180' : ''}`}
                />
              </button>
              {action === 'exam' && (
                <div className="rounded-lg border border-neutrals-silver bg-neutrals-whisper p-3">
                  {entranceExamOptions.length === 0 ? (
                    <p className="m-0 text-small text-neutrals-nickel">
                      אין מבחני-כניסה זמינים במאגר.
                    </p>
                  ) : (
                    <>
                      <div className="mb-2 text-tiny-bold text-neutrals-nickel">
                        בחרו מבחן כניסה
                      </div>
                      <div className="mb-3 flex flex-col gap-2">
                        {entranceExamOptions.map(({ exam, questionCount }) => {
                          const on = exam.id === examPick
                          return (
                            <button
                              key={exam.id}
                              type="button"
                              onClick={() => setExamPick(exam.id)}
                              className={`flex items-center gap-2 rounded-lg border p-2 text-start transition-colors ${
                                on ? 'border-accent bg-hues-sky' : 'border-neutrals-silver bg-white'
                              }`}
                            >
                              <span
                                className={`flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 ${on ? 'border-accent' : 'border-neutrals-palladium'}`}
                              >
                                {on && <span className="size-[9px] rounded-full bg-accent" />}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block font-semibold text-small text-neutrals-charcoal">
                                  {exam.title}
                                </span>
                                <span className="block text-tiny text-neutrals-nickel">
                                  {questionCount} שאלות
                                  {exam.time_limit_minutes
                                    ? ` · ${exam.time_limit_minutes} דק׳`
                                    : ''}
                                </span>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      <Button
                        variant="primary"
                        className="w-full"
                        disabled={busy}
                        onClick={handleSendExam}
                      >
                        שלח מבחן + התראה
                      </Button>
                    </>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setAction((a) => (a === 'message' ? null : 'message'))}
                className="flex w-full items-center gap-3 rounded-lg border border-neutrals-silver bg-white p-3 text-start transition-colors hover:border-neutrals-palladium"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(188,162,141,0.3)] text-hues-bronze">
                  <MessageIcon size={17} />
                </span>
                <span className="flex-1 font-semibold text-small text-neutrals-charcoal">
                  שלח הודעה
                </span>
                <Icon
                  name="ChevronDown"
                  size={16}
                  className={`text-neutrals-nickel transition-transform ${action === 'message' ? 'rotate-180' : ''}`}
                />
              </button>
              {action === 'message' && (
                <div className="rounded-lg border border-neutrals-silver bg-neutrals-whisper p-3">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="כתבו הודעה קצרה שתישלח כהתראה במערכת…"
                    className="w-full resize-y rounded-lg border border-neutrals-silver bg-white p-3 text-small leading-relaxed text-neutrals-charcoal outline-none focus:border-accent"
                    rows={3}
                  />
                  <Button
                    variant="primary"
                    className="mt-2 w-full !bg-hues-bronze"
                    disabled={busy || !messageText.trim()}
                    onClick={handleSendMessage}
                  >
                    שלח כהתראה
                  </Button>
                </div>
              )}

              {pendingInvite && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true)
                    try {
                      await onResendInvite(pendingInvite)
                    } finally {
                      setBusy(false)
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-lg border border-neutrals-silver bg-white p-3 text-start transition-colors hover:border-neutrals-palladium"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-hues-mint text-success">
                    <Icon name="MailLine" size={17} />
                  </span>
                  <span className="flex-1 font-semibold text-small text-neutrals-charcoal">
                    שלח שוב הזמנה
                  </span>
                  <Badge color="warning">ממתינה</Badge>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-none border-t border-neutrals-silver p-4">
          <Button
            variant={active ? 'red' : 'primary'}
            className="w-full"
            onClick={() => onToggleActive(!active)}
          >
            {active ? 'השבת משתמש' : 'הפעל משתמש'}
          </Button>
        </div>
      </aside>
    </div>
  )
}
