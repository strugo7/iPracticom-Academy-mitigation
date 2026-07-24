/**
 * כרטיס Playbook בספרייה (1:1 עם design-export/PlaybookCard.dc.html). לחיצה על
 * הכרטיס → הנגן; לבעל-הרשאה, אייקון עריכה קטן → העורך. הכרטיס כולו קישור (שכבת-
 * on מוחלטת), וכפתור העריכה יושב מעליה (z) כדי שלא ייבלע בקישור.
 */
import { Link, useNavigate } from 'react-router-dom'
import { Icon, IconButton, Tag } from '@/components/ui'
import type { TroubleshootingFlow } from '@/types/entities'
import { CategoryTag } from './CategoryTag'

function MetaItem({
  icon,
  children,
  tone = 'muted',
}: {
  icon: Parameters<typeof Icon>[0]['name']
  children: React.ReactNode
  tone?: 'muted' | 'success'
}) {
  const color = tone === 'success' ? 'text-success' : 'text-neutrals-lead'
  const weight = tone === 'success' ? 'font-semibold' : 'font-normal'
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-tiny ${color} ${weight}`}
    >
      <Icon name={icon} size={16} />
      {children}
    </span>
  )
}

export function PlaybookCard({
  flow,
  canEdit,
}: {
  flow: TroubleshootingFlow
  canEdit: boolean
}) {
  const navigate = useNavigate()
  const tags = flow.tags ?? []
  const time = flow.avg_completion_time
  return (
    <div className="group relative flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-card transition-[box-shadow,transform] duration-[250ms] hover:-translate-y-1 hover:shadow-menu">
      <Link
        to={`/troubleshooting/${flow.id}`}
        aria-label={`פתח Playbook: ${flow.title ?? ''}`}
        className="absolute inset-0 z-[1] rounded-2xl"
      />

      {/* קטגוריה + עריכה */}
      <div className="flex items-center justify-between gap-2">
        <CategoryTag category={flow.category} />
        {canEdit && (
          <span className="relative z-[2]">
            <IconButton
              variant="outline"
              size="sm"
              aria-label="ערוך Playbook"
              onClick={() => navigate(`/troubleshooting/${flow.id}/edit`)}
            >
              <Icon name="Edit" size={16} />
            </IconButton>
          </span>
        )}
      </div>

      {/* כותרת + תיאור */}
      <div>
        <h3 className="mb-2 text-body-bold font-semibold leading-[1.35] text-neutrals-charcoal">
          {flow.title}
        </h3>
        <p className="line-clamp-2 text-small leading-normal text-neutrals-lead">
          {flow.description}
        </p>
      </div>

      {/* מטא */}
      <div className="flex flex-wrap gap-4 border-t border-neutrals-silver pt-4">
        <MetaItem icon="Timeline">{flow.difficulty_level ?? 'בינוני'}</MetaItem>
        <MetaItem icon="Clock">
          {typeof time === 'number' ? `${time} דק׳` : '—'}
        </MetaItem>
        <MetaItem icon="SuccessV" tone="success">
          {flow.success_rate ?? 0}% הצלחה
        </MetaItem>
        <MetaItem icon="DataFlow">{flow.usage_count ?? 0} שימושים</MetaItem>
      </div>

      {/* תגיות */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Tag key={tag} type="break">
              {tag}
            </Tag>
          ))}
        </div>
      )}
    </div>
  )
}
