/**
 * מגירת היסטוריית-הגרסאות (מסמך 19 §4, SRS §1.2): רשימת גרסאות עם מספר, הערת-
 * שינוי, עורך, תאריך ומונה-בלוקים; לכל אחת "צפה" (תצוגת-קריאה) ו-"שחזר". בראש
 * המגירה — שמירת גרסה חדשה (snapshot) עם תיאור. ריק = אין גרסאות עדיין.
 */
import { useState } from 'react'
import { Button, Icon, IconButton, Loader } from '@/components/ui'
import type { LessonVersion } from '@/types/entities'
import { STRINGS } from '../constants'
import { EditorIcon } from '../editorIcons'
import { VersionPreviewOverlay } from './VersionPreviewOverlay'

interface VersionHistoryDrawerProps {
  open: boolean
  versions: LessonVersion[]
  isLoading: boolean
  saving: boolean
  onClose: () => void
  onSaveVersion: (description: string) => void
  onRestore: (version: LessonVersion) => void
}

const dateFmt = new Intl.DateTimeFormat('he-IL', {
  timeZone: 'Asia/Jerusalem',
  dateStyle: 'short',
  timeStyle: 'short',
})

function initials(name: string | null | undefined): string {
  if (!name) return '—'
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
}

export function VersionHistoryDrawer({
  open,
  versions,
  isLoading,
  saving,
  onClose,
  onSaveVersion,
  onRestore,
}: VersionHistoryDrawerProps) {
  const [note, setNote] = useState('')
  const [previewing, setPreviewing] = useState<LessonVersion | null>(null)

  if (!open) return null
  const currentNumber = versions.reduce((m, v) => Math.max(m, v.version_number), 0)

  function save() {
    onSaveVersion(note)
    setNote('')
  }

  return (
    <div className="fixed inset-0 z-[80] flex justify-start">
      <button
        type="button"
        aria-label={STRINGS.close}
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(15,30,50,.34)]"
      />
      <aside
        dir="rtl"
        aria-label={STRINGS.versionsTitle}
        className="relative flex h-full w-[440px] max-w-full flex-col overflow-y-auto bg-white shadow-[0_0_60px_rgba(20,60,110,.3)]"
      >
        <div className="flex flex-none items-center justify-between gap-3 border-b border-neutrals-silver px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-[11px] bg-hues-sky text-accent">
              <Icon name="Clock" size={21} />
            </span>
            <div>
              <h3 className="m-0 text-[18px] font-semibold text-neutrals-charcoal">
                {STRINGS.versionsTitle}
              </h3>
              <p className="m-0 mt-0.5 text-[12.5px] text-neutrals-lead">
                {STRINGS.versionsCount(versions.length)}
              </p>
            </div>
          </div>
          <IconButton variant="ghost" size="md" aria-label={STRINGS.close} onClick={onClose}>
            <Icon name="Close" size={18} />
          </IconButton>
        </div>

        <div className="flex-none border-b border-neutrals-silver px-5 py-4">
          <div className="flex items-center gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={STRINGS.saveVersionNote}
              className="h-10 min-w-0 flex-1 rounded-[11px] border border-neutrals-silver bg-neutrals-whisper px-3.5 text-[13.5px] text-neutrals-charcoal outline-none focus:border-accent"
            />
            <Button
              variant="primary"
              onClick={save}
              disabled={saving}
              leadingIcon={<Icon name="Save" size={16} />}
            >
              {STRINGS.saveVersion}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2.5 px-5 py-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
          ) : versions.length === 0 ? (
            <div className="px-1 py-8 text-center text-[13.5px] text-neutrals-nickel">
              {STRINGS.versionsEmpty}
            </div>
          ) : (
            versions.map((v) => {
              const current = v.version_number === currentNumber
              return (
                <div
                  key={v.id}
                  className="rounded-2xl border border-neutrals-silver bg-white px-4 py-3.5 transition-colors hover:border-hues-indigo"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="flex size-9 flex-none items-center justify-center rounded-[10px] bg-hues-sky text-[13px] font-semibold text-accent">
                      v{v.version_number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14.5px] font-semibold text-neutrals-charcoal">
                          {v.description || STRINGS.saveVersionNote}
                        </span>
                        {current && (
                          <span className="rounded-md bg-hues-mint px-2 py-0.5 text-[10.5px] font-semibold text-success">
                            {STRINGS.versionCurrent}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-neutrals-nickel">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
                            {initials(v.created_by_name)}
                          </span>
                          {v.created_by_name || '—'}
                        </span>
                        <span>·</span>
                        <span>{dateFmt.format(new Date(v.created_date))}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <EditorIcon name="grid" size={12} />
                          {STRINGS.versionBlocks(v.data.blocks.length)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="white" onClick={() => setPreviewing(v)}>
                      {STRINGS.versionView}
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={current}
                      onClick={() => onRestore(v)}
                    >
                      {STRINGS.versionRestore}
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </aside>

      {previewing && (
        <VersionPreviewOverlay
          versionLabel={`v${previewing.version_number} · ${previewing.created_by_name ?? ''}`}
          snapshot={previewing.data}
          onClose={() => setPreviewing(null)}
          onRestore={() => {
            onRestore(previewing)
            setPreviewing(null)
          }}
        />
      )}
    </div>
  )
}
