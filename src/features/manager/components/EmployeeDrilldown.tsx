/**
 * פאנל צד — פרופיל מלא של עובד (doc 10 §4.6): שימוש חוזר ברכיבי עמוד הפרופיל
 * (useProfilePage/ExamHistorySection/ProfileStatsBlock, מיוצאים מ-features/profile
 * בדיוק לצורך הזה) — אותו מנוע התקדמות, אותם מספרים כמו כל שאר האפליקציה.
 */
import {
  Alert,
  Badge,
  Icon,
  IconButton,
  Loader,
  ProgressBar,
} from '@/components/ui'
import {
  ExamHistorySection,
  ProfileStatsBlock,
  useProfilePage,
} from '@/features/profile'
import { useActivityFeed } from '@/lib/hooks/useActivityFeed'
import { downloadTeamProgressCsv } from '../services/exportTeamProgress'
import type { MemberStatus, TeamMemberRow } from '../types'

const STATUS_BADGE: Record<
  MemberStatus,
  { color: 'success' | 'accent' | 'caution'; label: string }
> = {
  done: { color: 'success', label: 'הושלם' },
  active: { color: 'accent', label: 'פעיל' },
  risk: { color: 'caution', label: 'בסיכון' },
}

const activityDateFormatter = new Intl.DateTimeFormat('he-IL', {
  timeZone: 'Asia/Jerusalem',
  dateStyle: 'medium',
})

interface EmployeeDrilldownProps {
  row: TeamMemberRow
  onClose: () => void
}

export function EmployeeDrilldown({ row, onClose }: EmployeeDrilldownProps) {
  const profile = useProfilePage(row.userId)
  const activity = useActivityFeed(row.userId, 5)
  const status = STATUS_BADGE[row.status]

  return (
    <div
      className="fixed inset-0 z-50 flex justify-start bg-neutrals-charcoal/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      onClick={onClose}
      dir="rtl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[560px] flex-col overflow-y-auto bg-neutrals-whisper shadow-menu"
        role="dialog"
        aria-modal="true"
        aria-label={`פרופיל ${row.fullName}`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-neutrals-charcoal p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-[60px] w-[60px] flex-none items-center justify-center rounded-full border-2 border-white/25 bg-accent-gradient text-h4 font-semibold text-white">
              {row.initial}
            </span>
            <div>
              <div className="text-h4 font-semibold text-white">
                {row.fullName}
              </div>
              <div className="mt-1 text-small text-[#AEB9C6]">
                {row.trackTitle ?? 'ללא מסלול מוקצה'}
              </div>
              <span className="mt-2 inline-block">
                <Badge color={status.color}>{status.label}</Badge>
              </span>
            </div>
          </div>
          <IconButton
            variant="ghost"
            size="md"
            onClick={onClose}
            aria-label="סגירה"
            className="!bg-white/10 !text-white"
          >
            <Icon name="Close" size={18} />
          </IconButton>
        </div>

        <div className="flex flex-col gap-4 p-6">
          {profile.isLoading ? (
            <div className="flex min-h-40 items-center justify-center">
              <Loader label="טוען את פרטי העובד..." />
            </div>
          ) : profile.isError || !profile.data ? (
            <Alert kind="error" title="לא ניתן לטעון את פרטי העובד">
              נסה לסגור ולפתוח שוב את הפרופיל.
            </Alert>
          ) : (
            <>
              <ProfileStatsBlock stats={profile.data.stats} />

              {profile.data.track && (
                <div className="rounded-2xl bg-white p-5 shadow-card">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-body-bold text-neutrals-charcoal">
                      {profile.data.track.title}
                    </div>
                    <span className="text-body-bold text-accent">
                      {profile.data.track.percent}%
                    </span>
                  </div>
                  <div className="mb-3 text-tiny text-neutrals-lead">
                    {profile.data.track.lessonsDone}/
                    {profile.data.track.lessonsTotal} שיעורים הושלמו
                  </div>
                  <ProgressBar
                    percent={profile.data.track.percent}
                    done={row.status === 'done'}
                  />
                </div>
              )}

              <ExamHistorySection examHistory={profile.data.examHistory} />

              <div className="rounded-2xl bg-white p-5 shadow-card">
                <div className="mb-4 flex items-center gap-2">
                  <Icon name="Clock" size={17} className="text-accent" />
                  <div className="text-body-bold text-neutrals-charcoal">
                    פעילות אחרונה
                  </div>
                </div>
                {activity.isPending ? (
                  <Loader size="sm" />
                ) : !activity.data || activity.data.length === 0 ? (
                  <p className="text-small text-neutrals-lead">
                    עדיין אין פעילות רשומה.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {activity.data.map((item) => (
                      <li key={item.id} className="flex items-start gap-3">
                        <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-accent" />
                        <div className="min-w-0 flex-1">
                          <div className="text-small text-neutrals-charcoal">
                            {item.label}
                          </div>
                          <div className="text-tiny text-neutrals-nickel">
                            {activityDateFormatter.format(new Date(item.date))}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    downloadTeamProgressCsv(row.trackTitle ?? 'עובד', [row])
                  }
                  className="flex-1 rounded-[20px] border border-accent bg-transparent px-6 py-2.5 text-small font-semibold text-accent transition-colors hover:bg-[#C9EDFF]"
                >
                  הורד דוח עובד
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-[20px] px-6 py-2.5 text-small font-semibold text-accent hover:border hover:border-accent"
                >
                  סגירה
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
