/**
 * מסך "גישה נדחתה" (screen 3) — מעוצב 1:1 מה-export אך **לא-פעיל** עד Phase 12
 * (whitelist נאכף בשרת). מוצג עם חשבון הדוגמה של העיצוב.
 */
import { Button } from '@/components/ui'

const SAMPLE_EMAIL = 'guest@gmail.com'

function BlockedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="30"
      height="30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18.36 6.64A9 9 0 1 1 5.64 6.64" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  )
}

export function AccessDeniedScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="lg-anim">
      <span className="mb-5 inline-flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-[#FBECEC] text-caution">
        <BlockedIcon />
      </span>
      <h1 className="mb-[11px] text-[27px] font-semibold">
        אין לך גישה למערכת
      </h1>
      <p className="mb-[22px] text-[15px] leading-[1.65] text-neutrals-lead">
        החשבון{' '}
        <strong dir="ltr" className="font-semibold text-neutrals-charcoal">
          {SAMPLE_EMAIL}
        </strong>{' '}
        אינו מורשה לגשת ל-iPracticom Academy. ייתכן שלא הוזמנת או שאינך ברשימת
        המשתמשים המאושרים.
      </p>

      <div className="mb-[22px] rounded-[14px] border border-[#E9EEF4] bg-[#F8FBFE] px-[18px] py-4">
        <div className="flex items-start gap-[11px]">
          <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] bg-[#E9F3FC] text-accent">
            <UsersIcon />
          </span>
          <div>
            <div className="text-[14px] font-semibold">צריכים גישה?</div>
            <div className="mt-0.5 text-[13px] leading-[1.55] text-neutrals-lead">
              פנו למנהל המערכת או למנהל המחלקה שלכם כדי לקבל הזמנה.
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5">
        {/* radius/height לפי ה-export של המסך (14px/52px); לא-פעיל עד Phase 12 */}
        <Button
          variant="primary"
          className="flex-1 text-[15px] shadow-[0_8px_20px_rgba(0,117,219,.26)]"
          style={{ borderRadius: 14, height: 52 }}
          disabled
          title="פניות למנהל יחוברו ב-Phase 12"
        >
          פנייה למנהל
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="lg-google h-[52px] flex-none cursor-pointer rounded-[14px] border-[1.5px] border-neutrals-silver bg-white px-5 text-[15px] font-semibold text-[#3D4753] transition-all duration-200"
        >
          חזרה
        </button>
      </div>
    </div>
  )
}
