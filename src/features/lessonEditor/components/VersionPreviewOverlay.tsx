/**
 * תצוגת-קריאה של snapshot גרסה (כפתור "צפה", מסמך 19 §4) — מרנדר את בלוקי
 * הגרסה דרך BlockRenderer, ללא עריכה. משם אפשר לשחזר את הגרסה.
 */
import { BlockRenderer } from '@/features/lessonPlayer'
import { Button, Icon } from '@/components/ui'
import { CANVAS_MAX_WIDTH, STRINGS } from '../constants'
import type { LessonVersionSnapshot } from '../types'

interface VersionPreviewOverlayProps {
  versionLabel: string
  snapshot: LessonVersionSnapshot
  onClose: () => void
  onRestore: () => void
}

export function VersionPreviewOverlay({
  versionLabel,
  snapshot,
  onClose,
  onRestore,
}: VersionPreviewOverlayProps) {
  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-neutrals-whisper" dir="rtl">
      <div className="flex flex-none items-center justify-between gap-3 border-b border-neutrals-silver bg-white px-6 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-[10px] bg-hues-sky text-accent">
            <Icon name="View" size={19} />
          </span>
          <div>
            <div className="text-[15px] font-semibold text-neutrals-charcoal">
              {snapshot.title || STRINGS.settingsTitle}
            </div>
            <div className="text-[12px] text-neutrals-lead">{versionLabel}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            onClick={onRestore}
            leadingIcon={<Icon name="ArrowUTurnLeft" size={16} />}
          >
            {STRINGS.versionRestore}
          </Button>
          <Button variant="white" onClick={onClose}>
            {STRINGS.close}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto px-6 py-8" style={{ maxWidth: CANVAS_MAX_WIDTH }}>
          {snapshot.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      </div>
    </div>
  )
}
