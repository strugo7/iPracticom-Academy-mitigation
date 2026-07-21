/**
 * גיבוי-נפילה-רכה לכל בלוק: type לא-מוכר, graph (0 מופעים/אין spec), או
 * דאטה שלא עברה parse. לעולם לא זורק — מציג הודעה במקום להפיל את השיעור.
 */
import { Icon } from '@/components/ui'

export function UnsupportedBlock({ type }: { type: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-neutrals-silver bg-neutrals-whisper p-4 text-[13.5px] text-neutrals-nickel">
      <Icon name="Warning" size={16} className="flex-none" />
      <span>תוכן מסוג &quot;{type}&quot; עדיין לא נתמך בנגן.</span>
    </div>
  )
}
