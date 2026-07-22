import { HELP_CATEGORIES, CATEGORY_ORDER } from '../constants'
import type { CategoryKey, HelpArticle } from '../types'

interface ArticleGridProps {
  articles: HelpArticle[]
  activeArticleId: string
  onOpenArticle: (articleId: string) => void
  activeCatKey: CategoryKey
  onSelectCategory: (key: CategoryKey) => void
}

export function ArticleGrid({
  articles,
  activeArticleId,
  onOpenArticle,
  activeCatKey,
  onSelectCategory,
}: ArticleGridProps) {
  const otherCategories = CATEGORY_ORDER.filter((k) => k !== activeCatKey)

  return (
    <div className="flex flex-col gap-6">
      {/* רשת כרטיסי המאמרים בקטגוריה */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((item) => {
          const isSelected = item.id === activeArticleId
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenArticle(item.id)}
              className={`text-start rounded-[16px] p-5 cursor-pointer transition-all duration-200 font-sans border ${
                isSelected
                  ? 'bg-gradient-to-br from-accent to-hues-cobalt text-white border-transparent shadow-[0_14px_30px_rgba(0,117,219,0.28)] scale-[1.01]'
                  : 'bg-white text-neutrals-charcoal border-neutrals-silver hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(4,13,55,0.10)]'
              }`}
            >
              <div
                className={`font-semibold text-[15.5px] mb-1.5 ${
                  isSelected ? 'text-white' : 'text-neutrals-charcoal'
                }`}
              >
                {item.label}
              </div>
              <div
                className={`text-[13.5px] leading-relaxed ${
                  isSelected ? 'text-white/90' : 'text-neutrals-lead'
                }`}
              >
                {item.desc}
              </div>
            </button>
          )
        })}
      </div>

      {/* עוד ממרכז העזרה (צ'יפים לקטגוריות אחרות) */}
      <div className="pt-4 border-t border-neutrals-silver mt-2">
        <div className="font-semibold text-sm text-neutrals-lead mb-3">
          עוד ממרכז העזרה
        </div>
        <div className="flex flex-wrap gap-2.5">
          {otherCategories.map((key) => {
            const cat = HELP_CATEGORIES[key]
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectCategory(key)}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-neutrals-silver bg-white text-neutrals-charcoal font-semibold text-[13.5px] cursor-pointer transition-all hover:border-accent hover:bg-hues-sky/30 hover:text-accent"
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
