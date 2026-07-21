/**
 * כרטיס נכס בגלריה — תמונה ממוזערת (MediaThumb), פעולות-מהירות במעבר-עכבר
 * (העתק URL / הורד / מחק) וכיתוב (כותרת + גודל · סוג). לחיצה על הכרטיס בוחרת
 * אותו; פעולות המהירות עוצרות את ה-propagation. עוקב אחר design-export (ml-card).
 */
import { IconButton } from '@/components/ui'
import { Icon } from '@/components/ui'
import { TYPE_VISUALS } from '../constants'
import { formatBytes } from '../services/mediaFormat'
import type { MediaAssetView } from '../types'
import { MediaThumb } from './mediaVisuals'

interface MediaCardProps {
  view: MediaAssetView
  selected: boolean
  onSelect: () => void
  onCopyUrl: () => void
  onDownload: () => void
  onDelete: () => void
}

export function MediaCard({
  view,
  selected,
  onSelect,
  onCopyUrl,
  onDownload,
  onDelete,
}: MediaCardProps) {
  const { asset } = view
  const type = asset.file_type ?? 'image'
  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation()
    fn()
  }

  return (
    // כרטיס = div; כפתור-הבחירה הוא שכבת-על שקופה (z-10) והפעולות מעליה (z-20).
    // כך נמנעת קינון של <button> בתוך <button> (HTML לא-תקין).
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border-[1.5px] bg-white text-start shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-neutrals-palladium hover:shadow-menu ${
        selected ? 'border-accent' : 'border-neutrals-silver'
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`פתח את פרטי ${asset.title}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      />

      <div className="relative">
        <MediaThumb type={type} heightClass="h-[140px]" inUse={view.inUse} />

        {/* פעולות מהירות — נחשפות ב-hover, פינה תחתונה-קדמית (ימין ב-RTL) */}
        <div className="absolute bottom-2 end-2 z-20 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <IconButton
            variant="white"
            size="sm"
            aria-label="העתק URL"
            onClick={stop(onCopyUrl)}
            className="shadow-card"
          >
            <Icon name="Link" size={15} />
          </IconButton>
          <IconButton
            variant="white"
            size="sm"
            aria-label="הורד"
            onClick={stop(onDownload)}
            className="shadow-card"
          >
            <Icon name="Export" size={15} />
          </IconButton>
          <IconButton
            variant="white"
            size="sm"
            aria-label="מחק"
            onClick={stop(onDelete)}
            className="text-caution shadow-card"
          >
            <Icon name="Remove" size={15} />
          </IconButton>
        </div>
      </div>

      {/* כיתוב */}
      <div className="p-3">
        <div className="truncate text-small font-semibold text-neutrals-charcoal">
          {asset.title}
        </div>
        {/* גודל/מימדים הם ערכי-LTR — dir="ltr" מונע היפוך דו-כיווני ב-RTL */}
        <div className="mt-1 flex items-center gap-2 text-[11.5px] text-neutrals-nickel">
          <span dir="ltr">{formatBytes(asset.file_size)}</span>
          <span className="h-[3px] w-[3px] rounded-full bg-neutrals-palladium" />
          <span dir="ltr">{asset.dimensions ?? TYPE_VISUALS[type].label}</span>
        </div>
      </div>
    </div>
  )
}
