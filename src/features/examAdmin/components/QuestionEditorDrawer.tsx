/**
 * מגירת עורך-השאלה (design-export/Question Bank.dc.html שורות 152-347): overlay
 * + aside, כותרת עם צ'יפ-סוג, אזהרת-שימוש (אובייקט משותף), בורר-סוג, נוסח,
 * גוף-לפי-סוג, שדות משותפים, ופוטר פעולות. controlled מול QuestionDraft.
 */
import { Button, Comment, Icon, IconButton } from '@/components/ui'
import { QUESTION_TYPES, type QuestionType } from '@/lib/constants/enums'
import { QUESTION_TYPE_META } from '../constants'
import type { QuestionDraft } from '../types'
import { ExamGlyphChip } from './badges'
import { FieldLabel, Textarea } from './fields'
import {
  MultipleChoiceBody,
  OrderSequenceBody,
  TrueFalseBody,
} from './questionBodies'
import { SharedQuestionFields } from './SharedQuestionFields'

interface Props {
  mode: 'create' | 'edit'
  questionId: string | null
  usageCount: number
  draft: QuestionDraft
  onChange: (patch: Partial<QuestionDraft>) => void
  categories: string[]
  errors: string[]
  isSaving: boolean
  onSave: () => void
  onDelete?: () => void
  onClose: () => void
}

function TypeBody({
  draft,
  onChange,
}: {
  draft: QuestionDraft
  onChange: (patch: Partial<QuestionDraft>) => void
}) {
  switch (draft.questionType) {
    case 'multiple_choice':
      return <MultipleChoiceBody draft={draft} onChange={onChange} />
    case 'true_false':
      return <TrueFalseBody draft={draft} onChange={onChange} />
    case 'order_sequence':
      return <OrderSequenceBody draft={draft} onChange={onChange} />
  }
}

export function QuestionEditorDrawer({
  mode,
  questionId,
  usageCount,
  draft,
  onChange,
  categories,
  errors,
  isSaving,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const activeMeta = QUESTION_TYPE_META[draft.questionType]

  return (
    <div className="fixed inset-0 z-60 flex justify-start">
      <button
        type="button"
        aria-label="סגור"
        onClick={onClose}
        className="absolute inset-0 bg-neutrals-charcoal/40 backdrop-blur-sm"
      />
      <aside
        className="relative flex h-full w-full max-w-full flex-col bg-white shadow-menu sm:w-[620px]"
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'edit' ? 'עריכת שאלה' : 'שאלה חדשה'}
      >
        {/* head */}
        <div className="flex flex-none items-center justify-between gap-3 border-b border-neutrals-silver px-6 py-5">
          <div className="flex items-center gap-3">
            <ExamGlyphChip glyph={draft.questionType} color={activeMeta.color} size={40} />
            <div>
              <h2 className="text-h4 font-semibold text-neutrals-charcoal">
                {mode === 'edit' ? 'עריכת שאלה' : 'שאלה חדשה'}
              </h2>
              <span className="text-[12px] text-neutrals-nickel">
                {questionId ? `מזהה · ${questionId.slice(-6)}` : 'טיוטה חדשה'}
              </span>
            </div>
          </div>
          <IconButton variant="outline" size="md" aria-label="סגור" onClick={onClose}>
            <Icon name="Close" size={18} />
          </IconButton>
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          {usageCount > 0 && (
            <Comment variant="warning">
              השאלה מופיעה ב-<strong>{usageCount} מבחנים</strong>. עריכה תשפיע על
              כולם.
            </Comment>
          )}

          {/* type selector */}
          <div>
            <FieldLabel>סוג השאלה</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {QUESTION_TYPES.map((type: QuestionType) => {
                const m = QUESTION_TYPE_META[type]
                const on = draft.questionType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onChange({ questionType: type })}
                    className={`flex items-center gap-2 rounded-lg border-[1.5px] p-3 text-start transition-colors ${
                      on
                        ? 'border-accent bg-hues-sky'
                        : 'border-neutrals-silver bg-white hover:border-neutrals-palladium'
                    }`}
                  >
                    <ExamGlyphChip glyph={type} color={m.color} active={on} />
                    <span
                      className={`text-small font-semibold ${on ? 'text-accent' : 'text-neutrals-charcoal'}`}
                    >
                      {m.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* question text */}
          <div>
            <FieldLabel>נוסח השאלה</FieldLabel>
            <Textarea
              rows={2}
              value={draft.questionText}
              onChange={(e) => onChange({ questionText: e.target.value })}
              placeholder="כתבו את נוסח השאלה…"
            />
          </div>

          {/* type-specific body */}
          <div className="rounded-lg bg-neutrals-whisper p-4">
            <TypeBody draft={draft} onChange={onChange} />
          </div>

          <SharedQuestionFields
            draft={draft}
            onChange={onChange}
            categories={categories}
          />

          {errors.length > 0 && (
            <Comment variant="warning">
              <span>לא ניתן לשמור — {errors.join(' · ')}</span>
            </Comment>
          )}
        </div>

        {/* footer */}
        <div className="flex flex-none items-center justify-between gap-3 border-t border-neutrals-silver bg-white px-6 py-4">
          {mode === 'edit' && onDelete ? (
            <Button variant="link" onClick={onDelete}>
              <span className="text-caution">מחק שאלה</span>
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Button variant="outlined" onClick={onClose}>
              ביטול
            </Button>
            <Button
              variant="primary"
              onClick={onSave}
              disabled={isSaving}
              leadingIcon={<Icon name="Save" size={16} />}
            >
              {isSaving ? 'שומר…' : 'שמירת שאלה'}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  )
}
