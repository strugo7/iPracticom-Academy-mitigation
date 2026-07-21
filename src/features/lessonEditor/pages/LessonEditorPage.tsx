/**
 * מעטפת עורך-השיעורים (שלב 6.2, מסמך 19) — מסך מלא (מחוץ ל-AppShell, כמו נגן
 * המבחן): סרגל-עליון, פלטת-בלוקים (ימין), קנבס WYSIWYG (מרכז), Inspector+Outline
 * (שמאל), מגירת-גרסאות ומודאל-הגדרות. עריכת *תוכן* פר-בלוק והעוזר AI/תבניות
 * הם שלבי 6.3-6.5 — כאן היסוד: פרדיגמת-הבלוקים, סידור, נראות, עיצוב, גרסאות.
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '@/lib/api'
import { Button, Loader } from '@/components/ui'
import { STRINGS } from '../constants'
import { useLessonEditor } from '../hooks/useLessonEditor'
import { useLessonVersions } from '../hooks/useLessonVersions'
import { useAiAssist } from '../hooks/useAiAssist'
import { buildSnapshot } from '../services/lessonEditorService'
import { buildTemplateBlocks, type TemplateKey } from '../services/aiAssistService'
import type { LessonSettingsDraft } from '../types'
import { BlockCanvas } from '../components/BlockCanvas'
import { BlockPalette } from '../components/BlockPalette'
import { EditorTopBar } from '../components/EditorTopBar'
import { InspectorOutlineAside } from '../components/InspectorOutlineAside'
import { LessonSettingsModal } from '../components/LessonSettingsModal'
import { VersionHistoryDrawer } from '../components/VersionHistoryDrawer'
import { AiAssistPanel } from '../components/AiAssistPanel'
import { LessonTemplateGallery } from '../components/LessonTemplateGallery'

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-svh items-center justify-center bg-neutrals-whisper p-6">
      {children}
    </div>
  )
}

export function LessonEditorPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const editor = useLessonEditor(lessonId)
  const versions = useLessonVersions(lessonId)

  const [paletteOpen, setPaletteOpen] = useState(true)
  const [versionsOpen, setVersionsOpen] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [settingsDraft, setSettingsDraft] = useState<LessonSettingsDraft | null>(
    null,
  )
  const ai = useAiAssist(editor.appendBlocks)

  const openTemplates = () => {
    ai.closePanel()
    setTemplatesOpen(true)
  }
  const useTemplate = (key: TemplateKey) => {
    editor.appendBlocks(buildTemplateBlocks(key))
    setTemplatesOpen(false)
  }

  const goBack = () => navigate('/content')

  if (editor.query.isLoading) {
    return (
      <FullScreen>
        <Loader />
      </FullScreen>
    )
  }

  if (editor.query.isError) {
    const err = editor.query.error
    const notSupported =
      err instanceof ApiError && err.code === 'validation' && err.message === 'not_v2'
    return (
      <FullScreen>
        <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-neutrals-silver bg-white px-10 py-12 text-center">
          <h1 className="m-0 text-[19px] font-semibold text-neutrals-charcoal">
            {notSupported ? STRINGS.notV2Title : STRINGS.loadError}
          </h1>
          <p className="m-0 text-[14px] leading-relaxed text-neutrals-lead">
            {notSupported ? STRINGS.notV2Body : STRINGS.loadErrorBody}
          </p>
          <Button variant="outlined" onClick={goBack}>
            {STRINGS.backToContent}
          </Button>
        </div>
      </FullScreen>
    )
  }

  const { settings } = editor
  if (!settings) {
    return (
      <FullScreen>
        <Loader />
      </FullScreen>
    )
  }

  // arrow-consts (לא function-declarations) כדי לשמר את narrowing של settings
  const openSettings = () => setSettingsDraft(settings)
  const saveSettings = () => {
    if (settingsDraft) editor.updateSettings(settingsDraft)
    editor.persistNow()
    setSettingsDraft(null)
  }
  const saveVersion = (description: string) => {
    versions.createVersion.mutate({
      description,
      snapshot: buildSnapshot(settings, editor.blocks),
    })
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-neutrals-whisper" dir="rtl">
      <EditorTopBar
        title={settings.title}
        breadcrumb={editor.breadcrumb}
        status={settings.status}
        autosave={editor.autosave}
        viewMode={editor.viewMode}
        onTitleChange={(title) => editor.updateSettings({ title })}
        onViewModeChange={editor.setViewMode}
        onBack={goBack}
        onOpenAi={ai.openPanel}
        onOpenSettings={openSettings}
        onOpenVersions={() => setVersionsOpen(true)}
        onPublish={editor.publish}
      />

      <div className="flex min-h-0 flex-1 flex-row">
        {editor.viewMode === 'edit' && (
          <BlockPalette
            open={paletteOpen}
            onToggle={() => setPaletteOpen((v) => !v)}
            onAdd={(type) => editor.addBlock(type, editor.blocks.length)}
          />
        )}

        <BlockCanvas
          blocks={editor.blocks}
          viewMode={editor.viewMode}
          selectedId={editor.selectedId}
          onSelect={editor.selectBlock}
          onAdd={editor.addBlock}
          onDuplicate={editor.duplicateBlock}
          onDelete={editor.deleteBlock}
          onReorder={editor.reorderBlocks}
          onUpdateData={editor.updateBlockData}
          onToggleVisibility={(id) => {
            const block = editor.blocks.find((b) => b.id === id)
            editor.toggleBlockVisibility(id, !block?.visibility?.hidden)
          }}
        />

        {editor.viewMode === 'edit' && (
          <InspectorOutlineAside
            selectedBlock={editor.selectedBlock}
            blocks={editor.blocks}
            selectedId={editor.selectedId}
            onSelect={editor.selectBlock}
            onStyle={(patch) => {
              if (editor.selectedId) editor.styleBlock(editor.selectedId, patch)
            }}
            onToggleVisibility={(hidden) => {
              if (editor.selectedId)
                editor.toggleBlockVisibility(editor.selectedId, hidden)
            }}
          />
        )}
      </div>

      <VersionHistoryDrawer
        open={versionsOpen}
        versions={versions.versions}
        isLoading={versions.query.isLoading}
        saving={versions.createVersion.isPending}
        onClose={() => setVersionsOpen(false)}
        onSaveVersion={saveVersion}
        onRestore={(version) => {
          editor.applySnapshot(version.data)
          setVersionsOpen(false)
        }}
      />

      <LessonSettingsModal
        open={settingsDraft !== null}
        draft={settingsDraft ?? settings}
        linkedExamTitle={editor.linkedExamTitle}
        onClose={() => setSettingsDraft(null)}
        onChange={(patch) =>
          setSettingsDraft((prev) => (prev ? { ...prev, ...patch } : prev))
        }
        onSave={saveSettings}
      />

      <AiAssistPanel ai={ai} onOpenTemplates={openTemplates} />

      <LessonTemplateGallery
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onUseTemplate={useTemplate}
      />
    </div>
  )
}
