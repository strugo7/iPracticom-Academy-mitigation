/**
 * קלף-מקום לקטע שהעיצוב (doc 09) כולל אך הישות התומכת שלו לא קיימת עדיין
 * בשכבת הנתונים (ראו constants.ts). שומר על מיקום/פריסה 1:1 עם העיצוב בלי
 * להמציא נתונים — הודעה מפורשת במקום קישור-מת שקט (CLAUDE.md §6 סעיף 5).
 */
import { Alert, Icon, type IconName } from '@/components/ui'

export function UnavailableSectionCard({
  icon,
  title,
  message,
}: {
  icon: IconName
  title: string
  message: string
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <Icon name={icon} size={18} className="text-accent" />
        <div className="text-small font-semibold text-neutrals-charcoal">
          {title}
        </div>
      </div>
      <Alert kind="info">{message}</Alert>
    </div>
  )
}
