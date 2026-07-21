/**
 * שדות משותפים לכל סוגי-השאלה (design-export/Question Bank.dc.html שורות 285-332):
 * קטגוריה, ניקוד, רמת-קושי, תגיות, הסבר, סטטוס. controlled מול QuestionDraft.
 */
import { Tabs } from '@/components/ui'
import type { DifficultyLevel } from '@/lib/constants/enums'
import { DIFFICULTY_META, STATUS_META } from '../constants'
import type { EditableStatus, QuestionDraft } from '../types'
import { FieldLabel, NumberStepper, SelectField, TagEditor, Textarea } from './fields'

const DIFFICULTY_TABS = (
  Object.keys(DIFFICULTY_META) as DifficultyLevel[]
).map((id) => ({ id, label: DIFFICULTY_META[id].label }))

const STATUS_TABS = (
  Object.keys(STATUS_META) as EditableStatus[]
).map((id) => ({ id, label: STATUS_META[id].label }))

export function SharedQuestionFields({
  draft,
  onChange,
  categories,
}: {
  draft: QuestionDraft
  onChange: (patch: Partial<QuestionDraft>) => void
  categories: string[]
}) {
  const categoryOpts = categories.includes(draft.category)
    ? categories
    : [draft.category, ...categories]

  return (
    <>
      <div className="h-px bg-neutrals-silver" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>קטגוריה</FieldLabel>
          <SelectField
            value={draft.category}
            onChange={(e) => onChange({ category: e.target.value })}
          >
            {categoryOpts.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>
        </div>
        <div>
          <FieldLabel>ניקוד</FieldLabel>
          <NumberStepper
            value={draft.points}
            min={1}
            onChange={(points) => onChange({ points })}
            suffix="נק׳"
          />
        </div>
      </div>

      <div>
        <FieldLabel>רמת קושי</FieldLabel>
        <Tabs
          variant="pill"
          tabs={DIFFICULTY_TABS}
          value={draft.difficulty}
          onChange={(id) => onChange({ difficulty: id as DifficultyLevel })}
        />
      </div>

      <div>
        <FieldLabel>תגיות</FieldLabel>
        <TagEditor
          tags={draft.topicTags}
          onChange={(topicTags) => onChange({ topicTags })}
        />
      </div>

      <div>
        <FieldLabel hint="(מוצג לאחר המענה)">הסבר לתשובה</FieldLabel>
        <Textarea
          rows={3}
          value={draft.explanation}
          onChange={(e) => onChange({ explanation: e.target.value })}
          placeholder="הסבר קצר שיעזור ללומד להבין את התשובה הנכונה…"
        />
      </div>

      <div>
        <FieldLabel>סטטוס</FieldLabel>
        <Tabs
          variant="pill"
          tabs={STATUS_TABS}
          value={draft.status}
          onChange={(id) => onChange({ status: id as EditableStatus })}
        />
      </div>
    </>
  )
}
