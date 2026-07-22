/**
 * עורך יצירת/עריכת נוהל — /policies/new ו-/policies/:procedureId/edit (design-
 * export/Policy Editor.dc.html). מסך-מלא (canManageContent): סרגל-עליון,
 * ובמצב-כתוב שלושה פאנלים (פלטה · קנבס · הגדרות); במצב-קובץ אזור-העלאה + הגדרות.
 * כל המצב/השמירה ב-usePolicyEditor; הוולידציה ב-policyEditorService.
 */
import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Alert, Button, Loader, ToastStack } from '@/components/ui'
import { useToasts } from '@/lib/hooks/useToasts'
import { usePolicyEditor } from '../hooks/usePolicyEditor'
import { computeReach, validateDraft } from '../services/policyEditorService'
import { PolicyBlockCanvas } from '../components/editor/PolicyBlockCanvas'
import { PolicyBlockPalette } from '../components/editor/PolicyBlockPalette'
import { PolicyEditorTopBar } from '../components/editor/PolicyEditorTopBar'
import { PolicySettingsPanel } from '../components/editor/PolicySettingsPanel'
import { PolicyTemplateGallery } from '../components/editor/PolicyTemplateGallery'
import { PolicyUploadDropzone } from '../components/editor/PolicyUploadDropzone'

export function PolicyEditorPage() {
  const { procedureId } = useParams<{ procedureId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toasts, notify } = useToasts()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  // בורר-תבניות מוצג רק ליצירת נוהל חדש (במצב-כתוב), עד לבחירת תבנית/ריק.
  const isUploadMode = searchParams.get('mode') === 'upload'
  const [templatePicked, setTemplatePicked] = useState(false)

  const editor = usePolicyEditor({
    procedureId,
    initialUpload: isUploadMode,
    onSaved: () => {
      notify('success', 'הנוהל נשמר')
      navigate('/policies')
    },
  })

  const reach = useMemo(
    () => (editor.draft ? computeReach(editor.draft, editor.users) : 0),
    [editor.draft, editor.users],
  )

  if (editor.isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-neutrals-whisper">
        <Loader />
      </div>
    )
  }

  if (editor.isError || editor.notFound || !editor.draft) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-neutrals-whisper p-6">
        <div className="w-full max-w-md">
          <Alert kind="error" title="הנוהל לא נמצא">
            <div className="flex items-center gap-3">
              <span>לא הצלחנו לטעון את הנוהל לעריכה.</span>
              <Button variant="outlined" onClick={() => navigate('/policies')}>
                חזרה לנהלים
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    )
  }

  // נוהל חדש במצב-כתוב → בורר-תבניות לפני העורך.
  if (!editor.isEdit && !isUploadMode && !templatePicked) {
    return (
      <PolicyTemplateGallery
        onPick={(template) => {
          editor.applyTemplate(template)
          setTemplatePicked(true)
        }}
        onBack={() => navigate('/policies')}
      />
    )
  }

  const draft = editor.draft
  const isWrite = draft.contentType === 'html'

  const handleSave = (publish: boolean) => {
    if (publish) {
      const errors = validateDraft(draft)
      if (errors.length > 0) {
        notify('error', errors[0] as string)
        return
      }
    } else if (!draft.title.trim()) {
      notify('error', 'חובה להזין כותרת לנוהל.')
      return
    }
    editor.save.mutate({ publish })
  }

  return (
    <div className="flex h-svh flex-col bg-neutrals-whisper">
      <PolicyEditorTopBar
        draft={draft}
        isSaving={editor.save.isPending}
        onBack={() => navigate('/policies')}
        onTitleChange={(title) => editor.patch({ title })}
        onModeChange={(contentType) => editor.patch({ contentType })}
        onSaveDraft={() => handleSave(false)}
        onPublish={() => handleSave(true)}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {isWrite && (
          <div className="hidden flex-none overflow-y-auto p-4 lg:block">
            <PolicyBlockPalette
              onAdd={(type) => editor.addBlock(type, selectedId ?? undefined)}
            />
          </div>
        )}

        <div className="min-w-0 flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-[760px]">
            {isWrite ? (
              <PolicyBlockCanvas
                blocks={draft.blocks}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onReorder={editor.setBlocks}
                onDuplicate={editor.duplicateBlock}
                onDelete={editor.removeBlock}
                onUpdateData={editor.updateBlockData}
                onAddParagraph={() =>
                  editor.addBlock('text', selectedId ?? undefined)
                }
              />
            ) : (
              <PolicyUploadDropzone
                fileUrl={draft.fileUrl}
                fileName={fileName}
                onFile={(file) => {
                  setFileName(file.name)
                  editor.patch({ fileUrl: URL.createObjectURL(file) })
                }}
                onClear={() => {
                  setFileName(null)
                  editor.patch({ fileUrl: null })
                }}
              />
            )}
          </div>
        </div>

        <PolicySettingsPanel
          draft={draft}
          departments={editor.departments}
          users={editor.users}
          reach={reach}
          onPatch={editor.patch}
        />
      </div>

      <ToastStack toasts={toasts} />
    </div>
  )
}
