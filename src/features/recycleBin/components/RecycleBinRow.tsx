/**
 * שורת-פריט בפח-האשפה: אייקון+תגית-סוג, כותרת, מי-מחק+מתי, סיבת-המחיקה,
 * וכפתורי שחזור / מחיקה-לצמיתות (purge — אדמין בלבד).
 */
import { Badge, Button, Icon } from '@/components/ui'
import { formatDeletedAt } from '../services/recycleBinService'
import type { DeletedItem } from '../types'

interface RecycleBinRowProps {
  item: DeletedItem
  canPurge: boolean
  isBusy: boolean
  onRestore: (item: DeletedItem) => void
  onPurge: (item: DeletedItem) => void
}

export function RecycleBinRow({
  item,
  canPurge,
  isBusy,
  onRestore,
  onPurge,
}: RecycleBinRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-3.5 rounded-2xl border border-neutrals-silver bg-white p-4">
      <span className="flex size-[42px] flex-none items-center justify-center rounded-[11px] bg-neutrals-whisper text-neutrals-lead">
        <Icon name={item.icon} size={20} />
      </span>

      <div className="min-w-[200px] flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-semibold text-neutrals-charcoal">
            {item.title}
          </span>
          <Badge color="neutral">{item.typeLabel}</Badge>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-neutrals-nickel">
          <Icon name="Remove" size={13} />
          <span>נמחק ע״י {item.deletedByName ?? 'לא ידוע'}</span>
          {item.deletedAt && (
            <>
              <span>·</span>
              <span>{formatDeletedAt(item.deletedAt)}</span>
            </>
          )}
        </div>
        {item.reason && (
          <div className="mt-1.5 rounded-lg bg-neutrals-whisper px-3 py-1.5 text-[12.5px] text-neutrals-slate">
            <span className="font-semibold">סיבה:</span> {item.reason}
          </div>
        )}
      </div>

      <div className="flex flex-none items-center gap-2">
        <Button
          variant="outlined"
          leadingIcon={<Icon name="ArrowUTurnLeft" size={15} />}
          disabled={isBusy}
          onClick={() => onRestore(item)}
        >
          שחזר
        </Button>
        {canPurge && (
          <Button
            variant="red"
            leadingIcon={<Icon name="Remove" size={15} />}
            disabled={isBusy}
            onClick={() => onPurge(item)}
          >
            מחק לצמיתות
          </Button>
        )}
      </div>
    </div>
  )
}
