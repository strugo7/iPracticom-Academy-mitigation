/**
 * עורך כרטיסי-זיכרון (שלב 6.4, מסמך 21 §2) — תצוגת-לומד חיה (FlashcardBlock של
 * הנגן, WYSIWYG) מעל אזור-עריכה: שורה לכל כרטיס עם צד-קדמי/אחורי, הוסף/מחק/סדר
 * בגרירה. הצדדים מרונדרים כ-HTML בנגן (sanitizeRichText) ולכן נערכים ב-RichTextField.
 * מבנה תואם design-export/Lesson Editor.dc.html (שורות 412-463).
 */
import { FlashcardBlock } from '@/components/blocks/interactive/FlashcardBlock'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'
import { RichTextField } from '../../richtext/RichTextField'
import { STRINGS } from '../../constants'
import { EditorIcon } from '../../editorIcons'
import {
  addCard,
  moveItem,
  readCards,
  removeCard,
  setCardSide,
} from '../../services/interactiveBlockOps'
import type { BlockEditorProps } from './types'
import { AddItemButton, ChromeHeader, SortableList, SortableRow } from './SortableRows'

export function FlashcardBlockEditor({ data, onChange }: BlockEditorProps) {
  const cards = readCards(data)
  const commit = (next: ReturnType<typeof readCards>) => onChange({ items: next })

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      {cards.length > 0 && (
        <FlashcardBlock
          data={{ items: cards } as ParsedBlockDataMap['flashcard']}
        />
      )}

      <div className="border-t border-dashed border-neutrals-silver pt-4">
        <ChromeHeader
          icon={<EditorIcon name="flashcard" size={15} />}
          label={STRINGS.flashcardEditTitle}
        />

        {cards.length === 0 ? (
          <p className="mb-3 text-[13px] text-neutrals-nickel">{STRINGS.flashcardEmpty}</p>
        ) : (
          <SortableList
            ids={cards.map((_, i) => `card-${i}`)}
            onReorder={(from, to) => commit(moveItem(cards, from, to))}
          >
            {cards.map((card, i) => (
              <SortableRow
                // biome-ignore lint/suspicious/noArrayIndexKey: כרטיסים ללא מזהה יציב (סכמה = {front,back})
                key={i}
                id={`card-${i}`}
                num={i + 1}
                chipClass="bg-hues-sky text-accent"
                dragLabel={STRINGS.cardReorder}
                removeLabel={STRINGS.flashcardRemoveCard}
                onRemove={() => commit(removeCard(cards, i))}
              >
                <div className="grid grid-cols-2 gap-2.5">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10.5px] font-semibold text-neutrals-nickel">
                      {STRINGS.flashcardFront}
                    </span>
                    <div className="rounded-[9px] border border-neutrals-silver bg-white px-2.5 py-2 text-[14px] font-semibold text-neutrals-charcoal">
                      <RichTextField
                        value={card.front}
                        onChange={(v) => commit(setCardSide(cards, i, 'front', v))}
                        placeholder={STRINGS.flashcardFrontPlaceholder}
                        ariaLabel={`${STRINGS.cardNumber(i + 1)} — ${STRINGS.flashcardFront}`}
                      />
                    </div>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10.5px] font-semibold text-neutrals-nickel">
                      {STRINGS.flashcardBack}
                    </span>
                    <div className="rounded-[9px] border border-neutrals-silver bg-white px-2.5 py-2 text-[13.5px] leading-relaxed text-neutrals-lead">
                      <RichTextField
                        value={card.back}
                        onChange={(v) => commit(setCardSide(cards, i, 'back', v))}
                        placeholder={STRINGS.flashcardBackPlaceholder}
                        ariaLabel={`${STRINGS.cardNumber(i + 1)} — ${STRINGS.flashcardBack}`}
                      />
                    </div>
                  </label>
                </div>
              </SortableRow>
            ))}
          </SortableList>
        )}

        <AddItemButton label={STRINGS.flashcardAddCard} onClick={() => commit(addCard(cards))} />
      </div>
    </div>
  )
}
