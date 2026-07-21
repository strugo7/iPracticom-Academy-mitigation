/**
 * דיאלוג יצירה/עריכה של מחלקה — שם, מחלקת-אב, תיאור. מחלקת-אב מסוננת נגד
 * מעגל (validParentCandidates) בעריכה; ביצירת תת-מחלקה מוצג ומקובע האב.
 */
import { useState } from 'react'
import {
  Button,
  Dialog,
  FieldLabel,
  Input,
  SelectField,
  Textarea,
} from '@/components/ui'
import type { Department } from '@/types/entities'

export interface DepartmentFormValue {
  name: string
  parentId: string | null
  description: string
}

interface Props {
  mode: 'create' | 'edit'
  /** ביצירת תת-מחלקה: האב מקובע. ביצירת-שורש/עריכה: ניתן לבחירה מהרשימה. */
  fixedParent: Department | null
  parentOptions: Department[]
  initialValue: DepartmentFormValue
  isSaving: boolean
  onSave: (value: DepartmentFormValue) => void
  onClose: () => void
}

/**
 * ההורה מרכיב את הדיאלוג הזה רק כש-deptDialog!=null (unmount מלא בסגירה) —
 * לכן ה-state המקומי מתאפס-מחדש בכל פתיחה דרך lazy init בלבד, בלי effect.
 */
export function DepartmentFormDialog({
  mode,
  fixedParent,
  parentOptions,
  initialValue,
  isSaving,
  onSave,
  onClose,
}: Props) {
  const [value, setValue] = useState(initialValue)

  const canSave = value.name.trim().length > 0

  return (
    <Dialog
      open
      onClose={onClose}
      title={mode === 'create' ? 'מחלקה חדשה' : 'עריכת מחלקה'}
      size="sm"
      footer={
        <>
          <Button variant="white" onClick={onClose}>
            ביטול
          </Button>
          <Button
            variant="primary"
            disabled={!canSave || isSaving}
            onClick={() => onSave({ ...value, name: value.name.trim() })}
          >
            {isSaving ? 'שומר…' : 'שמירה'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="שם המחלקה"
          value={value.name}
          onChange={(e) => setValue((v) => ({ ...v, name: e.target.value }))}
          placeholder="לדוגמה: תמיכה טכנית"
        />
        <div>
          <FieldLabel>מחלקת אב</FieldLabel>
          {fixedParent ? (
            <div className="flex h-10 items-center rounded-lg border border-neutrals-silver bg-neutrals-whisper px-3 text-body text-neutrals-lead">
              {fixedParent.name}
            </div>
          ) : (
            <SelectField
              value={value.parentId ?? ''}
              onChange={(e) =>
                setValue((v) => ({ ...v, parentId: e.target.value || null }))
              }
            >
              <option value="">— מחלקת שורש —</option>
              {parentOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </SelectField>
          )}
        </div>
        <div>
          <FieldLabel>תיאור</FieldLabel>
          <Textarea
            rows={3}
            value={value.description}
            onChange={(e) => setValue((v) => ({ ...v, description: e.target.value }))}
            placeholder="תיאור קצר של תפקיד המחלקה…"
          />
        </div>
      </div>
    </Dialog>
  )
}
