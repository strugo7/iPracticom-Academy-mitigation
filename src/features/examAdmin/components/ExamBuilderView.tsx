/**
 * בונה-מבחן יחיד (design-export/Exam Builder.dc.html — אזור ה-BUILDER): סרגל
 * פעולות (חזרה/תצוגה/שמירה/פרסום), כרטיס-פרטים, רשימת-שאלות נגררת, פאנל-הוספה,
 * תצוגה-מקדימה, ועורך-שאלה מוטמע ל"צור שאלה חדשה" (נכתבת למאגר ומתווספת למבחן).
 */
import { useState } from 'react'
import { Alert, Button, Icon, IconButton, Loader } from '@/components/ui'
import {
  emptyQuestionDraft,
  questionInputFromDraft,
  validateQuestionDraft,
} from '../services/questionForm'
import { useExamBuilder } from '../hooks/useExamBuilder'
import { useQuestionBank } from '../hooks/useQuestionBank'
import { useQuestionMutations } from '../hooks/useQuestionMutations'
import type { ToastKind } from '../hooks/useToasts'
import type { QuestionDraft } from '../types'
import { AddQuestionsPanel } from './AddQuestionsPanel'
import { ExamDetailsCard } from './ExamDetailsCard'
import { ExamPreviewDialog } from './ExamPreviewDialog'
import { ExamQuestionList } from './ExamQuestionList'
import { QuestionEditorDrawer } from './QuestionEditorDrawer'

export function ExamBuilderView({
  examId,
  onBack,
  notify,
}: {
  examId: string
  onBack: () => void
  notify: (kind: ToastKind, message: string) => void
}) {
  const builder = useExamBuilder(examId)
  const bank = useQuestionBank()
  const qMutations = useQuestionMutations()

  const [addOpen, setAddOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [newQuestion, setNewQuestion] = useState<{
    draft: QuestionDraft
    errors: string[]
  } | null>(null)

  const pool = bank.query.data ?? []

  const handleSaveDraft = async () => {
    await builder.saveDraft()
    notify('success', 'הטיוטה נשמרה')
  }
  const handlePublish = async () => {
    const { ok, errors } = await builder.publish()
    if (ok) notify('success', `המבחן "${builder.draft.title}" פורסם בהצלחה`)
    else notify('error', `פרסום נכשל — חסרים: ${errors.join(', ')}`)
  }

  const openCreateQuestion = () =>
    setNewQuestion({ draft: emptyQuestionDraft(builder.draft.category), errors: [] })
  const patchNewQuestion = (p: Partial<QuestionDraft>) =>
    setNewQuestion((s) =>
      s ? { draft: { ...s.draft, ...p }, errors: [] } : s,
    )
  const saveNewQuestion = async () => {
    if (!newQuestion) return
    const found = validateQuestionDraft(newQuestion.draft)
    if (found.length > 0) {
      setNewQuestion({ ...newQuestion, errors: found })
      return
    }
    const created = await qMutations.create(questionInputFromDraft(newQuestion.draft))
    builder.addQuestion(created)
    setNewQuestion(null)
    notify('success', 'השאלה נוספה למאגר ולמבחן')
  }

  if (builder.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader label="טוען את המבחן…" />
      </div>
    )
  }
  if (builder.isError || builder.notFound) {
    return (
      <div className="p-8">
        <Alert kind="error" title="המבחן לא נמצא">
          לא הצלחנו לטעון את המבחן. חזרו לרשימת המבחנים ונסו שוב.
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      {/* action bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-neutrals-silver bg-white/95 px-6 py-3 backdrop-blur">
        <IconButton variant="outline" size="md" aria-label="חזרה לרשימה" onClick={onBack}>
          <Icon name="ChevronRight" size={20} />
        </IconButton>
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            onClick={() => setPreviewOpen(true)}
            leadingIcon={<Icon name="View" size={16} />}
          >
            תצוגה מקדימה
          </Button>
          <Button
            variant="outlined"
            onClick={handleSaveDraft}
            disabled={builder.isSaving}
            leadingIcon={<Icon name="Save" size={16} />}
          >
            שמירת טיוטה
          </Button>
          <Button
            variant="primary"
            onClick={handlePublish}
            disabled={builder.isSaving}
            leadingIcon={<Icon name="SuccessV" size={16} />}
          >
            פרסום מבחן
          </Button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[980px] flex-col gap-4 px-6 py-6">
        <ExamDetailsCard
          draft={builder.draft}
          onChange={builder.patchDraft}
          categories={bank.categories}
        />
        <ExamQuestionList
          rows={builder.rows}
          onReorder={builder.reorder}
          onRemove={builder.removeQuestion}
          onSetPoints={builder.setPoints}
          onOpenAdd={() => setAddOpen(true)}
        />
      </div>

      {addOpen && (
        <AddQuestionsPanel
          pool={pool}
          categories={bank.categories}
          inExam={builder.hasQuestion}
          onAdd={builder.addQuestion}
          onAddMany={builder.addQuestions}
          onCreateNew={openCreateQuestion}
          onClose={() => setAddOpen(false)}
        />
      )}

      {newQuestion && (
        <QuestionEditorDrawer
          mode="create"
          questionId={null}
          usageCount={0}
          draft={newQuestion.draft}
          onChange={patchNewQuestion}
          categories={bank.categories}
          errors={newQuestion.errors}
          isSaving={qMutations.isPending}
          onSave={saveNewQuestion}
          onClose={() => setNewQuestion(null)}
        />
      )}

      <ExamPreviewDialog
        open={previewOpen}
        title={builder.draft.title}
        passingScore={builder.draft.passingScore}
        rows={builder.rows}
        totalPoints={builder.totalPoints}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  )
}
