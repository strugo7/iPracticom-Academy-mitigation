import { Icon } from '@/components/ui'
import type { HelpArticle } from '../types'

interface ArticleDetailViewProps {
  article: HelpArticle
  categoryLabel: string
  onBackToGrid: () => void
  relatedArticles: HelpArticle[]
  onOpenRelatedArticle: (articleId: string) => void
  showAdminEditButton?: boolean
}

export function ArticleDetailView({
  article,
  categoryLabel,
  onBackToGrid,
  relatedArticles,
  onOpenRelatedArticle,
  showAdminEditButton = false,
}: ArticleDetailViewProps) {
  return (
    <article className="bg-white border border-neutrals-silver rounded-[20px] p-8 sm:p-9 shadow-[0px_11px_30px_0px_rgba(4,13,55,0.05)] animate-in fade-in duration-200">
      {/* כפתור חזרה וכפתור עריכה */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <button
          type="button"
          onClick={onBackToGrid}
          className="inline-flex items-center gap-2 border-none bg-transparent p-0 font-sans font-semibold text-[13.5px] text-accent cursor-pointer hover:text-hues-cobalt transition-colors"
        >
          <Icon name="ChevronRight" size={16} />
          חזרה לקטגוריות
        </button>

        {showAdminEditButton && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border border-accent text-accent font-semibold text-xs hover:bg-accent/10 transition-all cursor-pointer"
          >
            <Icon name="Edit" size={14} />
            ערוך מאמר
          </button>
        )}
      </div>

      {/* כותרת ותיאור */}
      <h1 className="font-semibold text-2xl sm:text-3xl leading-snug text-neutrals-charcoal m-0 mb-2.5">
        {article.label}
      </h1>
      <p className="text-base leading-relaxed text-neutrals-lead m-0 mb-6 max-w-2xl">
        {article.desc}
      </p>

      {/* צעדים ממוספרים */}
      <div className="flex flex-col gap-3.5 mb-6">
        {article.steps.map((stepText, idx) => (
          <div key={idx} className="flex items-start gap-3.5">
            <span className="flex-none w-7 h-7 rounded-full bg-hues-sky text-accent font-semibold text-xs flex items-center justify-center">
              {idx + 1}
            </span>
            <p className="flex-1 m-0 mt-0.5 text-base leading-relaxed text-neutrals-charcoal">
              {stepText}
            </p>
          </div>
        ))}
      </div>

      {/* תיבת טיפ */}
      {article.tip && (
        <div className="flex items-start gap-3 bg-hues-sky/60 border border-accent/20 rounded-xl p-4 sm:p-4.5 my-6">
          <span className="flex-none w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center">
            <Icon name="Search" size={15} />
          </span>
          <p className="flex-1 m-0 mt-0.5 text-sm leading-relaxed text-accent">
            <strong className="font-semibold">טיפ: </strong>
            {article.tip}
          </p>
        </div>
      )}

      {/* מאמרים נוספים בקטגוריה */}
      {relatedArticles.length > 0 && (
        <div className="mt-8 pt-5 border-t border-neutrals-silver">
          <div className="font-semibold text-[14.5px] text-neutrals-lead mb-3">
            מאמרים נוספים ב{categoryLabel}
          </div>
          <div className="flex flex-col gap-1">
            {relatedArticles.map((rel) => (
              <button
                key={rel.id}
                type="button"
                onClick={() => onOpenRelatedArticle(rel.id)}
                className="flex items-center justify-between gap-3 w-full border-none bg-transparent rounded-xl px-3 py-2.5 cursor-pointer text-start font-sans text-[14.5px] text-neutrals-charcoal hover:bg-neutrals-whisper transition-colors"
              >
                <span>{rel.label}</span>
                <Icon
                  name="ChevronRight"
                  size={15}
                  className="flex-none text-neutrals-lead rotate-180"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
