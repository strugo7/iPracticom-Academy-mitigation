/**
 * מצב "העלה קובץ" (design-export/Policy Editor.dc.html) — אזור גרירת-קובץ
 * (PDF/DOCX) עם קלט מוסתר, וכרטיס-קובץ לאחר בחירה. פער DS מתועד (CLAUDE.md
 * §6.1 — אין רכיב FileUpload); נבנה מ-design-export + דפוס input מוסתר.
 * ⚠️ ההעלאה בפועל ל-R2 היא Phase 12; כאן נשמר שם-הקובץ + object-URL זמני.
 */
import { useRef, useState } from 'react'
import { Button, Icon, Tag } from '@/components/ui'

const ACCEPT = '.pdf,.doc,.docx,application/pdf'
const MAX_MB = 20

interface PolicyUploadDropzoneProps {
  fileUrl: string | null
  fileName: string | null
  onFile: (file: File) => void
  onClear: () => void
}

export function PolicyUploadDropzone({
  fileUrl,
  fileName,
  onFile,
  onClear,
}: PolicyUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const accept = (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`הקובץ גדול מ-${MAX_MB}MB.`)
      return
    }
    setError(null)
    onFile(file)
  }

  if (fileUrl) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] items-center gap-3.5 rounded-2xl border border-neutrals-silver bg-white p-4">
        <span className="flex h-[54px] w-[46px] flex-none items-center justify-center rounded-[9px] bg-[#FBE9EA] text-hues-red">
          <Icon name="File" size={23} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-neutrals-charcoal">
            {fileName ?? 'מסמך הנוהל'}
          </div>
          <div className="mt-0.5 text-small text-hues-teal">הועלה בהצלחה</div>
        </div>
        <Button
          variant="outlined"
          leadingIcon={<Icon name="ArrowUTurnLeft" size={15} />}
          onClick={() => inputRef.current?.click()}
        >
          החלף
        </Button>
        <button
          type="button"
          aria-label="הסר קובץ"
          className="text-neutrals-nickel hover:text-hues-red"
          onClick={onClear}
        >
          <Icon name="Remove" size={18} />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => accept(e.target.files?.[0])}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[720px]">
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
          accept(e.dataTransfer.files?.[0])
        }}
        className={`flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
          dragging
            ? 'border-accent bg-hues-sky/40'
            : 'border-neutrals-silver bg-white hover:border-accent'
        }`}
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-hues-sky text-accent">
          <Icon name="Upload" size={26} />
        </span>
        <div className="text-body font-semibold text-neutrals-charcoal">
          גרור/י קובץ לכאן או לחצ/י לבחירה
        </div>
        <div className="text-small text-neutrals-lead">
          PDF או Word (DOCX) · עד {MAX_MB}MB
        </div>
        <div className="flex items-center gap-2">
          <Tag type="red">PDF</Tag>
          <Tag type="blue">DOCX</Tag>
        </div>
      </button>
      {error && (
        <p className="mt-2 text-center text-small text-hues-red">{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => accept(e.target.files?.[0])}
      />
    </div>
  )
}
