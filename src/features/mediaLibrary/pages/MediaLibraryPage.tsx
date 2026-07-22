/**
 * ספריית המדיה — /media (Phase 6.7 / מסמך 15, פרומפט A). יושבת בתוך AppShell
 * (SideNav+TopBar מהמעטפת). סרגל-פעולות + סינון + גלריה + פאנל-פרטים (aside
 * בדסקטופ, מגירה במובייל) + אישור-מחיקה. הנתונים דרך useMediaLibrary, הפעולות
 * דרך useMediaActions — העמוד מרכיב UI בלבד.
 *
 * מחוץ לסקופ 6.7 (מסמך 15, handoff): Media Picker (פרומפט B), העלאת R2 אמיתית +
 * signed-URL (Phase 12), מעקב-שימוש חי + backfill של URLs קיימים, ובחירה-מרובה.
 */
import { useMemo, useRef, useState } from 'react'
import { Alert, Loader } from '@/components/ui'
import { UPLOAD_ACCEPT_ATTR } from '../constants'
import { countByType } from '../services/mediaSearch'
import { useMediaActions } from '../hooks/useMediaActions'
import { useMediaLibrary } from '../hooks/useMediaLibrary'
import type { MediaAssetView } from '../types'
import { MediaDeleteDialog } from '../components/MediaDeleteDialog'
import { MediaDetailsPanel } from '../components/MediaDetailsPanel'
import { MediaFilters } from '../components/MediaFilters'
import { MediaGrid } from '../components/MediaGrid'
import { MediaToastStack } from '../components/MediaToastStack'
import { UploadButton } from '../components/UploadButton'

export function MediaLibraryPage() {
  const library = useMediaLibrary()
  const actions = useMediaActions()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MediaAssetView | null>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  const typeCounts = useMemo(() => countByType(library.all), [library.all])
  const selected = useMemo(
    () => library.views.find((v) => v.asset.id === selectedId) ?? null,
    [library.views, selectedId],
  )

  const startReplace = (id: string) => {
    actions.beginReplace(id)
    replaceInputRef.current?.click()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const id = deleteTarget.asset.id
    await actions.remove(id)
    if (selectedId === id) setSelectedId(null)
    setDeleteTarget(null)
  }

  if (library.query.isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader label="טוען את ספריית המדיה…" />
      </div>
    )
  }
  if (library.query.isError) {
    return (
      <div className="p-8">
        <Alert kind="error" title="שגיאה בטעינת ספריית המדיה">
          לא הצלחנו לטעון את הנכסים. נסו לרענן את הדף.
        </Alert>
      </div>
    )
  }

  const panelProps = selected && {
    view: selected,
    topics: library.topics,
    onClose: () => setSelectedId(null),
    onCopyUrl: () => actions.copyUrl(selected),
    onDownload: () => actions.download(selected),
    onReplace: () => startReplace(selected.asset.id),
    onDelete: () => setDeleteTarget(selected),
    onSetTags: (tags: string[]) => actions.setTags(selected.asset, tags),
    onSetTopic: (topic: string | null) =>
      actions.setTopic(selected.asset, topic),
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      {/* שדה-קובץ חבוי להחלפת נכס קיים */}
      <input
        ref={replaceInputRef}
        type="file"
        accept={UPLOAD_ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void actions.completeReplace(file)
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 px-6 pt-6">
        <span className="text-small text-neutrals-nickel">
          {library.total} נכסים
        </span>
        <UploadButton
          onFiles={actions.uploadFiles}
          isBusy={actions.isPending}
        />
      </div>

      <div className="flex min-h-0 flex-1">
        {/* גלריה */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="px-6 pt-4">
            <MediaFilters
              filters={library.filters}
              onChange={(patch) =>
                library.setFilters((f) => ({ ...f, ...patch }))
              }
              typeCounts={typeCounts}
              total={library.total}
              topics={library.topics}
              tags={library.tags}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-4">
            <MediaGrid
              views={library.views}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onFiles={actions.uploadFiles}
              onCopyUrl={actions.copyUrl}
              onDownload={actions.download}
              onDelete={setDeleteTarget}
            />
            {library.isFiltering && library.views.length === 0 && (
              <p className="mt-6 text-center text-small text-neutrals-nickel">
                לא נמצאו נכסים התואמים את הסינון.
              </p>
            )}
          </div>
        </div>

        {/* פאנל-פרטים — מופע יחיד: מגירה צפה במובייל, aside בזרימה מ-lg ומעלה */}
        {/* panelProps לוכד handler (startReplace) שניגש ל-input החבוי דרך ref —
            הגישה מתרחשת ב-handler בלבד, לא ב-render. */}
        {/* eslint-disable-next-line react-hooks/refs */}
        {panelProps && (
          <>
            <button
              type="button"
              aria-label="סגור את פאנל הפרטים"
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 z-40 bg-neutrals-charcoal/40 lg:hidden"
            />
            <aside className="fixed inset-y-0 start-0 z-50 w-full max-w-[440px] overflow-y-auto bg-white shadow-menu lg:static lg:z-auto lg:w-[380px] lg:max-w-none lg:shrink-0 lg:border-s lg:border-neutrals-silver lg:shadow-none">
              <MediaDetailsPanel {...panelProps} />
            </aside>
          </>
        )}
      </div>

      <MediaDeleteDialog
        open={deleteTarget !== null}
        title={deleteTarget?.asset.title ?? ''}
        usageCount={deleteTarget?.usageCount ?? 0}
        isBusy={actions.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <MediaToastStack toasts={actions.toasts} />
    </section>
  )
}
