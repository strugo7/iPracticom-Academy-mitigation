import { useMemo, useState } from 'react'
import { useCommandPalette } from '@/components/search'
import { canManageContent, useAuth } from '@/lib/auth'
import { HELP_CATEGORIES } from '../constants'
import type { CategoryKey } from '../types'
import { HelpCategoryHero } from '../components/HelpCategoryHero'
import { HelpCategoryTree } from '../components/HelpCategoryTree'
import { ArticleGrid } from '../components/ArticleGrid'
import { ArticleDetailView } from '../components/ArticleDetailView'

export function HelpCenterPage() {
  const { user } = useAuth()
  const { open: openCommandPalette } = useCommandPalette()

  const [activeCatKey, setActiveCatKey] = useState<CategoryKey>('overview')
  const [openCatKey, setOpenCatKey] = useState<CategoryKey | null>('overview')
  const [activeArticleId, setActiveArticleId] = useState<string>('hierarchy')
  const [view, setView] = useState<'grid' | 'article'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const activeCat = HELP_CATEGORIES[activeCatKey]
  const currentArticle = useMemo(() => {
    return (
      activeCat.items.find((item) => item.id === activeArticleId) ??
      activeCat.items[0]
    )
  }, [activeCat, activeArticleId])

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return activeCat.items
    const q = searchQuery.toLowerCase().trim()
    return activeCat.items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q),
    )
  }, [activeCat, searchQuery])

  const relatedArticles = useMemo(() => {
    if (!currentArticle) return []
    return activeCat.items.filter((item) => item.id !== currentArticle.id)
  }, [activeCat, currentArticle])

  const handleToggleCategory = (key: CategoryKey) => {
    setOpenCatKey((prev) => (prev === key ? null : key))
    setActiveCatKey(key)
    const firstArticle = HELP_CATEGORIES[key].items[0]
    if (firstArticle) {
      setActiveArticleId(firstArticle.id)
    }
  }

  const handleSelectArticle = (catKey: CategoryKey, articleId: string) => {
    setActiveCatKey(catKey)
    setOpenCatKey(catKey)
    setActiveArticleId(articleId)
  }

  const handleOpenArticle = (articleId: string) => {
    setActiveArticleId(articleId)
    setView('article')
  }

  const handleSelectCategoryFromFooter = (key: CategoryKey) => {
    setActiveCatKey(key)
    setOpenCatKey(key)
    const firstArticle = HELP_CATEGORIES[key].items[0]
    if (firstArticle) {
      setActiveArticleId(firstArticle.id)
    }
    setView('grid')
  }

  const isAdmin = canManageContent(user)

  return (
    <section
      dir="rtl"
      className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6"
    >
      {/* פירורי לחם (Breadcrumb) */}
      <div className="flex items-center gap-2 text-sm text-neutrals-lead flex-wrap">
        <button
          type="button"
          onClick={() => setView('grid')}
          className="border-none bg-transparent p-0 font-sans text-sm text-neutrals-lead cursor-pointer hover:text-accent transition-colors"
        >
          מרכז עזרה
        </button>

        <span className="text-neutrals-silver">/</span>

        {view === 'article' && (
          <>
            <button
              type="button"
              onClick={() => setView('grid')}
              className="border-none bg-transparent p-0 font-sans text-sm text-neutrals-lead cursor-pointer hover:text-accent transition-colors"
            >
              {activeCat.label}
            </button>
            <span className="text-neutrals-silver">/</span>
            <span className="font-semibold text-neutrals-charcoal">
              {currentArticle?.label}
            </span>
          </>
        )}

        {view === 'grid' && (
          <span className="font-semibold text-neutrals-charcoal">
            {activeCat.label}
          </span>
        )}
      </div>

      {/* פריסת עמוד (סרגל צד + תוכן מרכזי) */}
      <div className="flex flex-col lg:flex-row items-start gap-7">
        {/* סרגל עץ קטגוריות */}
        <HelpCategoryTree
          activeCatKey={activeCatKey}
          activeArticleId={activeArticleId}
          openCatKey={openCatKey}
          onToggleCategory={handleToggleCategory}
          onSelectArticle={handleSelectArticle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCommandPalette={openCommandPalette}
        />

        {/* תוכן מרכזי */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">
          {view === 'grid' ? (
            <>
              {/* באנר הירו מונפש */}
              <HelpCategoryHero
                categoryKey={activeCatKey}
                title={activeCat.label}
                heroText={activeCat.hero}
                showNewArticleButton={isAdmin}
              />

              {/* רשת המאמרים */}
              <ArticleGrid
                articles={filteredArticles}
                activeArticleId={activeArticleId}
                onOpenArticle={handleOpenArticle}
                activeCatKey={activeCatKey}
                onSelectCategory={handleSelectCategoryFromFooter}
              />
            </>
          ) : (
            /* תצוגת מאמר מפורט */
            currentArticle && (
              <ArticleDetailView
                article={currentArticle}
                categoryLabel={activeCat.label}
                onBackToGrid={() => setView('grid')}
                relatedArticles={relatedArticles}
                onOpenRelatedArticle={handleOpenArticle}
                showAdminEditButton={isAdmin}
              />
            )
          )}
        </div>
      </div>
    </section>
  )
}
