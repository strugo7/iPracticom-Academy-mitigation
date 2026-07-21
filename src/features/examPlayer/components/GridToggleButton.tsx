/**
 * כפתור-מובייל לפתיחת מגירת ניווט-השאלות. אייקון ה-grid (4 ריבועים) אינו
 * ברגיסטר ה-DS — לפי נוהל-הפער (CLAUDE.md §6.1) נלקח כ-SVG מדויק מ
 * design-export/Exam Player.dc.html (שורה 57, כפתור ה-toggleGrid).
 */
function GridIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

export function GridToggleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="ניווט שאלות"
      className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-neutrals-silver bg-white text-neutrals-lead"
    >
      <GridIcon />
    </button>
  )
}
