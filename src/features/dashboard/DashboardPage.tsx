/**
 * דשבורד הלומד (Master Build Plan שלב 3.3, docs/02_Dashboard_ClaudeDesign_Brief.md).
 * קריאה בלבד מ-useProgress (progress_stats + insights) — אותו מקור-אמת שישמש
 * גם את נגן השיעור (שלב 3.2), כדי שהמספרים יהיו עקביים בין המסכים.
 */
import { Alert, Card, Loader } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { useActivityFeed } from '@/lib/hooks/useActivityFeed'
import { useLeaderboard } from '@/lib/hooks/useLeaderboard'
import { useProgress } from '@/lib/hooks/useProgress'
import { ActivityFeedCard } from './components/ActivityFeedCard'
import { HeroCard } from './components/HeroCard'
import { KpiCards } from './components/KpiCards'
import { LeaderboardCard } from './components/LeaderboardCard'
import { WeeklyActivityCard } from './components/WeeklyActivityCard'
import { useAssignedTrack } from './hooks/useAssignedTrack'

const PAGE_CONTAINER = 'mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-8 pb-10 pt-[26px]'

function WidgetFallback({ pending, message }: { pending: boolean; message: string }) {
  return (
    <Card padding="lg" className="flex min-h-[140px] items-center justify-center">
      {pending ? <Loader size="sm" /> : (
        <p className="text-small text-neutrals-lead">{message}</p>
      )}
    </Card>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const progress = useProgress(user?.id)
  const leaderboard = useLeaderboard(user?.id)
  const activityFeed = useActivityFeed(user?.id)
  const assignedTrack = useAssignedTrack(user?.assigned_track_id)

  if (!user) return null

  if (progress.isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader label="טוען את הדשבורד..." />
      </div>
    )
  }

  if (progress.isError) {
    return (
      <div className={PAGE_CONTAINER}>
        <Alert kind="error" title="שגיאה בטעינת ההתקדמות">
          לא הצלחנו לטעון את נתוני ההתקדמות שלך. נסה לרענן את הדף.
        </Alert>
      </div>
    )
  }

  const { stats, insights } = progress.data
  const hasAssignedTrack = Boolean(user.assigned_track_id)
  const lessonsRemaining = Math.max(
    stats.total_lessons_in_track - stats.lessons_completed,
    0,
  )

  return (
    <div className={PAGE_CONTAINER}>
      <HeroCard
        hasAssignedTrack={hasAssignedTrack}
        trackTitle={assignedTrack.data?.title ?? null}
        avgProgress={stats.avg_progress}
        lessonsRemaining={lessonsRemaining}
      />

      <KpiCards stats={stats} level={insights.level} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WeeklyActivityCard stats={stats} />

        {leaderboard.data ? (
          <LeaderboardCard
            top={leaderboard.data.top}
            currentUserId={user.id}
            currentUserEntry={leaderboard.data.currentUser}
          />
        ) : (
          <WidgetFallback
            pending={leaderboard.isPending}
            message="לא ניתן לטעון את טבלת המובילים כרגע."
          />
        )}
      </div>

      {activityFeed.data ? (
        <ActivityFeedCard items={activityFeed.data} />
      ) : (
        <WidgetFallback
          pending={activityFeed.isPending}
          message="לא ניתן לטעון את הפעילות האחרונה כרגע."
        />
      )}
    </div>
  )
}
