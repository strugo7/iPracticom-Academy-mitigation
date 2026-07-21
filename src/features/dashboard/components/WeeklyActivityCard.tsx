/**
 * פעילות שבועית (docs/02_Dashboard_ClaudeDesign_Brief.md §4) — שיעורים/זמן
 * השבוע + ציון ממוצע כדונאט עדין.
 */
import { Card, Icon } from '@/components/ui'
import { RingProgress } from '@/components/ui/dashboard/RingPie'
import type { ProgressStats } from '@/lib/services/progressService'

interface WeeklyActivityCardProps {
  stats: Pick<
    ProgressStats,
    'weekly_lessons' | 'weekly_time_spent_minutes' | 'avg_score'
  >
}

export function WeeklyActivityCard({ stats }: WeeklyActivityCardProps) {
  return (
    <Card padding="lg" className="flex flex-col gap-6">
      <h3 className="text-h4 font-semibold text-neutrals-charcoal">
        פעילות השבוע
      </h3>
      <div className="flex items-center justify-between gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-hues-sky text-hues-cobalt">
              <Icon name="File" size={18} />
            </span>
            <span>
              <span className="block text-body-bold text-neutrals-charcoal">
                {stats.weekly_lessons}
              </span>
              <span className="block text-tiny text-neutrals-lead">
                שיעורים השבוע
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-neutrals-whisper text-neutrals-lead">
              <Icon name="Clock" size={18} />
            </span>
            <span>
              <span className="block text-body-bold text-neutrals-charcoal">
                {stats.weekly_time_spent_minutes} דק׳
              </span>
              <span className="block text-tiny text-neutrals-lead">
                זמן למידה השבוע
              </span>
            </span>
          </div>
        </div>
        <RingProgress
          value={stats.avg_score}
          color="teal"
          size={104}
          label={String(stats.avg_score)}
        />
      </div>
      <p className="text-tiny text-neutrals-lead">ציון ממוצע במבחנים</p>
    </Card>
  )
}
