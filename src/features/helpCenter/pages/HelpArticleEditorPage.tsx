import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Badge, Button, Icon, IconButton } from '@/components/ui'
import { canManageContent, useAuth } from '@/lib/auth'
import type { CategoryKey } from '../types'
import { HELP_CATEGORIES } from '../constants'
import { HelpArticleEditorStep1 } from '../components/editor/HelpArticleEditorStep1'
import {
  HelpArticleEditorStep2,
  type EditorStepItem,
} from '../components/editor/HelpArticleEditorStep2'
import { HelpArticleEditorStep3 } from '../components/editor/HelpArticleEditorStep3'
import { HelpArticleEditorStep4 } from '../components/editor/HelpArticleEditorStep4'

export function HelpArticleEditorPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const queryMode = searchParams.get('mode') === 'edit' ? 'edit' : 'create'
  const queryCat = (searchParams.get('category') as CategoryKey) || 'overview'
  const queryTitle = searchParams.get('title') || ''

  const [step, setStep] = useState<number>(1)
  const [title, setTitle] = useState(
    queryTitle || (queryMode === 'edit' ? 'הגדרת שלוחות SoftPhone' : ''),
  )
  const [shortDesc, setShortDesc] = useState(
    queryMode === 'edit' ? 'איך מגדירים שלוחת SoftPhone חדשה למשתמש קצה.' : '',
  )
  const [status, setStatus] = useState<'draft' | 'published'>(
    queryMode === 'edit' ? 'published' : 'draft',
  )
  const [categoryKey, setCategoryKey] = useState<CategoryKey>(queryCat)
  const [tip, setTip] = useState(
    queryMode === 'edit'
      ? 'בדקו שהאוזניות מזוהות במערכת ההפעלה לפני תחילת ההגדרה.'
      : '',
  )
  const [heroCoverUrl, setHeroCoverUrl] = useState<string | undefined>()
  const [heroGifUrl, setHeroGifUrl] = useState<string | undefined>()

  const [steps, setSteps] = useState<EditorStepItem[]>(
    queryMode === 'edit'
      ? [
          {
            id: 'st-1',
            text: 'התקינו את אפליקציית ה-SoftPhone על תחנת העבודה.',
            showMedia: false,
          },
          {
            id: 'st-2',
            text: 'הזינו את פרטי השלוחה שקיבלתם מהמנהל.',
            showMedia: false,
          },
          {
            id: 'st-3',
            text: 'בצעו שיחת בדיקה יוצאת ונכנסת.',
            showMedia: false,
          },
        ]
      : [{ id: 'st-1', text: '', showMedia: false }],
  )

  const isAllowed = canManageContent(user)

  // RBAC Access Denied
  if (!isAllowed) {
    return (
      <section
        dir="rtl"
        className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center gap-4 animate-in fade-in"
      >
        <span className="w-16 h-16 rounded-full bg-hues-salmon text-caution flex items-center justify-center">
          <Icon name="File" size={30} />
        </span>
        <h1 className="text-2xl font-bold text-neutrals-charcoal m-0">
          העמוד הזה נגיש רק למנהלי מערכת
        </h1>
        <p className="text-base text-neutrals-lead max-w-md m-0 leading-relaxed">
          עריכת מאמרי מרכז העזרה דורשת הרשאת "מנהל מערכת". פנו למנהל המערכת שלכם
          אם אתם זקוקים לגישה.
        </p>
        <Link to="/help" className="mt-2 no-underline">
          <Button variant="primary">חזרה למרכז העזרה</Button>
        </Link>
      </section>
    )
  }

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      { id: `st-${Date.now()}`, text: '', showMedia: false },
    ])
  }

  const handleRemoveStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id))
  }

  const handleUpdateStepText = (id: string, text: string) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)))
  }

  const handleToggleStepMedia = (id: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, showMedia: !s.showMedia } : s)),
    )
  }

  const handlePublish = () => {
    // הפעלת שמירה וסיום
    navigate('/help')
  }

  const stepTitles = [
    { n: 1, label: 'פרטי בסיס' },
    { n: 2, label: 'שלבי ההסבר' },
    { n: 3, label: 'מדיה ראשית' },
    { n: 4, label: 'תצוגה ופרסום' },
  ]

  const currentCatLabel = HELP_CATEGORIES[categoryKey]?.label || 'מרכז עזרה'

  return (
    <div
      dir="rtl"
      className="flex flex-col min-h-svh bg-neutrals-whisper text-neutrals-charcoal font-sans"
    >
      {/* TopBar & Subtitle */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutrals-silver px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <IconButton
            variant="outline"
            size="md"
            aria-label="חזרה למרכז העזרה"
            onClick={() => navigate('/help')}
          >
            <Icon name="ChevronRight" size={18} />
          </IconButton>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="m-0 text-lg font-bold text-neutrals-charcoal">
                {queryMode === 'create' ? 'מאמר עזרה חדש' : 'עריכת מאמר עזרה'}
              </h1>
              <Badge color={status === 'published' ? 'success' : 'warning'}>
                {status === 'published' ? 'מפורסם' : 'טיוטה · לא פורסם'}
              </Badge>
            </div>
            <p className="m-0 text-xs text-neutrals-lead mt-0.5">
              מרכז עזרה · {currentCatLabel}
            </p>
          </div>
        </div>
      </header>

      {/* 4-Step Indicator Bar */}
      <div className="bg-white border-b border-neutrals-silver/80 px-6 py-5 z-20">
        <div className="max-w-2xl mx-auto flex items-center">
          {stepTitles.map((st, idx) => {
            const isDone = st.n < step
            const isActive = st.n === step

            return (
              <div key={st.n} className="flex-1 flex items-center">
                {idx > 0 && (
                  <div
                    className={`flex-1 h-1 rounded-full mx-2 transition-colors ${
                      st.n <= step ? 'bg-accent' : 'bg-neutrals-silver'
                    }`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setStep(st.n)}
                  className="flex flex-col items-center gap-1.5 border-none bg-transparent cursor-pointer font-sans"
                >
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isActive
                        ? 'bg-accent text-white ring-4 ring-accent/20 shadow-md'
                        : isDone
                          ? 'bg-accent text-white'
                          : 'bg-white border-2 border-neutrals-silver text-neutrals-lead'
                    }`}
                  >
                    {isDone ? '✓' : st.n}
                  </span>
                  <span
                    className={`text-xs whitespace-nowrap transition-colors ${
                      isActive || isDone
                        ? 'font-semibold text-accent'
                        : 'text-neutrals-lead'
                    }`}
                  >
                    {st.label}
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Form Content per Step */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8 pb-32">
        {step === 1 && (
          <HelpArticleEditorStep1
            title={title}
            onTitleChange={setTitle}
            shortDesc={shortDesc}
            onShortDescChange={setShortDesc}
            status={status}
            onStatusChange={setStatus}
            categoryKey={categoryKey}
            onCategoryKeyChange={setCategoryKey}
          />
        )}

        {step === 2 && (
          <HelpArticleEditorStep2
            steps={steps}
            onAddStep={handleAddStep}
            onRemoveStep={handleRemoveStep}
            onUpdateStepText={handleUpdateStepText}
            onToggleStepMedia={handleToggleStepMedia}
            tip={tip}
            onTipChange={setTip}
          />
        )}

        {step === 3 && (
          <HelpArticleEditorStep3
            heroCoverUrl={heroCoverUrl}
            onHeroCoverUrlChange={setHeroCoverUrl}
            heroGifUrl={heroGifUrl}
            onHeroGifUrlChange={setHeroGifUrl}
          />
        )}

        {step === 4 && (
          <HelpArticleEditorStep4
            title={title}
            shortDesc={shortDesc}
            categoryKey={categoryKey}
            steps={steps}
            tip={tip}
          />
        )}
      </main>

      {/* Sticky Bottom Action Bar */}
      <footer className="sticky bottom-0 z-30 bg-white border-t border-neutrals-silver px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <Button
            variant="outlined"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            הקודם
          </Button>

          <div className="flex items-center gap-2.5">
            <Button variant="white" onClick={() => navigate('/help')}>
              שמור טיוטה
            </Button>
            {step < 4 ? (
              <Button
                variant="primary"
                onClick={() => setStep((s) => Math.min(4, s + 1))}
              >
                המשך
              </Button>
            ) : (
              <Button variant="primary" onClick={handlePublish}>
                {queryMode === 'create' ? 'פרסם מאמר' : 'שמור שינויים'}
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
