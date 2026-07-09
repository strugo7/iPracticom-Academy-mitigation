/**
 * דף ריק בתוך המעטפת — שלב 0.5. כל יעד ניווט מקבל עמוד שמוכיח שהניתוב
 * והכותרת עובדים; מוחלף במסך האמיתי בשלב ה-feature שלו (Phase 1+).
 */
import { useLocation } from 'react-router-dom'
import { getPageMeta } from '@/components/shell/navConfig'
import { useAuth } from '@/lib/auth'

export function PagePlaceholder() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { title } = getPageMeta(pathname, user)

  return (
    <div className="mx-auto w-full max-w-[1280px] px-8 pb-10 pt-[26px]">
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-neutrals-silver bg-white px-10 py-16 text-center shadow-card">
        <h2 className="text-h4 font-semibold text-neutrals-charcoal">
          {title}
        </h2>
        <p className="text-small text-neutrals-lead">
          העמוד ייבנה בשלב ה-feature שלו — המעטפת והניווט כבר פעילים.
        </p>
      </div>
    </div>
  )
}
