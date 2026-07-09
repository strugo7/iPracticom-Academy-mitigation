import { useQuery } from '@tanstack/react-query'
import { Button, Loader } from '@/components/ui'
import { apiClient } from '@/lib/api'
import { colors } from '@/lib/constants/tokens'

/**
 * דף הדגמה פנימי (/dev/demo) — בדיקת השפיות של Phase 0.2 + 0.3:
 * טוקני העיצוב, פונט Ploni, קומפוננטת DS, ושכבת ה-API על הדאטה האמיתי.
 * לא חלק מהאפליקציה; נשמר ככלי פיתוח.
 */

const swatches: [string, string][] = [
  ['accent', colors.functional.accent],
  ['caution', colors.functional.caution],
  ['success', colors.functional.success],
  ['warning', colors.functional.warning],
  ['charcoal', colors.neutrals.charcoal],
  ['lead', colors.neutrals.lead],
  ['silver', colors.neutrals.silver],
  ['whisper', colors.neutrals.whisper],
]

// hook זמני של דף ההדגמה — ה-hooks האמיתיים יעברו ל-features/<feature>/hooks
function useDemoUsers() {
  return useQuery({
    queryKey: ['demo', 'users'],
    queryFn: () => apiClient.users.findMany({ sort: 'full_name' }),
  })
}

function ApiDemoSection() {
  const { data: users, isPending, isError, error } = useDemoUsers()

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-h3 text-neutrals-charcoal">
        שכבת ה-API (שלב 0.3) — דאטה אמיתי מהגיבוי
      </h2>
      {isPending && <Loader />}
      {isError && (
        <p className="text-body text-caution">
          שגיאה בטעינת המשתמשים: {error.message}
        </p>
      )}
      {users && (
        <>
          <p className="text-body text-neutrals-lead">
            apiClient.users.findMany() החזיר {users.length} משתמשים
            מ-app-backup-2026-06-29
          </p>
          <ul className="flex flex-wrap gap-2">
            {users.map((user) => (
              <li
                key={user.id}
                className="rounded-lg border border-neutrals-silver px-3 py-1 text-tiny text-neutrals-charcoal"
              >
                {user.full_name} · {user.role}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export function DemoPage() {
  return (
    <div className="min-h-svh p-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-h1 text-accent-gradient">iPracticom Academy</h1>
          <p className="text-body text-neutrals-lead">
            /dev/demo — יסודות מערכת העיצוב ושכבת ה-API (Phase 0.2–0.3)
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-h3 text-neutrals-charcoal">סקאלת טיפוגרפיה</h2>
          <p className="text-h2 text-neutrals-charcoal">כותרת H2 — Ploni</p>
          <p className="text-body text-neutrals-charcoal">
            טקסט גוף (body) — הנועל החום קפץ מעל הכלב העצלן.
          </p>
          <p className="text-tiny text-neutrals-lead">טקסט זעיר (tiny)</p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-h3 text-neutrals-charcoal">צבעי מותג</h2>
          <div className="flex flex-wrap gap-3">
            {swatches.map(([name, hex]) => (
              <div key={name} className="flex flex-col items-center gap-1">
                <div
                  className="size-16 rounded-lg border border-neutrals-silver shadow-card"
                  style={{ background: hex }}
                />
                <span className="text-tiny text-neutrals-lead">{name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-h3 text-neutrals-charcoal">
            קומפוננטת DS (Button)
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">כפתור ראשי</Button>
            <Button variant="outlined">כפתור משני</Button>
            <Button variant="red">מחיקה</Button>
            <Button variant="link">קישור</Button>
          </div>
        </section>

        <ApiDemoSection />
      </div>
    </div>
  )
}
