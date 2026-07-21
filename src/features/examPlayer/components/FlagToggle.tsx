/**
 * כפתור "סמן בדגל" (מסמך 14). אייקון דגל אינו ברגיסטר ה-DS (109 שמות) — לפי
 * נוהל-הפער הדו-שלבי (CLAUDE.md §6.1) נלקח כ-SVG מדויק ישירות מ
 * design-export/Exam Player.dc.html (שורה 218, ה-flag pin שבתוך ריבוע הניווט).
 */
function FlagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}

export function FlagToggle({
  flagged,
  onToggle,
}: {
  flagged: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={flagged}
      className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-tiny-bold transition-colors ${
        flagged
          ? 'border-hues-yellow bg-hues-yellow/30 text-[#8A6E00]'
          : 'border-neutrals-silver bg-white text-neutrals-lead hover:border-hues-yellow hover:text-[#8A6E00]'
      }`}
    >
      <FlagIcon />
      {flagged ? 'מסומנת' : 'סמן בדגל'}
    </button>
  )
}
