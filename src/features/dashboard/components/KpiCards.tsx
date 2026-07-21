/**
 * שורת מדדי KPI (docs/02_Dashboard_ClaudeDesign_Brief.md §3) — קריאה ישירה
 * מ-ProgressStats/ProgressInsights (useProgress), בלי חישוב נוסף בקומפוננטה.
 */
import { Card, Icon, type IconName } from '@/components/ui'
import type { ProgressStats } from '@/lib/services/progressService'

interface KpiCardsProps {
  stats: ProgressStats
  level: number
}

function formatDuration(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes} דק׳`
  const hours = Math.round((totalMinutes / 60) * 10) / 10
  return `${hours} שעות`
}

interface KpiItem {
  icon: IconName
  iconClassName: string
  value: string
  label: string
}

function KpiCard({ icon, iconClassName, value, label }: KpiItem) {
  return (
    <Card padding="md" className="flex items-center gap-4">
      <span
        className={`flex h-12 w-12 flex-none items-center justify-center rounded-full ${iconClassName}`}
      >
        <Icon name={icon} size={22} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-h4 font-semibold text-neutrals-charcoal">
          {value}
        </span>
        <span className="truncate text-tiny text-neutrals-lead">{label}</span>
      </span>
    </Card>
  )
}

export function KpiCards({ stats, level }: KpiCardsProps) {
  const items: KpiItem[] = [
    {
      icon: 'PlusFilled',
      iconClassName: 'bg-accent-gradient text-white',
      value: String(stats.total_xp),
      label: `נקודות XP · רמה ${level}`,
    },
    {
      icon: 'File',
      iconClassName: 'bg-hues-sky text-hues-cobalt',
      value: `${stats.lessons_completed}/${stats.total_lessons_in_track}`,
      label: 'שיעורים שהושלמו',
    },
    {
      icon: 'SuccessV',
      iconClassName: 'bg-hues-mint text-hues-teal',
      value: `${stats.exams_passed}/${stats.total_exams}`,
      label: 'מבחנים שעברת',
    },
    {
      icon: 'Invoice',
      iconClassName: 'bg-hues-yellow text-neutrals-charcoal',
      value: String(stats.certificates_earned),
      label: 'תעודות',
    },
    {
      icon: 'Clock',
      iconClassName: 'bg-neutrals-whisper text-neutrals-lead',
      value: formatDuration(stats.total_time_spent_minutes),
      label: 'זמן למידה',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <KpiCard key={item.label} {...item} />
      ))}
    </div>
  )
}
