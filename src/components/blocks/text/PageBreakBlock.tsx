/**
 * מסמן גבול-עמוד בתוך השיעור. הנגן מרנדר את blocks[] ברצף גלילה רציף
 * (אין עיצוב Figma לחוויית-פיצול-לעמודים בשלב זה) — סימון ויזואלי עדין בלבד.
 */
export function PageBreakBlock() {
  return <div className="my-6 border-t border-dashed border-neutrals-silver" aria-hidden />
}
