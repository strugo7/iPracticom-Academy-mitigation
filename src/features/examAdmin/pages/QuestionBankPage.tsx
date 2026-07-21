/**
 * מאגר-השאלות — /questions (Phase 6.6 / מסמך 13, פרומפט A). יושב בתוך AppShell
 * (SideNav+TopBar מהמעטפת). סרגל-פעולות + סינון + טבלה + מגירת-עורך + אישור-מחיקה.
 * כל גישה לנתונים דרך useQuestionBank/useQuestionMutations (react-query בלבד).
 * ייבוא/ייצוא CSV ממומשים בצד-הלקוח מול apiClient (יחליפו את importQuestionsCSV/
 * exportQuestionsCsv השרתיים ב-Phase 12). יצירת-AI (quizMasterAgent) תלויה ב-n8n
 * ואינה נכללת בשלב זה.
 */
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Dialog, Icon, Loader } from '@/components/ui'
import { COMPANY_WIDE_CATEGORY } from '../constants'
import { parseCsv, toCsv } from '../services/csv'
import { downloadCsv } from '../services/csvFile'
import {
  type CsvRowError,
  csvRowsToQuestionInputs,
  questionsToCsvRows,
} from '../services/questionCsv'
import {
  draftFromQuestion,
  emptyQuestionDraft,
  questionInputFromDraft,
  validateQuestionDraft,
} from '../services/questionForm'
import { useQuestionBank } from '../hooks/useQuestionBank'
import { useQuestionMutations } from '../hooks/useQuestionMutations'
import { useToasts } from '../hooks/useToasts'
import type { Question } from '@/types/entities'
import type { QuestionDraft } from '../types'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { QuestionBankTable } from '../components/QuestionBankTable'
import { QuestionBankToolbar } from '../components/QuestionBankToolbar'
import { QuestionEditorDrawer } from '../components/QuestionEditorDrawer'
import { ToastStack } from '../components/ToastStack'

type Editing = { mode: 'create' | 'edit'; question: Question | null }

