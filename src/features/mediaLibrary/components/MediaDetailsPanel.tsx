/**
 * פאנל פרטי-הנכס (design-export/MediaDetails.dc.html) — תצוגה מקדימה, מטא-נתונים,
 * עריכת נושא ותגיות, רשימת "היכן בשימוש", ופעולות (העתק URL / הורד / החלף / מחק).
 * משמש גם ב-aside של הדסקטופ וגם במגירת המובייל. UI בלבד — הפעולות מגיעות מהדף.
 */
import { useState } from 'react'
import { Button, Icon, IconButton, Tag } from '@/components/ui'
import { dimensionLabel, TYPE_VISUALS } from '../constants'
import {
  fileNameFor,
  formatBytes,
  formatUploadDate,
} from '../services/mediaFormat'
import type { MediaAssetView } from '../types'
import { FilterMenu } from './FilterMenu'
import { MediaThumb, usageVisual } from './mediaVisuals'

interface MediaDetailsPanelProps {
  view: MediaAssetView
  topics: string[]
  onClose: () => void
  onCopyUrl: () => void
  onDownload: () => void
  onReplace: () => void
  onDelete: () => void
  onSetTags: (tags: string[]) => void
  onSetTopic: (topic: string | null) => void
}

export function MediaDetailsPanel({
  view,
  topics,
  onClose,
  onCopyUrl,
  onDownload,
  onReplace,
  onDelete,
  onSetTags,
  onSetTopic,
}: MediaDetailsPanelProps) {
  const { asset } = view
  const type = asset.file_type ?? 'image'
  const tags = asset.tags ?? []
  const usage = asset.usage ?? []
  const [newTag, setNewTag] = useState('')

  const addTag = () => {
    const t = newTag.trim()
    if (t && !tags.includes(t)) onSetTags([...tags, t])
    setNewTag('')
  }
  const removeTag = (t: string) => onSetTags(tags.filter((x) => x !== t))

  // ltr: ערכים לטיניים/מספריים (שם-קובץ, גודל, מימדים) — מונע היפוך דו-כיווני ב-RTL
  const metaRows: { label: string; value: string; ltr?: boolean }[] = [
    { label: 'שם הקובץ', value: fileNameFor(asset), ltr: true },
    { label: 'סוג', value: TYPE_VISUALS[type].label },
    { label: 'גודל', value: formatBytes(asset.file_size), ltr: true },
    { label: dimensionLabel(type), value: asset.dimensions ?? '—', ltr: true },
    { label: 'תאריך העלאה', value: formatUploadDate(asset.created_date) },
    { label: 'מעלה', value: view.uploaderName ?? 'מערכת' },
  ]

  return (
    <div className="flex min-h-full flex-col font-sans text-neutrals-charcoal">
      {/* כותרת */}
      <div className="flex items-center justify-between gap-2 border-b border-neutrals-silver px-5 pb-3 pt-4">
        <h2 className="text-base font-semibold">פרטי הנכס</h2>
        <IconButton variant="outline" size="sm" aria-label="סגור" onClick={onClose}>
          <Icon name="Close" size={17} />
        </IconButton>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-4">
        {/* תצוגה מקדימה */}
        <div className="overflow-hidden rounded-2xl border border-neutrals-silver">
          <MediaThumb type={type} heightClass="h-[200px]" iconSize={88} />
        </div>

        {/* כותרת הנכס */}
        <div className="text-lg font-semibold leading-tight">{asset.title}</div>

        {/* פעולות מהירות */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="primary" onClick={onCopyUrl} leadingIcon={<Icon name="Link" size={16} />}>
            העתק URL
          </Button>
          <Button variant="outlined" onClick={onDownload} leadingIcon={<Icon name="Export" size={16} />}>
            הורד
          </Button>
        </div>

        {/* מטא-נתונים */}
        <div className="rounded-lg border border-neutrals-silver bg-neutrals-whisper px-4">
          {metaRows.map((m, i) => (
            <div
              key={m.label}
              className={`flex items-center justify-between gap-3 py-2 ${
                i < metaRows.length - 1 ? 'border-b border-neutrals-silver' : ''
              }`}
            >
              <span className="shrink-0 text-[12.5px] text-neutrals-nickel">{m.label}</span>
              <span
                dir={m.ltr ? 'ltr' : undefined}
                className="truncate text-small font-semibold text-neutrals-charcoal"
              >
                {m.value}
              </span>
            </div>
          ))}
        </div>

        {/* נושא */}
        <div>
          <span className="mb-2 block text-tiny-bold text-neutrals-lead">נושא</span>
          <FilterMenu
            block
            icon="Table"
            label="בחר נושא"
            activeLabel={asset.topic}
            options={topics.map((t) => ({ value: t, label: t }))}
            selected={asset.topic ?? null}
            onSelect={onSetTopic}
            clearLabel="ללא נושא"
          />
        </div>

        {/* תגיות */}
        <div>
          <span className="mb-2 block text-tiny-bold text-neutrals-lead">תגיות</span>
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutrals-silver bg-white p-2">
            {tags.map((t) => (
              <Tag key={t} type="blue" onRemove={() => removeTag(t)}>
                {t}
              </Tag>
            ))}
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
              onBlur={addTag}
              placeholder="+ הוסף"
              aria-label="הוסף תגית"
              className="min-w-16 flex-1 bg-transparent p-1 text-small text-neutrals-charcoal outline-none placeholder:text-neutrals-nickel"
            />
          </div>
        </div>

        {/* היכן בשימוש */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-tiny-bold text-neutrals-lead">היכן בשימוש</span>
            <span
              className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
                usage.length > 0
                  ? 'bg-hues-mint text-success'
                  : 'bg-neutrals-whisper text-neutrals-nickel'
              }`}
            >
              {usage.length > 0 ? `${usage.length} מקומות` : 'לא בשימוש'}
            </span>
          </div>
          {usage.length > 0 ? (
            <div className="flex flex-col gap-2">
              {usage.map((u, i) => {
                const v = usageVisual(u.ref_type)
                return (
                  <div
                    key={`${u.ref_type}-${i}`}
                    className="flex items-center gap-2 rounded-md border border-neutrals-silver bg-white px-3 py-2 transition-colors hover:border-neutrals-palladium hover:bg-neutrals-whisper"
                  >
                    <span className={`flex h-7 w-7 items-center justify-center rounded-md ${v.iconBg} ${v.iconFg}`}>
                      <Icon name={v.icon} size={16} />
                    </span>
                    <span className="flex-1 text-small text-neutrals-lead">{u.label}</span>
                    <Icon name="ChevronLeft" size={15} className="text-neutrals-palladium" />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-dashed border-neutrals-palladium bg-neutrals-whisper px-4 py-3 text-small text-neutrals-nickel">
              <Icon name="QuestionFill" size={16} />
              הנכס אינו בשימוש כרגע
            </div>
          )}
        </div>
      </div>

      {/* פעולות תחתונות */}
      <div className="sticky bottom-0 flex gap-2 border-t border-neutrals-silver bg-white px-5 py-4">
        <Button
          variant="outlined"
          onClick={onReplace}
          leadingIcon={<Icon name="Upload" size={16} />}
          className="flex-1"
        >
          החלף
        </Button>
        <Button
          variant="outlined"
          onClick={onDelete}
          leadingIcon={<Icon name="Remove" size={16} />}
          className="flex-1 border-caution text-caution"
        >
          מחק
        </Button>
      </div>
    </div>
  )
}
