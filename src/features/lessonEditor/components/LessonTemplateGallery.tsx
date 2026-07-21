/**
 * גלריית התבניות הפדגוגיות (שלב 6.5, מסמך 23 §3) — בורר-תבנית שמאכלס את מבנה-
 * הבלוקים ההתחלתי. בנוי על DS Dialog (size=lg). עיצוב מ-design-export/Lesson
 * Editor.dc.html (§PEDAGOGICAL TEMPLATES). בחירת-תבנית מוסיפה את שלד-הבלוקים
 * לקנבס (buildTemplateBlocks) — הפעולה נשלטת ע"י ה-page.
 */
import { Dialog } from '@/components/ui'
import { EditorIcon } from '../editorIcons'
import { STRINGS } from '../constants'
import { TEMPLATE_OPTIONS, type TemplateKey } from '../services/aiAssistService'

interface LessonTemplateGalleryProps {
  open: boolean
  onClose: () => void
  onUseTemplate: (key: TemplateKey) => void
}

export function LessonTemplateGallery({
  open,
  onClose,
  onUseTemplate,
}: LessonTemplateGalleryProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <div>
          <div className="text-[21px] font-semibold text-neutrals-charcoal">
            {STRINGS.templatesTitle}
          </div>
          <div className="mt-0.5 text-[13px] text-neutrals-lead">
            {STRINGS.templatesSubtitle}
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TEMPLATE_OPTIONS.map((tpl) => (
          <button
            key={tpl.key}
            type="button"
            onClick={() => onUseTemplate(tpl.key)}
            className="flex flex-col rounded-2xl border border-neutrals-silver bg-white p-5 text-start transition-colors hover:border-accent hover:bg-hues-sky/30"
          >
            <div className="mb-3.5 flex items-center gap-3">
              <span
                className={`flex size-11 flex-none items-center justify-center rounded-xl ${tpl.toneBg} ${tpl.toneFg}`}
              >
                <EditorIcon name={tpl.icon} size={20} aria-hidden />
              </span>
              <div className="text-[16px] font-semibold text-neutrals-charcoal">
                {tpl.label}
              </div>
            </div>
            <p className="m-0 min-h-10 text-[13px] leading-relaxed text-neutrals-lead">
              {tpl.desc}
            </p>
            <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-neutrals-whisper pt-3">
              {tpl.blockLabels.map((label, i) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: תווית-תצוגה סטטית ללא מזהה
                  key={i}
                  className="rounded-md border border-neutrals-silver bg-neutrals-whisper px-2.5 py-0.5 text-[11px] font-semibold text-neutrals-lead"
                >
                  {label}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </Dialog>
  )
}
