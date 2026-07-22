/**
 * פח האשפה — /recycle-bin (מנהל ומעלה). מסך מאוחד לפריטים שנמחקו-רכות מכל
 * הישויות: נהלים, שיעורים, מונחים, תסריטי-שיחה. שחזור זמין למנהל; מחיקה-
 * לצמיתות (purge) לאדמין בלבד. יושב ב-AppShell (<section>).
 */
import { useState } from 'react'
import {
  Alert,
  Button,
  Icon,
  Loader,
  Tabs,
  ToastStack,
  ZeroStates,
} from '@/components/ui'
import { isAdmin, useAuth } from '@/lib/auth'
import { useToasts } from '@/lib/hooks/useToasts'
import { PurgeConfirmDialog } from '../components/PurgeConfirmDialog'
import { RecycleBinRow } from '../components/RecycleBinRow'
import { useRecycleBin } from '../hooks/useRecycleBin'
import type { DeletedItem, TrashFilter } from '../types'

export function RecycleBinPage() {
  const { user } = useAuth()
  const bin = useRecycleBin()
  const { toasts, notify } = useToasts()
  const canPurge = Boolean(user && isAdmin(user))
  const [purging, setPurging] = useState<DeletedItem | null>(null)

  const tabs = [
    { id: 'all', label: `הכל (${bin.total})` },
    { id: 'procedure', label: `נהלים (${bin.counts.procedure})` },
    { id: 'lesson', label: `שיעורים (${bin.counts.lesson})` },
    { id: 'concept', label: `מונחים (${bin.counts.concept})` },
    { id: 'flow', label: `תסריטים (${bin.counts.flow})` },
  ]

  const onRestore = (item: DeletedItem) =>
    bin.restore.mutate(item, {
      onSuccess: () => notify('success', `«${item.title}» שוחזר`),
      onError: () => notify('error', 'השחזור נכשל'),
    })

  const confirmPurge = () => {
    if (!purging) return
    const item = purging
    bin.purge.mutate(item, {
      onSuccess: () => {
        notify('success', `«${item.title}» נמחק לצמיתות`)
        setPurging(null)
      },
      onError: () => notify('error', 'המחיקה נכשלה'),
    })
  }

  if (bin.isLoading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </section>
    )
  }

  if (bin.isError) {
    return (
      <section className="p-6">
        <Alert kind="error" title="טעינת פח האשפה נכשלה">
          <div className="flex items-center gap-3">
            <span>לא הצלחנו לטעון את הפריטים שנמחקו.</span>
            <Button variant="outlined" onClick={() => bin.refetch()}>
              נסה שוב
            </Button>
          </div>
        </Alert>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="flex items-center gap-2.5 text-h2 font-semibold text-neutrals-charcoal">
          <Icon name="Remove" size={24} className="text-neutrals-lead" />
          פח האשפה
        </h1>
        <p className="mt-1 text-small text-neutrals-lead">
          פריטים שנמחקו · ניתנים לשחזור · נשמרים לתיעוד ובקרה
        </p>
      </header>

      {bin.total === 0 ? (
        <ZeroStates
          title="פח האשפה ריק"
          description="פריטים שיימחקו יופיעו כאן וניתן יהיה לשחזר אותם."
        />
      ) : (
        <>
          <Tabs
            tabs={tabs}
            value={bin.filter}
            onChange={(id) => bin.setFilter(id as TrashFilter)}
          />

          {bin.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutrals-silver bg-white p-10 text-center text-small text-neutrals-lead">
              אין פריטים מסוג זה בפח.
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-2.5">
              {bin.items.map((item) => (
                <RecycleBinRow
                  key={`${item.entityType}:${item.id}`}
                  item={item}
                  canPurge={canPurge}
                  isBusy={bin.restore.isPending || bin.purge.isPending}
                  onRestore={onRestore}
                  onPurge={setPurging}
                />
              ))}
            </div>
          )}
        </>
      )}

      {purging && (
        <PurgeConfirmDialog
          item={purging}
          isPurging={bin.purge.isPending}
          onCancel={() => setPurging(null)}
          onConfirm={confirmPurge}
        />
      )}

      <ToastStack toasts={toasts} />
    </section>
  )
}
