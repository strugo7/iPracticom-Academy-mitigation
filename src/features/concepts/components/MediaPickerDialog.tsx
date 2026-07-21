/**
 * בורר-מדיה (design-export/Term Editor.dc.html שורות 297-321) — DS Dialog עם
 * חיפוש ורשת-תמונות מספריית המדיה האמיתית.
 *
 * מסמך 15 (handoff) הוציא במפורש את ה-Media Picker מסקופ שלב 6.7, ולכן הוא לא
 * קיים ב-feature המדיה ואי-אפשר לייבא ממנו (גבולות feature, §8). הוא ממומש כאן
 * לצורך שלב 3 של האשף; כשיידרש לצרכן שני — לקדם לרכיב משותף.
 */
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Dialog, Icon, Input, Loader } from '@/components/ui'
import { apiClient } from '@/lib/api'
import type { MediaAsset } from '@/types/entities'

/** רק תמונות — לשדה `Concept.image_url` (הבריף: "תמונה למונח"). */
const IMAGE_TYPES: MediaAsset['file_type'][] = ['image', 'gif']

interface MediaPickerDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
  /** ה-url הנוכחי — מסומן כנבחר בפתיחה. */
  selectedUrl: string | null
}

export function MediaPickerDialog({
  open,
  onClose,
  onSelect,
  selectedUrl,
}: MediaPickerDialogProps) {
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState<string | null>(selectedUrl)

  const mediaQuery = useQuery({
    queryKey: ['media-images'],
    queryFn: () => apiClient.mediaAssets.findMany({ sort: '-created_date' }),
    enabled: open,
  })

  const images = useMemo(() => {
    const all = (mediaQuery.data ?? []).filter((asset) =>
      IMAGE_TYPES.includes(asset.file_type),
    )
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter((asset) =>
      [asset.title, ...(asset.tags ?? [])].join(' ').toLowerCase().includes(q),
    )
  }, [mediaQuery.data, query])

  const confirm = () => {
    if (pending) onSelect(pending)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="ספריית מדיה"
      size="lg"
      footer={
        <>
          <Button variant="white" onClick={onClose}>
            ביטול
          </Button>
          <Button variant="primary" onClick={confirm} disabled={!pending}>
            בחר תמונה
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-small text-neutrals-lead">בחרו תמונה למונח.</p>

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש במדיה…"
          leadingIcon={<Icon name="Search" size={16} />}
        />

        {mediaQuery.isPending ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : images.length === 0 ? (
          <p className="rounded-lg bg-neutrals-whisper px-4 py-8 text-center text-[13.5px] text-neutrals-nickel">
            לא נמצאו תמונות בספריית המדיה.
          </p>
        ) : (
          <div className="grid max-h-[360px] grid-cols-2 gap-3.5 overflow-y-auto sm:grid-cols-3">
            {images.map((asset) => {
              const selected = pending === asset.file_url
              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setPending(asset.file_url)}
                  aria-pressed={selected}
                  className={`overflow-hidden rounded-lg border-[1.5px] bg-white text-start transition-colors ${
                    selected
                      ? 'border-accent'
                      : 'border-neutrals-silver hover:border-neutrals-palladium'
                  }`}
                >
                  <span className="relative flex h-[104px] items-center justify-center bg-neutrals-whisper">
                    <img
                      src={asset.thumbnail_url ?? asset.file_url}
                      alt={asset.alt ?? asset.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    {selected && (
                      <span className="absolute top-2 inset-inline-start-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
                        <Icon name="Check" size={14} />
                      </span>
                    )}
                  </span>
                  <span className="block px-3 py-2.5">
                    <span className="block truncate text-small font-semibold text-neutrals-charcoal">
                      {asset.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-neutrals-nickel">
                      {asset.dimensions ?? asset.file_type}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </Dialog>
  )
}
