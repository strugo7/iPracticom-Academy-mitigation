/**
 * שורת-נוהל בגלריה (design-export/Policies.dc.html:85-106). שורות עם קרא-וחתום
 * לחיצות → פותחות מעקב. סטטוס = DS Badge (ללא נקודה, Shira gate #8); מד-המילוי
 * = ProgressBar (DS). צבעי-הסוג/האריח נגזרים מ-design typeMeta. פעולות צפייה/
 * עריכה (IconButton) בכל שורה — עריכה מוצגת רק למורשה (canManageContent).
 */
import { Badge, Icon, IconButton, ProgressBar, Tag } from '@/components/ui'
import { POLICY_STATUS_META, POLICY_TYPE_META } from '../constants'
import type { PolicyListItem } from '../types'

interface PolicyRowProps {
  policy: PolicyListItem
  /** לחיצה על שורת קרא-וחתום — פותחת מעקב. */
  onOpen: (policy: PolicyListItem) => void
  /** צפייה בנוהל (עמוד הקורא). */
  onView: (policy: PolicyListItem) => void
  /** עריכת נוהל (עורך) — נקרא רק כש-canEdit. */
  onEdit: (policy: PolicyListItem) => void
  /** מחיקת נוהל (מנהל בלבד) — נקרא רק כש-canDelete. */
  onDelete: (policy: PolicyListItem) => void
  /** האם המשתמש רשאי לערוך (מציג את אייקון העריכה). */
  canEdit: boolean
  /** האם המשתמש רשאי למחוק (מנהל — מציג את אייקון המחיקה). */
  canDelete: boolean
}

/** צבעי אריח-האייקון לפי סוג/קרא-וחתום (design iconBg/iconFg). */
const TILE_STYLE = {
  written: { background: '#E9F3FC', color: '#0075DB' },
  file: { background: '#F1ECFD', color: '#7C4DDA' },
} as const

const TYPE_COLOR = { written: '#0075DB', file: '#7C4DDA' } as const

export function PolicyRow({
  policy,
  onOpen,
  onView,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: PolicyRowProps) {
  const type = POLICY_TYPE_META[policy.type]
  const status = POLICY_STATUS_META[policy.status]
  const clickable = policy.requiresAck
  const tile = TILE_STYLE[policy.type]

  return (
    <div
      role={clickable ? 'button' : 'group'}
      tabIndex={0}
      onClick={clickable ? () => onOpen(policy) : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen(policy)
              }
            }
          : undefined
      }
      className={`flex flex-wrap items-center gap-3.5 rounded-2xl border border-neutrals-silver bg-white p-4 transition-all hover:border-[#BAD7F2] hover:shadow-[0_6px_18px_rgba(20,60,110,.08)] md:flex-nowrap ${
        clickable ? 'cursor-pointer' : ''
      }`}
    >
      {/* נוהל: אריח + כותרת + מטא */}
      <div className="flex min-w-[200px] flex-1 items-center gap-3">
        <span
          className="flex size-[42px] flex-none items-center justify-center rounded-[11px]"
          style={tile}
        >
          <Icon name="File" size={20} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold text-neutrals-charcoal">
              {policy.title}
            </span>
            {policy.requiresAck && (
              <Tag type="blue">
                <Icon name="Check" size={11} />
                קרא וחתום
              </Tag>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-neutrals-nickel">
            <span>גרסה {policy.version}</span>
            <span>·</span>
            <span>{policy.departmentLabel}</span>
            <span>·</span>
            <span>{policy.category}</span>
          </div>
        </div>
      </div>

      {/* פעולות: צפייה + עריכה (בגומחה שבין הכותרת לעמודות) */}
      <div className="flex flex-none items-center justify-center gap-1">
        <IconButton
          variant="outline"
          size="sm"
          aria-label="צפייה בנוהל"
          onClick={(e) => {
            e.stopPropagation()
            onView(policy)
          }}
        >
          <Icon name="View" size={17} />
        </IconButton>
        {canEdit && (
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="עריכת נוהל"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(policy)
            }}
          >
            <Icon name="Edit" size={16} />
          </IconButton>
        )}
        {canDelete && (
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="מחיקת נוהל"
            className="text-neutrals-nickel hover:text-hues-red"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(policy)
            }}
          >
            <Icon name="Remove" size={16} />
          </IconButton>
        )}
      </div>

      {/* סוג */}
      <div className="w-[88px] flex-none">
        <span
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold"
          style={{ color: TYPE_COLOR[policy.type] }}
        >
          <Icon name={type.icon} size={14} />
          {type.label}
        </span>
      </div>

      {/* סטטוס */}
      <div className="w-[110px] flex-none">
        <Badge color={status.color}>{status.label}</Badge>
      </div>

      {/* מד מילוי (קרא וחתום) */}
      <div className="w-[200px] flex-none">
        {policy.requiresAck && policy.audienceCount > 0 ? (
          <>
            <div className="flex items-center gap-2.5">
              <ProgressBar
                percent={policy.percent}
                done={policy.percent >= 80}
                className="flex-1"
              />
              <span className="flex-none text-[12.5px] font-semibold text-neutrals-charcoal">
                {policy.percent}%
              </span>
            </div>
            <div className="mt-1 text-[11px] text-neutrals-nickel">
              {policy.signedCount}/{policy.audienceCount} עובדים אישרו
            </div>
          </>
        ) : (
          <span className="text-[12px] text-neutrals-palladium">—</span>
        )}
      </div>

      {/* חץ פתיחה (RTL — פונה שמאלה) */}
      <div className="flex w-5 flex-none justify-center text-neutrals-nickel">
        {clickable && <Icon name="ChevronLeft" size={18} />}
      </div>
    </div>
  )
}
