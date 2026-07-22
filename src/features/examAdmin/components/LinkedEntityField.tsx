/**
 * שדה "מקושר אל" בכרטיס פרטי-המבחן (design-export/Exam Builder.dc.html
 * שורות 121-124) — תיבה לחיצה עם הקישור הנוכחי (או "בחירת…"), פותחת את
 * LinkedEntityPickerPanel. מוצג רק ל-examType שאינו standalone_exam — לזה
 * אין ישות-מקור לקשר אליה (ראו ExamDetailsCard).
 */
import { useMemo, useState } from 'react'
import { Icon } from '@/components/ui'
import { useContentTree } from '@/features/contentManager'
import { EXAM_TYPE_META, EXAM_TYPE_TO_NODE_KIND } from '../constants'
import {
  flattenLinkableEntities,
  type LinkableEntity,
} from '../services/entityLinkPicker'
import { linkedIdForDraft } from '../services/examForm'
import type { ExamDraft } from '../types'
import { FieldLabel } from './fields'
import { LinkedEntityPickerPanel } from './LinkedEntityPickerPanel'

export function LinkedEntityField({
  draft,
  categories,
  onSelect,
}: {
  draft: ExamDraft
  categories: string[]
  onSelect: (entity: LinkableEntity) => void
}) {
  const kind = EXAM_TYPE_TO_NODE_KIND[draft.examType]
  const [open, setOpen] = useState(false)
  const treeQuery = useContentTree()
  const linkedId = linkedIdForDraft(draft)

  const entities = useMemo(
    () =>
      kind && treeQuery.data
        ? flattenLinkableEntities(treeQuery.data, kind)
        : [],
    [kind, treeQuery.data],
  )
  const linked = useMemo(
    () => entities.find((e) => e.id === linkedId) ?? null,
    [entities, linkedId],
  )

  if (!kind) return null
  const meta = EXAM_TYPE_META[draft.examType]

  return (
    <div>
      <FieldLabel>{meta.linkLabel}</FieldLabel>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-neutrals-silver bg-white px-3 text-body text-neutrals-charcoal outline-none transition-colors hover:border-neutrals-palladium focus:border-accent"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Icon name="Link" size={16} className="flex-none text-accent" />
          <span className="truncate">
            {linked
              ? `${meta.short} · ${linked.title}`
              : `בחירת ${meta.short}…`}
          </span>
        </span>
        <Icon
          name="ChevronDown"
          size={16}
          className="flex-none text-neutrals-nickel"
        />
      </button>

      {open && (
        <LinkedEntityPickerPanel
          examType={draft.examType}
          entities={entities}
          isLoading={treeQuery.isPending}
          isError={treeQuery.isError}
          categories={categories}
          selectedId={linkedId}
          onSelect={(entity) => {
            onSelect(entity)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
