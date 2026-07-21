/**
 * מצב "לא נמצאו מונחים" אחרי סינון (design-export/Concepts.dc.html שורות 137-144).
 * זהו מצב ייעודי-למסך ולא קומפוננטת-DS: `ZeroStates` של ה-DS מדגים מאגר ריק עם
 * CTA-יצירה — ולכן הוא בשימוש למאגר ריק, וזה בשימוש כשהסינון התרוקן.
 */
import { Button, Icon } from '@/components/ui'

export function ConceptsEmptyResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-2xl bg-hues-sky text-accent">
        <Icon name="Search" size={42} />
      </div>
      <h3 className="mb-2 text-[20px] font-semibold text-neutrals-charcoal">
        לא נמצאו מונחים
      </h3>
      <p className="mb-5 max-w-[360px] text-[15px] leading-relaxed text-neutrals-lead">
        נסו לשנות את מילות החיפוש או לאפס את הסינון כדי לראות את כל המאגר.
      </p>
      <Button variant="outlined" onClick={onReset}>
        אפס סינון
      </Button>
    </div>
  )
}
