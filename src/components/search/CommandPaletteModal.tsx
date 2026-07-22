import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Icon } from '@/components/ui'
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  performSearch,
  removeRecentSearch,
  SUGGESTED_SEARCHES,
  type SearchCategory,
  type SearchResultItem,
} from './searchEngine'

interface CommandPaletteModalProps {
  isOpen: boolean
  onClose: () => void
}

function CategoryIcon({ category }: { category: SearchCategory }) {
  switch (category) {
    case 'page':
      return <Icon name="Navigation" size={18} className="text-accent" />
    case 'system':
      return <Icon name="Link" size={18} className="text-[#33B1FF]" />
    case 'lesson':
      return <Icon name="File" size={18} className="text-hues-mint" />
    case 'concept':
      return <Icon name="File" size={18} className="text-hues-cobalt" />
    default:
      return <Icon name="Search" size={18} className="text-neutrals-lead" />
  }
}

export function CommandPaletteModal({
  isOpen,
  onClose,
}: CommandPaletteModalProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  const [prevQuery, setPrevQuery] = useState(query)

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setRecentSearches(getRecentSearches())
      setQuery('')
      setSelectedIndex(0)
    }
  }

  if (query !== prevQuery) {
    setPrevQuery(query)
    setSelectedIndex(0)
  }

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const results = performSearch(query)

  const handleSelectItem = useCallback(
    (item: SearchResultItem) => {
      if (query.trim()) {
        const updated = addRecentSearch(query.trim())
        setRecentSearches(updated)
      } else {
        const updated = addRecentSearch(item.title)
        setRecentSearches(updated)
      }

      onClose()

      if (item.isExternal) {
        window.open(item.url, '_blank', 'noopener,noreferrer')
      } else {
        navigate(item.url)
      }
    },
    [query, onClose, navigate],
  )

  const handleSelectRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm)
    inputRef.current?.focus()
  }

  const handleRemoveRecent = (e: React.MouseEvent, searchTerm: string) => {
    e.stopPropagation()
    const updated = removeRecentSearch(searchTerm)
    setRecentSearches(updated)
  }

  const handleClearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = clearRecentSearches()
    setRecentSearches(updated)
  }

  // ניווט מקלדת (חצים למעלה/למטה ו-Enter)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          results.length > 0 ? (prev + 1) % results.length : 0,
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          results.length > 0 ? (prev - 1 + results.length) % results.length : 0,
        )
      } else if (e.key === 'Enter') {
        if (results.length > 0 && results[selectedIndex]) {
          e.preventDefault()
          handleSelectItem(results[selectedIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, handleSelectItem])

  // גלילה אוטומטית אל הפריט הנבחר במקלדת
  useEffect(() => {
    if (listRef.current && results.length > 0) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex, results.length])

  if (!isOpen) return null

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[16px] border border-white/20 bg-[#161B22]/95 text-white shadow-2xl backdrop-blur-xl transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* כותרת ושורת אינפוט */}
        <div className="relative flex items-center border-b border-white/10 px-6 py-4">
          <Icon
            name="Search"
            size={20}
            className="text-accent flex-none me-3"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש שיעורים, מושגים, מערכות פנימיות, דפים..."
            className="w-full bg-transparent text-base font-medium text-white placeholder-neutrals-lead/70 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutrals-lead hover:bg-white/10 hover:text-white transition-colors ms-2"
            >
              <Icon name="Close" size={16} />
            </button>
          ) : (
            <kbd className="flex h-6 items-center rounded border border-white/20 bg-white/10 px-2 text-xs font-semibold text-neutrals-silver ms-2">
              ESC
            </kbd>
          )}
        </div>

        {/* גוף ה-Modal */}
        <div className="max-h-[60vh] overflow-y-auto p-4" ref={listRef}>
          {/* מצב 1: חיפוש פעיל */}
          {query.trim() !== '' ? (
            results.length > 0 ? (
              <div className="flex flex-col gap-2">
                {results.map((item, index) => {
                  const isSelected = index === selectedIndex
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 transition-all duration-150 ${
                        isSelected
                          ? 'bg-gradient-to-r from-accent/20 to-accent/5 border border-accent/40 text-white shadow-md'
                          : 'border border-transparent text-white/90 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div
                          className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl transition-colors ${
                            isSelected
                              ? 'bg-accent/30 text-white'
                              : 'bg-white/5 text-neutrals-lead'
                          }`}
                        >
                          <CategoryIcon category={item.category} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[15px] truncate">
                              {item.title}
                            </span>
                            {item.badge && (
                              <Badge
                                color={item.isExternal ? 'accent' : 'neutral'}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          {item.subtitle && (
                            <p className="text-xs text-neutrals-silver/80 truncate m-0 mt-1">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-none ms-4">
                        <span className="text-xs text-neutrals-silver/70 font-medium px-2 py-1 rounded bg-white/5">
                          {item.categoryLabel}
                        </span>
                        {isSelected && (
                          <span className="text-xs text-accent font-semibold flex items-center gap-1">
                            ↵ בכניסה
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-neutrals-silver">
                <Icon
                  name="Search"
                  size={32}
                  className="mx-auto mb-3 opacity-40"
                />
                <p className="text-base font-medium">
                  לא נמצאו תוצאות עבור &quot;
                  <span className="text-white">{query}</span>&quot;
                </p>
                <p className="text-xs text-neutrals-lead mt-1">
                  נסה לחפש במילים אחרות או בחיפושים המומלצים
                </p>
              </div>
            )
          ) : (
            /* מצב 2: שורת חיפוש ריקה - חיפושים אחרונים / חיפושים מומלצים */
            <div className="space-y-6">
              {recentSearches.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-3 px-2">
                    <span className="flex items-center gap-2 text-xs font-bold tracking-wider text-neutrals-silver uppercase">
                      <Icon name="Clock" size={14} className="text-accent" />
                      חיפושים אחרונים
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAllRecent}
                      className="text-xs text-neutrals-silver/80 hover:text-white transition-colors"
                    >
                      מחק היסטוריה
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => handleSelectRecentSearch(term)}
                        className="group flex cursor-pointer items-center justify-between rounded-xl px-4 py-2.5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            name="Clock"
                            size={16}
                            className="text-neutrals-lead group-hover:text-accent transition-colors"
                          />
                          <span className="text-sm font-medium text-white/90">
                            {term}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveRecent(e, term)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutrals-lead hover:text-white transition-opacity"
                          title="הסר מההיסטוריה"
                        >
                          <Icon name="Close" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* חיפושים מומלצים */}
              <div>
                <div className="flex items-center gap-2 mb-3 px-2 text-xs font-bold tracking-wider text-neutrals-silver uppercase">
                  <Icon name="Search" size={14} className="text-warning" />
                  חיפושים מומלצים
                </div>
                <div className="flex flex-wrap gap-2 px-1">
                  {SUGGESTED_SEARCHES.map((suggested) => (
                    <button
                      key={suggested}
                      type="button"
                      onClick={() => handleSelectRecentSearch(suggested)}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/90 hover:border-accent/50 hover:bg-accent/10 hover:text-accent transition-all"
                    >
                      <Icon name="Search" size={12} className="opacity-60" />
                      {suggested}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* פוטר מקלדת */}
        <div className="flex items-center justify-between border-t border-white/10 bg-black/40 px-6 py-4 text-xs text-neutrals-silver">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono">
                ↑↓
              </kbd>{' '}
              לניווט
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono">
                ↵
              </kbd>{' '}
              לבחירה
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono">
                ESC
              </kbd>{' '}
              לסגירה
            </span>
          </div>
          <span className="text-[11px] font-semibold text-accent/80">
            iPracticom Search
          </span>
        </div>
      </div>
    </div>
  )
}
