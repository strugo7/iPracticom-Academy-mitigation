/**
 * רשת כרטיסי ה-Playbook + מצבי-הריק (design-export/Troubleshooting.dc.html):
 * מאגר-ריק (עם CTA-יצירה לבעל-הרשאה) כשאין נתונים כלל, ו"אין תוצאות" כשהסינון
 * התרוקן. הרשת עצמה auto-fill minmax(340px) כמו בעיצוב.
 */
import { Button, Icon } from '@/components/ui'
import type { TroubleshootingFlow } from '@/types/entities'
import { PlaybookCard } from './PlaybookCard'

/** מאגר ריק לגמרי — טקסט 1:1 מהעיצוב; CTA רק לבעל-הרשאה. */
function EmptyRepository({
  canEdit,
  onCreate,
}: {
  canEdit: boolean
  onCreate: () => void
}) {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center rounded-2xl bg-white px-10 py-12 text-center shadow-card">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-hues-sky text-accent">
        <Icon name="File" size={42} />
      </div>
      <h3 className="mb-2 text-h4 font-semibold text-neutrals-charcoal">
        עדיין אין Playbooks
      </h3>
      <p className="mb-6 max-w-[380px] text-small leading-relaxed text-neutrals-lead">
        צרו את ה-Playbook הראשון כדי שכל הצוות יוכל לפתור את התקלה הזו בצורה
        אחידה ומהירה.
      </p>
      {canEdit && (
        <Button
          variant="primary"
          leadingIcon={<Icon name="Plus" size={18} />}
          onClick={onCreate}
        >
          Playbook חדש
        </Button>
      )}
    </div>
  )
}

/** הסינון התרוקן — יש נתונים אך אף כרטיס לא תואם. */
function NoResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-2xl bg-hues-sky text-accent">
        <Icon name="Search" size={42} />
      </div>
      <h3 className="mb-2 text-[20px] font-semibold text-neutrals-charcoal">
        לא נמצאו Playbooks תואמים
      </h3>
      <p className="mb-5 max-w-[360px] text-small leading-relaxed text-neutrals-lead">
        נסו לשנות את מילות החיפוש או לאפס את הסינון כדי לראות את כל הספרייה.
      </p>
      <Button variant="outlined" onClick={onReset}>
        אפס סינון
      </Button>
    </div>
  )
}

export function PlaybooksGrid({
  playbooks,
  total,
  canEdit,
  isFiltering,
  onCreate,
  onResetFilters,
}: {
  playbooks: TroubleshootingFlow[]
  total: number
  canEdit: boolean
  isFiltering: boolean
  onCreate: () => void
  onResetFilters: () => void
}) {
  if (total === 0) {
    return <EmptyRepository canEdit={canEdit} onCreate={onCreate} />
  }
  if (playbooks.length === 0 && isFiltering) {
    return <NoResults onReset={onResetFilters} />
  }
  return (
    <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(340px,1fr))]">
      {playbooks.map((flow) => (
        <PlaybookCard key={flow.id} flow={flow} canEdit={canEdit} />
      ))}
    </div>
  )
}
