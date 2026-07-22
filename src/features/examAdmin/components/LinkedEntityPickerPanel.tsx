/**
 * פאנל בחירת-הישות ל"מקושר אל" — אותו דפוס-פאנל-צידי כמו AddQuestionsPanel:
 * חיפוש-טקסט + סינון-מחלקה, רשימת תוצאות תואמת exam_type, בחירה יחידה.
 */
import { useMemo, useState } from 'react'
import { Icon, IconButton, Loader } from '@/components/ui'
import type { ExamType } from '@/lib/constants/enums'
import { EXAM_TYPE_META } from '../constants'
import {
  EMPTY_LINKABLE_FILTERS,
  filterLinkableEntities,
  type LinkableEntity,
} from '../services/entityLinkPicker'
import { FilterSelect } from './fields'

export function LinkedEntityPickerPanel({
  examType,
  entities,
  isLoading,
  isError,
  categories,
  selectedId,
  onSelect,
  onClose,
}: {
  examType: ExamType
  entities: LinkableEntity[]
  isLoading: boolean
  isError: boolean
  categories: string[]
  selectedId: string | null
  onSelect: (entity: LinkableEntity) => void
  onClose: () => void
}) {
  const [filters, setFilters] = useState(EMPTY_LINKABLE_FILTERS)
  const meta = EXAM_TYPE_META[examType]
  const results = useMemo(
    () => filterLinkableEntities(entities, filters),
    [entities, filters],
  )
  const patch = (p: Partial<typeof filters>) =>
    setFilters((f) => ({ ...f, ...p }))

  return (
    <div className="fixed inset-0 z-60 flex justify-start">
      <button
        type="button"
        aria-label="סגור"
        onClick={onClose}
        className="absolute inset-0 bg-neutrals-charcoal/40 backdrop-blur-sm"
      />
      <aside
        className="relative flex h-full w-full max-w-full flex-col bg-white shadow-menu sm:w-[420px]"
        role="dialog"
        aria-modal="true"
        aria-label={meta.linkLabel}
      >
        {/* head */}
        <div className="flex-none border-b border-neutrals-silver p-6 pb-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-hues-sky text-accent">
                <Icon name="Link" size={19} />
              </span>
              <div>
                <h2 className="text-h4 font-semibold text-neutrals-charcoal">
                  {meta.linkLabel}
                </h2>
                <span className="text-[12px] text-neutrals-nickel">
                  בחירת {meta.short} לשיוך המבחן
                </span>
              </div>
            </div>
            <IconButton
              variant="outline"
              size="md"
              aria-label="סגור"
              onClick={onClose}
            >
              <Icon name="Close" size={18} />
            </IconButton>
          </div>

          <div className="mb-3">
            <input
              value={filters.search}
              onChange={(e) => patch({ search: e.target.value })}
              placeholder={`חיפוש ${meta.short}…`}
              className="h-10 w-full rounded-lg border border-neutrals-silver bg-white px-3 text-small text-neutrals-charcoal outline-none focus:border-accent"
            />
          </div>
          <FilterSelect
            label="מחלקה"
            value={filters.department}
            onChange={(department) => patch({ department })}
            options={categories.map((c) => ({ value: c, label: c }))}
          />
        </div>

        {/* results */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader label="טוען…" />
            </div>
          )}
          {isError && (
            <div className="py-8 text-center text-small text-caution">
              שגיאה בטעינת הרשימה. נסו שוב.
            </div>
          )}
          {!isLoading && !isError && results.length === 0 && (
            <div className="py-8 text-center text-small text-neutrals-lead">
              לא נמצאו תוצאות תואמות.
            </div>
          )}
          {!isLoading &&
            !isError &&
            results.map((item) => {
              const isSelected = item.id === selectedId
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className={`flex items-center justify-between gap-3 rounded-lg border-[1.5px] p-3 text-start transition-colors ${
                    isSelected
                      ? 'border-accent bg-hues-sky'
                      : 'border-neutrals-silver bg-white hover:border-neutrals-palladium'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-small font-semibold text-neutrals-charcoal">
                      {item.title}
                    </div>
                    {item.kind !== 'track' && (
                      <div className="mt-0.5 truncate text-[12px] text-neutrals-nickel">
                        {item.trackTitles.length > 1
                          ? `משותף · ${item.trackTitles.join(' · ')}`
                          : item.trackTitles[0]}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <Icon
                      name="Check"
                      size={16}
                      className="flex-none text-accent"
                    />
                  )}
                </button>
              )
            })}
        </div>
      </aside>
    </div>
  )
}
