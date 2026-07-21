/**
 * מעטפות חוזרות של שלבי האשף (design-export/Term Editor.dc.html):
 * כותרת-שלב + תיאור, וכרטיס לבן (radius-xl, padding 24, shadow-card).
 */
import type { ReactNode } from 'react'
import { Icon } from '@/components/ui'

export function StepIntro({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mb-1">
      <h2 className="text-[20px] font-semibold text-neutrals-charcoal">{title}</h2>
      <p className="mt-2 text-body leading-relaxed text-neutrals-lead">
        {description}
      </p>
    </div>
  )
}

export function WizardCard({ children }: { children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-card">
      {children}
    </section>
  )
}

/** כפתור "הוסף X" מקווקו לרוחב מלא (design-export: `.te-add`). */
export function AddRowButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-accent bg-white p-3 text-body font-semibold text-accent transition-colors hover:bg-hues-sky"
    >
      <Icon name="Plus" size={17} />
      {children}
    </button>
  )
}