export function QuestionBankPage() {
  const navigate = useNavigate()
  const bank = useQuestionBank()
  const mutations = useQuestionMutations()
  const { toasts, notify } = useToasts()

  const [editing, setEditing] = useState<Editing | null>(null)
  const [draft, setDraft] = useState<QuestionDraft>(emptyQuestionDraft())
  const [errors, setErrors] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null)
  const [importErrors, setImportErrors] = useState<CsvRowError[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultCategory = bank.categories[0] ?? COMPANY_WIDE_CATEGORY

  const handleExport = () => {
    const csv = toCsv(questionsToCsvRows(bank.filtered))
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(`questions_${stamp}.csv`, csv)
    notify('success', `יוצאו ${bank.filtered.length} שאלות לקובץ CSV`)
  }

  const handleImportFile = async (file: File) => {
    const text = await file.text()
    const { inputs, errors: rowErrors } = csvRowsToQuestionInputs(parseCsv(text))
    if (inputs.length > 0) await mutations.importMany(inputs)
    if (rowErrors.length > 0) {
      setImportErrors(rowErrors)
      notify('error', `יובאו ${inputs.length} · דולגו ${rowErrors.length} שורות`)
    } else {
      notify('success', `יובאו ${inputs.length} שאלות בהצלחה`)
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // מאפשר בחירת אותו קובץ שוב
    if (file) void handleImportFile(file)
  }

  const openCreate = () => {
    setDraft(emptyQuestionDraft(defaultCategory))
    setErrors([])
    setEditing({ mode: 'create', question: null })
  }
  const openEdit = (q: Question) => {
    setDraft(draftFromQuestion(q))
    setErrors([])
    setEditing({ mode: 'edit', question: q })
  }
  const closeEditor = () => setEditing(null)

  const patch = (p: Partial<QuestionDraft>) => {
    setDraft((d) => ({ ...d, ...p }))
    if (errors.length) setErrors([])
  }

  const handleSave = async () => {
    const found = validateQuestionDraft(draft)
    if (found.length > 0) {
      setErrors(found)
      return
    }
    const input = questionInputFromDraft(draft)
    if (editing?.mode === 'edit' && editing.question) {
      await mutations.update(editing.question.id, input)
    } else {
      await mutations.create(input)
    }
    closeEditor()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    await mutations.remove(id)
    setDeleteTarget(null)
    if (editing?.question?.id === id) closeEditor()
  }

  const editingUsage = useMemo(
    () => editing?.question?.usage_count ?? 0,
    [editing],
  )

  if (bank.query.isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader label="טוען את מאגר השאלות…" />
      </div>
    )
  }
  if (bank.query.isError) {
    return (
      <div className="p-8">
        <Alert kind="error" title="שגיאה בטעינת מאגר השאלות">
          לא הצלחנו לטעון את מאגר השאלות. נסו לרענן את הדף.
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-4 px-6 py-6">
        {/* actions bar */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={onFileChange}
          />
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            disabled={mutations.isPending}
            leadingIcon={<Icon name="Upload" size={16} />}
          >
            ייבוא CSV
          </Button>
          <Button
            variant="outlined"
            onClick={handleExport}
            disabled={bank.filtered.length === 0}
            leadingIcon={<Icon name="Export" size={16} />}
          >
            ייצוא CSV
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/exams')}
            leadingIcon={<Icon name="Check" size={16} />}
          >
            מבחן חדש
          </Button>
          <Button
            variant="primary"
            onClick={openCreate}
            leadingIcon={<Icon name="Plus" size={16} />}
          >
            שאלה חדשה
          </Button>
        </div>

        <QuestionBankToolbar
          filters={bank.filters}
          onChange={(p) => bank.setFilters((f) => ({ ...f, ...p }))}
          categories={bank.categories}
          count={bank.filtered.length}
          isFiltering={bank.isFiltering}
        />

        {bank.filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutrals-palladium bg-white p-12 text-center text-neutrals-lead">
            {bank.isFiltering
              ? 'לא נמצאו שאלות התואמות את הסינון.'
              : 'המאגר ריק — צרו שאלה ראשונה.'}
          </div>
        ) : (
          <QuestionBankTable
            questions={bank.filtered}
            actions={{
              onEdit: openEdit,
              onDuplicate: (q) => mutations.duplicate(q),
              onDelete: setDeleteTarget,
            }}
          />
        )}
      </div>

      {editing && (
        <QuestionEditorDrawer
          mode={editing.mode}
          questionId={editing.question?.id ?? null}
          usageCount={editingUsage}
          draft={draft}
          onChange={patch}
          categories={bank.categories}
          errors={errors}
          isSaving={mutations.isPending}
          onSave={handleSave}
          onDelete={
            editing.mode === 'edit' && editing.question
              ? () => setDeleteTarget(editing.question)
              : undefined
          }
          onClose={closeEditor}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="מחיקת שאלה"
        message={
          (deleteTarget?.usage_count ?? 0) > 0
            ? `השאלה מופיעה ב-${deleteTarget?.usage_count} מבחנים. מחיקה תסיר אותה מכולם. להמשיך?`
            : 'האם למחוק את השאלה לצמיתות?'
        }
        isBusy={mutations.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Dialog
        open={importErrors !== null}
        onClose={() => setImportErrors(null)}
        title="דוח ייבוא CSV"
        size="md"
        footer={
          <Button variant="primary" onClick={() => setImportErrors(null)}>
            הבנתי
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-small text-neutrals-lead">
            השורות הבאות דולגו בגלל שדות חסרים או לא-תקינים:
          </p>
          <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
            {(importErrors ?? []).map((err) => (
              <li
                key={err.line}
                className="rounded-lg bg-neutrals-whisper p-2 text-small text-neutrals-charcoal"
              >
                <span className="font-semibold">שורה {err.line}:</span>{' '}
                {err.messages.join(' · ')}
              </li>
            ))}
          </ul>
        </div>
      </Dialog>

      <ToastStack toasts={toasts} />
    </div>
  )
}
