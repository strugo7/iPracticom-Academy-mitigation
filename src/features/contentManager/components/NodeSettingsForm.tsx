/**
 * כרטיס פרטי הפריט (ContentManager, doc 12) — שדות ניתנים-לעריכה: כותרת (DS Input),
 * תיאור (textarea — Textarea הוא פער מאומת ב-DS, מסוגנן בטוקנים), סטטוס וקושי
 * (DS Tabs pill). תאי המטא הם קריאה-בלבד — 1:1 עם ה-design-export (עריכת
 * קטגוריה/שעות דורשת DS Select, פער מאומת — לא ממציאים).
 */
import { Badge, Input, Tabs } from '@/components/ui'
import type { ContentStatus, DifficultyLevel } from '@/lib/constants/enums'
import { DIFFICULTY_TABS, STATUS_TABS, statusMetaOf } from '../constants'
import type { NodeMetaRow } from '../services/nodeSettings'
import type { ContentNode } from '../types'

export interface SettingsDraft {
  title: string
  description: string
  status: ContentStatus
  difficulty: DifficultyLevel
}

function MetaCell({ label, value }: NodeMetaRow) {
  return (
    <div>
      <label className="mb-1.5 block text-tiny-bold text-neutrals-charcoal">
        {label}
      </label>
      <div className="flex h-10 items-center rounded-lg border border-neutrals-silver bg-white px-3 text-tiny font-semibold text-neutrals-charcoal">
        {value}
      </div>
    </div>
  )
}

export function NodeSettingsForm({
  node,
  typeLabel,
  metaRows,
  draft,
  onChange,
}: {
  node: ContentNode
  typeLabel: string
  metaRows: NodeMetaRow[]
  draft: SettingsDraft
  onChange: (patch: Partial<SettingsDraft>) => void
}) {
  const statusMeta = statusMetaOf(draft.status)

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-card">
      <h3 className="m-0 text-[15px] font-semibold text-neutrals-lead">
        פרטי {typeLabel}
      </h3>

      <Input
        label="כותרת"
        value={draft.title}
        onChange={(e) => onChange({ title: e.target.value })}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-tiny-bold text-neutrals-charcoal">תיאור</label>
        <textarea
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          className="w-full resize-y rounded-lg border border-neutrals-silver bg-white p-3 font-sans text-tiny leading-relaxed text-neutrals-charcoal outline-none transition-colors focus:border-accent"
        />
      </div>

      {/* status */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-tiny-bold text-neutrals-charcoal">
            סטטוס פרסום
          </label>
          <Badge color={statusMeta.badgeColor}>{statusMeta.label}</Badge>
        </div>
        <Tabs
          tabs={STATUS_TABS}
          value={draft.status}
          onChange={(id) => onChange({ status: id as ContentStatus })}
          variant="pill"
        />
      </div>

      <div className="h-px bg-neutrals-silver" />

      {/* meta grid (read-only) + order */}
      <div className="grid grid-cols-2 gap-4">
        {metaRows.map((row) => (
          <MetaCell key={row.label} label={row.label} value={row.value} />
        ))}
        <MetaCell label="סדר תצוגה" value={String(node.order)} />
      </div>

      {/* track-only: difficulty + thumbnail preview */}
      {node.kind === 'track' && (
        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-tiny-bold text-neutrals-charcoal">
              רמת קושי
            </label>
            <Tabs
              tabs={DIFFICULTY_TABS}
              value={draft.difficulty}
              onChange={(id) => onChange({ difficulty: id as DifficultyLevel })}
              variant="pill"
            />
          </div>
          <div>
            <label className="mb-2 block text-tiny-bold text-neutrals-charcoal">
              תמונת נושא (Thumbnail)
            </label>
            <div className="flex items-center gap-4">
              <div className="flex h-[92px] w-[148px] flex-none items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(120deg,#181D24,#1d3a55)]">
                {node.track.image_url ? (
                  <img
                    src={node.track.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-tiny text-white/70">אין תמונה</span>
                )}
              </div>
              {/* העלאת תמונה דורשת רכיב FileUpload (פער מאומת ב-DS) + אחסון R2 —
                  לא ממומש באיטרציה זו; מוצגת תצוגת התמונה הקיימת בלבד. */}
              <span className="text-xs text-neutrals-nickel">
                החלפת תמונה תתאפשר עם רכיב ההעלאה (שלב עתידי)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
