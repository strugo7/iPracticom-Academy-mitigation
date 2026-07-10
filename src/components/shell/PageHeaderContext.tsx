/**
 * override נקודתי לכותרת ה-TopBar — עבור דפים שכותרתם דינמית (למשל TrackDetails,
 * ששם המסלול נטען מה-API) ולא ניתן לגזור אותה מ-getPageMeta (מפה סטטית לפי
 * pathname). דף שלא קורא ל-usePageHeader משאיר את ה-TopBar על ברירת המחדל.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export interface PageHeaderOverride {
  title: string
  subtitle?: string
  /** קישור-חזרה מוצג לפני הכותרת (למשל "ההכשרות שלי") */
  backTo?: string
  backLabel?: string
}

interface PageHeaderContextValue {
  override: PageHeaderOverride | null
  setOverride: (override: PageHeaderOverride | null) => void
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null)

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<PageHeaderOverride | null>(null)
  return (
    <PageHeaderContext.Provider value={{ override, setOverride }}>
      {children}
    </PageHeaderContext.Provider>
  )
}

function usePageHeaderContext(): PageHeaderContextValue {
  const ctx = useContext(PageHeaderContext)
  if (!ctx) {
    throw new Error(
      'usePageHeader/TopBar חייבים לרוץ בתוך PageHeaderProvider (AppShell)',
    )
  }
  return ctx
}

/**
 * נקרא מתוך דף שצריך כותרת דינמית. מתאפס אוטומטית ב-unmount (ניווט חזרה לדף
 * סטטי חוזר ל-getPageMeta). תלויות ה-effect הן שדות פרימיטיביים, לא האובייקט
 * עצמו — כך שקריאה עם object literal חדש בכל render לא לולאת-אינסוף.
 */
export function usePageHeader(override: PageHeaderOverride | null): void {
  const { setOverride } = usePageHeaderContext()
  useEffect(() => {
    setOverride(override)
    return () => setOverride(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    override?.title,
    override?.subtitle,
    override?.backTo,
    override?.backLabel,
  ])
}

/** נקרא רק מתוך TopBar עצמו. */
export function usePageHeaderOverride(): PageHeaderOverride | null {
  return usePageHeaderContext().override
}
