/**
 * תגית-הקטגוריה של כרטיס Playbook. גלולה צבעונית ללא-נקודה, במידות DS Tag
 * (h-6 · px-[9px] · text-[15px] · font-normal · rounded-full — Tag.tsx), אך עם
 * פלטת-קטגוריות מותאמת-מותג (8 גוונים, CATEGORY_META) שאין ל-Tag הגנרי.
 */
import { categoryMeta } from '../constants'

export function CategoryTag({
  category,
}: {
  category: string | null | undefined
}) {
  const meta = categoryMeta(category)
  return (
    <span
      className="inline-flex h-6 items-center rounded-full px-[9px] font-sans text-[15px] font-normal"
      style={{ backgroundColor: meta.bg, color: meta.fg }}
    >
      {category || 'כללי'}
    </span>
  )
}
