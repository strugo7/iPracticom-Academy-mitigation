/**
 * אשף המונח — /concepts/new ו-/concepts/:conceptId/edit (שלב 6.8, מסמך 17
 * פרומפט B). מסך מלא עם סרגל-עליון וסרגל-תחתון משלו, ללא AppShell — לפי
 * design-export/Term Editor.dc.html (כמו עורך-השיעורים).
 * העמוד מרכיב UI בלבד; כל המצב והשמירה ב-useConceptEditor.
 */
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Badge, Button, Icon, IconButton, Loader } from '@/components/ui'
import { STATUS_META, WIZARD_STEP_COUNT } from '../constants'
import { StepBasics } from '../components/steps/StepBasics'
import { StepContent } from '../components/steps/StepContent'
import { StepMedia } from '../components/steps/StepMedia'
import { StepRelations } from '../components/steps/StepRelations'
import { WizardStepper } from '../components/WizardStepper'
import { useConceptEditor } from '../hooks/useConceptEditor'

export function ConceptEditorPage() {
  const { conceptId } = useParams<{ conceptId: string }>()
  const navigate = useNavigate()
  const editor = useConceptEditor(conceptId)

  if (editor.isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-neutrals-whisper">
        <Loader />
      </div>
    )
  }

  if (editor.isError || editor.notFound) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-neutrals-whisper p-6">
        <div className="w-full max-w-md">
          <Alert kind="error" title="המונח לא נמצא">
            <div className="flex items-center gap-3">
              <span>לא הצלחנו לטעון את המונח המבוקש.</span>
              <Button variant="outlined" onClick={() => navigate('/concepts')}>
                חזרה למונחים
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    )
  }

  const status = STATUS_META[editor.draft.status]
  const isLastStep = editor.step === WIZARD_STEP_COUNT

  return (
    <div className="flex min-h-svh flex-col bg-neutrals-whisper">
      <header className="sticky top-0 z-30 flex-none border-b border-neutrals-silver bg-white">
        <div className="flex items-center gap-3 px-6 py-4">
          <IconButton
            variant="outline"
            size="md"
            aria-label="חזרה למונחים"
            onClick={() => navigate('/concepts')}
          >
            <Icon name="ChevronRight" size={20} />
          </IconButton>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-h3 font-semibold text-neutrals-charcoal">
              {editor.isEdit ? 'עריכת מונח' : 'מונח חדש'}
            </h1>
            <p className="mt-0.5 truncate text-small text-neutrals-lead">
              {editor.draft.term || 'מאגר הידע'}
            </p>
          </div>
          <Badge color={status.color}>{status.label}</Badge>
        </div>

        <div className="px-6 pb-5 pt-1">
          <WizardStepper current={editor.step} onPick={editor.goToStep} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-32 pt-6">
        <div className="mx-auto max-w-[720px]">
          {editor.saveError && (
            <div className="mb-4">
              <Alert kind="error" title="שמירה נכשלה">
                {editor.saveError}
              </Alert>
            </div>
          )}

          {editor.step === 1 && (
            <StepBasics
              draft={editor.draft}
              patch={editor.patch}
              errors={editor.errors}
            />
          )}
          {editor.step === 2 && (
            <StepContent
              draft={editor.draft}
              patch={editor.patch}
              errors={editor.errors}
            />
          )}
          {editor.step === 3 && (
            <StepMedia draft={editor.draft} patch={editor.patch} />
          )}
          {editor.step === 4 && (
            <StepRelations
              draft={editor.draft}
              patch={editor.patch}
              lessonOptions={editor.lessonOptions}
              isLoadingLessons={editor.isLoadingLessons}
            />
          )}
        </div>
      </main>

      <footer className="sticky bottom-0 z-30 flex-none border-t border-neutrals-silver bg-white">
        <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3 px-6 py-4">
          <Button
            variant="outlined"
            disabled={editor.step === 1}
            leadingIcon={<Icon name="ChevronRight" size={17} />}
            onClick={() => editor.goToStep(editor.step - 1)}
          >
            הקודם
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="white"
              disabled={editor.isSaving}
              leadingIcon={<Icon name="Save" size={17} />}
              onClick={editor.saveDraft}
            >
              שמור טיוטה
            </Button>

            {isLastStep ? (
              <Button
                variant="primary"
                disabled={editor.isSaving}
                leadingIcon={<Icon name="Check" size={18} />}
                onClick={editor.publish}
              >
                {editor.isSaving ? 'שומר…' : 'פרסם'}
              </Button>
            ) : (
              <Button
                variant="primary"
                trailingIcon={<Icon name="ChevronLeft" size={17} />}
                onClick={() => editor.goToStep(editor.step + 1)}
              >
                המשך
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
