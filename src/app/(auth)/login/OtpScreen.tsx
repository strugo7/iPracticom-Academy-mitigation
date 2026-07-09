/**
 * מסך האימות הדו-שלבי (screen 2) — מעוצב 1:1 מה-export אך **לא-פעיל** עד Phase 12
 * (מסמך 36 שלב 0.4). מוצג במצב הדוגמה של העיצוב: קוד חלקי + שגיאת "קוד שגוי".
 */
import { Button } from '@/components/ui'

const SAMPLE_OTP = ['2', '9', '4', '', '', ''] // מצב ברירת המחדל של ה-export
const SAMPLE_EMAIL = 'd.levi@ipracticom.co.il'
const SAMPLE_TIMER = '0:38'

function BackChevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 5L2 7" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  )
}

export function OtpScreen({ onBack }: { onBack: () => void }) {
  const hasError = true // מצב הדוגמה של ה-export; הלוגיקה האמיתית ב-Phase 12

  return (
    <div className="lg-anim">
      <button
        type="button"
        onClick={onBack}
        className="lg-link mb-5 inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] font-semibold text-neutrals-nickel transition-colors duration-150"
      >
        <BackChevron />
        חזרה
      </button>

      <span className="mb-[18px] inline-flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-[#E9F3FC] text-accent">
        <MailIcon />
      </span>
      <h1 className="mb-[9px] text-[27px] font-semibold">אימות דו-שלבי</h1>
      <p className="mb-[26px] text-[15px] leading-[1.6] text-neutrals-lead">
        שלחנו קוד בן 6 ספרות לכתובת{' '}
        <strong dir="ltr" className="font-semibold text-neutrals-charcoal">
          {SAMPLE_EMAIL}
        </strong>
      </p>

      <div
        dir="ltr"
        className={`mb-3.5 flex justify-between gap-[9px] ${hasError ? 'lg-shake' : ''}`}
      >
        {SAMPLE_OTP.map((value, i) => (
          <input
            key={i}
            className="lg-otp h-[62px] w-[54px] rounded-[13px] text-center text-[26px] font-semibold text-neutrals-charcoal transition-all duration-150"
            style={{
              border: `1.5px solid ${hasError ? '#F0B6B8' : value ? '#0075DB' : '#E1E6EC'}`,
              background: value ? '#fff' : '#F8FBFE',
            }}
            value={value}
            inputMode="numeric"
            maxLength={1}
            aria-label={`ספרה ${i + 1}`}
            readOnly // המסך מעוצב אך לא-פעיל עד Phase 12
          />
        ))}
      </div>

      {hasError && (
        <div className="lg-anim mb-3.5 flex items-center gap-[7px] text-[13px] font-semibold text-caution">
          <ErrorIcon />
          הקוד שגוי. בדקו שוב את 6 הספרות.
        </div>
      )}

      {/* radius/height לפי ה-export של המסך (14px/54px) — גובר על ברירת המחדל של ה-DS */}
      <Button
        variant="primary"
        className="w-full shadow-[0_8px_22px_rgba(0,117,219,.28)]"
        style={{ borderRadius: 14, height: 54 }}
        disabled
        title="אימות דו-שלבי יחובר ב-Phase 12"
      >
        אמת והתחבר
      </Button>

      <div className="mt-5 flex items-center justify-center gap-1.5 text-[13.5px] text-neutrals-lead">
        <span>
          שליחת קוד חדש אפשרית בעוד{' '}
          <strong className="font-semibold text-neutrals-charcoal">
            {SAMPLE_TIMER}
          </strong>
        </span>
      </div>
    </div>
  )
}
