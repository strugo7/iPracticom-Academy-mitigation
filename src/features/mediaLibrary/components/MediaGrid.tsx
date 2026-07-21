/**
 * גלריית הנכסים — כרטיס-העלאה (drag-drop + דפדוף) כאיבר ראשון ברשת, ואחריו
 * כרטיסי הנכסים. הרשת: 2 עמודות במובייל, auto-fill בדסקטופ (design: gridCols).
 * כרטיס-ההעלאה מחזיק את שדה-הקובץ החבוי ומדווח קבצים דרך onFiles.
 */
import { useRef, useState } from 'react'
import { Icon } from '@/components/ui'
import { UPLOAD_ACCEPT_ATTR } from '../constants'
import type { MediaAssetView } from '../types'
import { MediaCard } from './MediaCard'

interface MediaGridProps {
  views: MediaAssetView[]
  selectedId: string | null
  onSelect: (id: string) => void
  onFiles: (files: File[]) => void
  onCopyUrl: (view: MediaAssetView) => void
  onDownload: (view: MediaAssetView) => void
  onDelete: (view: MediaAssetView) => void
}

export function MediaGrid({
  views,
  selectedId,
  onSelect,
  onFiles,
  onCopyUrl,
  onDownload,
  onDelete,
}: MediaGridProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const emitFiles = (list: FileList | null) => {
    const files = list ? Array.from(list) : []
    if (files.length) onFiles(files)
  }

  return (
    <div className="grid grid-cols-2 gap-4 min-[640px]:[grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]">
      {/* כרטיס-העלאה */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          emitFiles(e.dataTransfer.files)
        }}
        className={`flex min-h-[188px] flex-col items-center justify-center gap-4 rounded-2xl p-6 text-center transition-colors ${
          dragging ? 'bg-neutrals-silver' : 'bg-neutrals-whisper hover:bg-neutrals-silver'
        }`}
      >
        <Icon name="Attachment" size={40} className="text-neutrals-palladium" />
        <div>
          <div className="font-semibold text-neutrals-charcoal">העלאת קבצים</div>
          <div className="mt-2 text-small text-neutrals-nickel">
            תמונות · GIF · וידאו · PDF — עד 50MB לקובץ
          </div>
        </div>
      </button>

      {/* שדה-הקובץ יושב מחוץ לכפתור (display:none — אינו תופס תא ברשת) */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={UPLOAD_ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          emitFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {views.map((view) => (
        <MediaCard
          key={view.asset.id}
          view={view}
          selected={view.asset.id === selectedId}
          onSelect={() => onSelect(view.asset.id)}
          onCopyUrl={() => onCopyUrl(view)}
          onDownload={() => onDownload(view)}
          onDelete={() => onDelete(view)}
        />
      ))}
    </div>
  )
}
