/**
 * בורר-תבניות בפתיחת עורך-נוהל חדש — כרטיסי-תבנית להאצת יצירה (מקביל
 * ל-LessonTemplateGallery). בחירת תבנית שותלת מבנה-בלוקים וקטגוריה; "נוהל ריק"
 * מתחיל נקי. מוצג רק ליצירת נוהל חדש (במצב-כתוב).
 */
import { Card, Icon, IconButton } from '@/components/ui'
import { POLICY_TEMPLATES, type PolicyTemplate } from '../../templates'

interface PolicyTemplateGalleryProps {
  onPick: (template: PolicyTemplate) => void
  onBack: () => void
}

export function PolicyTemplateGallery({
  onPick,
  onBack,
}: PolicyTemplateGalleryProps) {
  return (
    <div className="min-h-svh bg-neutrals-whisper">
      <header className="border-b border-neutrals-silver bg-white">
        <div className="mx-auto flex max-w-[960px] items-center gap-3 px-6 py-4">
          <IconButton
            variant="outline"
            size="md"
            aria-label="חזרה לנהלים"
            onClick={onBack}
          >
            <Icon name="ChevronRight" size={20} />
          </IconButton>
          <div>
            <h1 className="text-h3 font-semibold text-neutrals-charcoal">
              נוהל חדש
            </h1>
            <p className="mt-0.5 text-small text-neutrals-lead">
              בחר/י תבנית להתחלה מהירה, או התחל/י מנוהל ריק
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[960px] px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {POLICY_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onPick(template)}
              className="text-start"
            >
              <Card className="flex h-full items-start gap-3.5 p-5 transition-all hover:border-accent hover:shadow-[0_6px_18px_rgba(20,60,110,.08)]">
                <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-hues-sky text-accent">
                  <Icon name={template.icon} size={20} />
                </span>
                <div className="min-w-0">
                  <div className="text-body font-semibold text-neutrals-charcoal">
                    {template.name}
                  </div>
                  <div className="mt-1 text-small text-neutrals-lead">
                    {template.description}
                  </div>
                  <div className="mt-2 text-[11px] text-neutrals-nickel">
                    {template.blocks.length} בלוקים · {template.category}
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
