/**
 * פעילות אחרונה (docs/02_Dashboard_ClaudeDesign_Brief.md §6) — פיד אירועים
 * אחרון, עם מצב ריק ייעודי (לפי פרומפט האיטרציה במסמך).
 */
import { Card, Icon, type IconName } from '@/components/ui'
import type {
  ActivityFeedItem,
  ActivityFeedItemType,
} from '@/lib/services/activityFeedService'

interface ActivityFeedCardProps {
  items: ActivityFeedItem[]
}

const ICON_BY_TYPE: Record<ActivityFeedItemType, IconName> = {
  lesson_completed: 'File',
  exam_passed: 'SuccessV',
  track_completed: 'Round',
}

const dateFormatter = new Intl.DateTimeFormat('he-IL', {
  timeZone: 'Asia/Jerusalem',
  dateStyle: 'medium',
})

export function ActivityFeedCard({ items }: ActivityFeedCardProps) {
  return (
    <Card padding="lg" className="flex flex-col gap-4">
      <h3 className="text-h4 font-semibold text-neutrals-charcoal">
        פעילות אחרונה
      </h3>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Icon name="Empty" size={32} className="text-neutrals-nickel" />
          <p className="text-small text-neutrals-lead">
            עדיין אין פעילות — בוא נתחיל
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-neutrals-whisper text-accent">
                <Icon name={ICON_BY_TYPE[item.type]} size={18} />
              </span>
              <span className="min-w-0 flex-1 truncate text-small text-neutrals-charcoal">
                {item.label}
              </span>
              <span className="flex-none text-tiny text-neutrals-lead">
                {dateFormatter.format(new Date(item.date))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
