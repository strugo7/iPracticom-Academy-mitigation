/**
 * מצב ריק של מפעל התוכן (ContentManager, doc 12) — כשאין מסלולים כלל.
 * 1:1 עם design-export/ContentManager.dc.html (isEmpty).
 */
import { Button, Icon } from '@/components/ui'

export function ContentTreeEmptyState({
  onCreateTrack,
}: {
  onCreateTrack: () => void
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10">
      <div className="flex max-w-[480px] flex-col items-center text-center">
        <div className="mb-6 flex h-[120px] w-[120px] items-center justify-center rounded-2xl bg-hues-sky text-accent">
          <Icon name="DataFlow" size={52} />
        </div>
        <h2 className="m-0 mb-2 text-[26px] font-semibold leading-tight text-neutrals-charcoal">
          עדיין אין הכשרות
        </h2>
        <p className="m-0 mb-6 text-base leading-relaxed text-neutrals-lead">
          זהו מפעל התוכן שלך. צרו את ההכשרה הראשונה והתחילו לבנות את עץ המסלולים,
          המודולים והשיעורים.
        </p>
        <Button
          variant="primary"
          leadingIcon={<Icon name="Plus" size={19} />}
          onClick={onCreateTrack}
        >
          צור את ההכשרה הראשונה
        </Button>
      </div>
    </div>
  )
}
