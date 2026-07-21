/**
 * מאגר-המבחנים / בונה-המבחנים — /exams (Phase 6.6 / מסמך 13, פרומפט B). יושב
 * בתוך AppShell. מחליף בין תצוגת-רשימה לבונה (design-export: view list/builder).
 * גישה לנתונים דרך useExamList/useExamBuilder בלבד.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Icon, Input, Loader } from '@/components/ui'
import { useExamList, useExamListMutations } from '../hooks/useExamList'
import { useToasts } from '../hooks/useToasts'
import type { Exam } from '@/types/entities'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ExamBuilderView } from '../components/ExamBuilderView'
import { ExamListTable } from '../components/ExamListTable'
import { ToastStack } from '../components/ToastStack'

export function ExamBuilderPage() {
  const navigate = useNavigate()
  const list = useExamList()
  const mutations = useExamListMutations()
  const { toasts, notify } = useToasts()

  const [activeExamId, setActiveExamId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null)

  const openBuilder = async () => {
    const exam = await mutations.createDraft()
    setActiveExamId(exam.id)
  }
  const confirmDelete = async () => {
    if (!deleteTarget) return
    await mutations.deleteExam(deleteTarget.id)
    setDeleteTarget(null)
    notify('success', 'המבחן נמחק')
  }

  if (activeExamId) {
    return (
      <>
        <ExamBuilderView
          examId={activeExamId}
          onBack={() => setActiveExamId(null)}
          notify={notify}
        />
        <ToastStack toasts={toasts} />
      </>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-6 py-6">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outlined"
            onClick={() => navigate('/questions')}
            leadingIcon={<Icon name="Table" size={16} />}
          >
            מאגר השאלות
          </Button>
          <Button
            variant="primary"
            onClick={openBuilder}
            disabled={mutations.isPending}
            leadingIcon={<Icon name="Plus" size={16} />}
          >
            מבחן חדש
          </Button>
        </div>

        <div className="min-w-[220px] flex-1">
          <Input
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder="חיפוש מבחן…"
            leadingIcon={<Icon name="Search" size={16} />}
          />
        </div>

        {list.query.isPending ? (
          <div className="flex justify-center py-16">
            <Loader label="טוען מבחנים…" />
          </div>
        ) : list.query.isError ? (
          <Alert kind="error" title="שגיאה בטעינת המבחנים">
            לא הצלחנו לטעון את רשימת המבחנים. נסו לרענן את הדף.
          </Alert>
        ) : list.exams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutrals-palladium bg-white p-12 text-center text-neutrals-lead">
            {list.search.trim()
              ? 'לא נמצאו מבחנים התואמים את החיפוש.'
              : 'אין עדיין מבחנים — צרו מבחן ראשון.'}
          </div>
        ) : (
          <ExamListTable
            exams={list.exams}
            onOpen={(exam) => setActiveExamId(exam.id)}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="מחיקת מבחן"
        message={`האם למחוק את המבחן "${deleteTarget?.title || 'ללא שם'}"? הפעולה בלתי הפיכה.`}
        isBusy={mutations.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastStack toasts={toasts} />
    </div>
  )
}
