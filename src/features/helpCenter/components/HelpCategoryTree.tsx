import { Icon } from '@/components/ui'
import { HELP_CATEGORIES, CATEGORY_ORDER } from '../constants'
import type { CategoryKey } from '../types'

interface HelpCategoryTreeProps {
  activeCatKey: CategoryKey
  activeArticleId: string
  openCatKey: CategoryKey | null
  onToggleCategory: (key: CategoryKey) => void
  onSelectArticle: (catKey: CategoryKey, articleId: string) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  onOpenCommandPalette?: () => void
}

export function HelpCategoryTree({
  activeCatKey,
  activeArticleId,
  openCatKey,
  onToggleCategory,
  onSelectArticle,
  searchQuery,
  onSearchChange,
  onOpenCommandPalette,
}: HelpCategoryTreeProps) {
  return (
    <aside className="flex-none w-full lg:w-72 flex flex-col gap-6 lg:sticky lg:top-24">
      {/* שורת חיפוש במרכז העזרה */}
      <div
        onClick={onOpenCommandPalette}
        className="flex items-center gap-2 h-10 px-3 rounded-xl border border-neutrals-silver bg-white shadow-sm transition-colors cursor-pointer hover:border-accent"
      >
        <Icon
          name="Search"
          size={17}
          className="text-neutrals-lead flex-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="חיפוש במרכז העזרה…"
          className="flex-1 min-w-0 border-none outline-none bg-transparent font-sans text-sm text-neutrals-charcoal placeholder-neutrals-lead/70"
        />
        <span className="flex-none font-sans font-semibold text-[11px] text-neutrals-lead bg-neutrals-silver/40 border border-neutrals-silver rounded-md px-1.5 py-0.5">
          ⌘K
        </span>
      </div>

      {/* רשימת הקטגוריות והמאמרים (Accordion) */}
      <div>
        <div className="text-[11px] font-bold tracking-wider text-neutrals-lead uppercase px-2 mb-2">
          איך זה עובד
        </div>
        <div className="flex flex-col gap-1">
          {CATEGORY_ORDER.map((key) => {
            const cat = HELP_CATEGORIES[key]
            const isOpen = openCatKey === key
            const isCatActive = activeCatKey === key

            return (
              <div key={key} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => onToggleCategory(key)}
                  className={`flex items-center gap-2.5 w-full border-0 rounded-xl px-3 py-2.5 cursor-pointer text-start font-sans transition-colors ${
                    isCatActive
                      ? 'bg-hues-sky/40 font-semibold text-accent'
                      : 'bg-transparent hover:bg-neutrals-whisper text-neutrals-charcoal font-medium'
                  }`}
                >
                  <span
                    className={`flex-none w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isCatActive
                        ? 'bg-hues-sky text-accent'
                        : 'bg-neutrals-silver/40 text-neutrals-lead'
                    }`}
                  >
                    <Icon name="File" size={15} />
                  </span>
                  <span className="flex-1 text-[14.5px] truncate">
                    {cat.label}
                  </span>
                  <Icon
                    name="ChevronRight"
                    size={15}
                    className={`flex-none text-neutrals-lead transition-transform duration-200 ${
                      isOpen ? '-rotate-90' : 'rotate-90'
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="my-1 ps-6 flex flex-col gap-0.5 animate-in fade-in duration-150">
                    {cat.items.map((item) => {
                      const isItemActive =
                        isCatActive && activeArticleId === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onSelectArticle(key, item.id)}
                          className={`flex items-center gap-2 w-full border-0 rounded-lg px-2.5 py-1.5 cursor-pointer text-start font-sans text-[13.5px] transition-colors ${
                            isItemActive
                              ? 'bg-hues-sky text-accent font-semibold'
                              : 'bg-transparent text-neutrals-lead hover:text-neutrals-charcoal hover:bg-neutrals-silver/30 font-normal'
                          }`}
                        >
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
