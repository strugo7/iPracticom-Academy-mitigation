import { useState, useRef, type ReactNode } from 'react'
import {
  MenuItemCell,
  MenuActionCell,
  PhoneLeftIcon,
  CallForwardingIcon,
  AudioRecordIcon,
  InIcon,
  OutIcon,
  SmsIcon,
  WhatsappIcon,
  CancelForwardIcon,
  SettingsIcon,
  RemoveIcon,
} from './MenuCell'

// Figma "Menu TYpes": composed dropdown menus (card 359w, r=8, border #E1E6EC, white, pad T24/B24, gap 16).
// Shared chrome:
//   header = search input + tabs (gradient underline on active tab). (Title button is hidden in Figma.)
//   footer = divider + [אישור gradient button — right] + [ביטול text button — left].
// Variants (7):
//   Items / Single Selection    — rows: label + count, tag on first row, NO checkbox
//   Items / Multiple Selection   — rows: label + count + checkbox, tag on first row
//   Items / Expandables          — grouped rows with +/- expander
//   Sort  / Single Selection     — "סדר עולה" row (icon + text) between dividers + plain field rows
//   Tags  / Single Selection     — colored tag chips stacked vertically, right-aligned (no tabs)
//   Actions / Single Selection   — bare action-cell list (no header/footer)
//   Favorites / Multiple Selection — search + plain rows + checkbox (no tabs), confirm "סנן"

// ---------- shared chrome ----------

function SearchInput({ placeholder = 'חיפוש' }: { placeholder?: string }) {
  // Figma "New Input": r=8, border #BCC3CB, h-10, placeholder #9EA5AD 18px, search icon #757D86.
  return (
    <div className="px-6">
      <div
        dir="rtl"
        className="flex h-10 items-center gap-2 rounded-lg border border-neutrals-palladium px-4"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          className="text-neutrals-lead shrink-0"
          aria-hidden="true"
        >
          <circle
            cx="10.5"
            cy="10.5"
            r="6.5"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M15.5 15.5L21 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-[18px] text-neutrals-nickel">{placeholder}</span>
      </div>
    </div>
  )
}

const TABS = ['נתב', 'קבוצות', 'שלוחות'] as const

function MenuTabs() {
  const [active, setActive] = useState<string>('שלוחות')
  return (
    <div className="px-6">
      <div dir="rtl" className="flex justify-between gap-6">
        {TABS.map((t) => {
          const on = t === active
          return (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              className="flex flex-col items-center gap-0.5 pb-px"
            >
              <span
                className={`text-[18px] ${on ? 'font-semibold' : 'font-normal'} text-neutrals-charcoal`}
              >
                {t}
              </span>
              <span
                className={`h-1 w-full rounded-full ${on ? 'bg-accent-gradient' : 'bg-transparent'}`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MenuFooter({ confirm = 'אישור' }: { confirm?: string }) {
  // SPACE_BETWEEN row: confirm (gradient) on the LEFT, cancel (text) on the RIGHT.
  return (
    <div className="flex flex-col gap-4">
      <div className="h-px w-full bg-neutrals-silver" />
      <div dir="ltr" className="flex items-center justify-between gap-2.5 px-6">
        {/* CTA — Figma "02 - New Buttons": 36px tall (text leading-20 + py-8). Without an
            explicit line-height the 16px text inherits ~24px leading → 40px, which reads
            too thick. leading-5 (=20px) pins it to the 36px spec. */}
        <button
          type="button"
          className="rounded-[20px] bg-accent-gradient px-6 py-2 text-[16px] font-semibold leading-5 text-white"
        >
          {confirm}
        </button>
        <button type="button" className="text-[16px] leading-5 text-accent">
          ביטול
        </button>
      </div>
    </div>
  )
}

// shell wraps the card + standard vertical rhythm (gap 16, pad T24/B24).
function MenuShell({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      dir="rtl"
      className={`flex w-[359px] flex-col gap-4 rounded-lg border border-neutrals-silver bg-white py-6 font-sans ${className}`}
    >
      {children}
    </div>
  )
}

function MenuHeader({
  search,
  tabs = true,
}: {
  search?: string
  tabs?: boolean
}) {
  return (
    <>
      <SearchInput placeholder={search} />
      {tabs && <MenuTabs />}
    </>
  )
}

// ---------- Items / Single Selection ----------

const ITEM_ROWS = [
  { label: 'מארחות', count: '353' },
  { label: 'קבלה', count: '878' },
  { label: 'הנהלה', count: '707' },
  { label: 'הזמנות', count: '778' },
  { label: 'חשבונות', count: '908' },
]

export function ItemsSingleMenu() {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <MenuShell>
      <MenuHeader />
      <div className="flex flex-col px-2">
        {ITEM_ROWS.map((r, i) => (
          <button
            key={r.label}
            type="button"
            onClick={() => setSelected(r.label)}
            className="block w-full text-right"
          >
            <MenuItemCell
              label={r.label}
              count={r.count}
              tag={i === 0 ? '+2' : undefined}
              selected={selected === r.label}
              fullWidth
            />
          </button>
        ))}
      </div>
      <MenuFooter />
    </MenuShell>
  )
}

// ---------- Items / Multiple Selection ----------

export function ItemsMultipleMenu() {
  const [checked, setChecked] = useState<string[]>([])
  const toggle = (l: string) =>
    setChecked((c) => (c.includes(l) ? c.filter((x) => x !== l) : [...c, l]))
  return (
    <MenuShell>
      <MenuHeader />
      <div className="flex flex-col px-2">
        {ITEM_ROWS.map((r, i) => (
          <button
            key={r.label}
            type="button"
            onClick={() => toggle(r.label)}
            className="block w-full text-right"
          >
            <MenuItemCell
              label={r.label}
              count={r.count}
              tag={i === 0 ? '+2' : undefined}
              selected={checked.includes(r.label)}
              checkbox
              fullWidth
            />
          </button>
        ))}
      </div>
      <MenuFooter />
    </MenuShell>
  )
}

// ---------- Items / Expandables ----------

const EXP_GROUPS = [
  { group: 'שם קבוצה', items: ['ערך 1', 'ערך 2', 'ערך 3', 'ערך 4'] },
  { group: 'שם קבוצה', items: ['ערך 1', 'ערך 2'] },
  { group: 'שם קבוצה', items: ['ערך 1'] },
]

export function ItemsExpandablesMenu() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <MenuShell>
      <MenuHeader />
      <div className="flex flex-col gap-px px-[26px]">
        {EXP_GROUPS.map((g, gi) => {
          const isOpen = open === gi
          return (
            <div
              key={gi}
              className={
                isOpen
                  ? 'overflow-hidden rounded border border-neutrals-silver'
                  : ''
              }
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : gi)}
                className="block w-full text-right"
              >
                <MenuItemCell
                  label={g.group}
                  count="629"
                  state={isOpen ? 'expanded' : 'default'}
                  expander={isOpen ? 'minus' : 'plus'}
                  checkbox
                  fullWidth
                />
              </button>
              {isOpen &&
                g.items.map((it) => (
                  <MenuItemCell
                    key={it}
                    label={it}
                    count="629"
                    state="hover"
                    checkbox
                    fullWidth
                  />
                ))}
            </div>
          )
        })}
      </div>
      <MenuFooter />
    </MenuShell>
  )
}

// ---------- Sort / Single Selection ----------

const SORT_FIELDS = ['תאריך', 'נושא', 'סוג', 'פעולה', 'תדירות']

export function SortMenu() {
  const [selected, setSelected] = useState('תאריך')
  return (
    <MenuShell>
      <SearchInput placeholder="חיפוש ערך" />
      {/* "סדר עולה" row: full-width top+bottom divider lines (#E1E6EC), blue text (right) + A-Z sort icon (left). No toggle. */}
      <div
        dir="rtl"
        className="flex h-10 items-center gap-2 border-y border-neutrals-silver px-6"
      >
        <span className="flex-1 text-[16px] text-accent">סדר עולה</span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-accent shrink-0"
          aria-hidden="true"
        >
          <text x="1" y="9" fontSize="8" fontWeight="700" fill="currentColor">
            A
          </text>
          <text x="1" y="20" fontSize="8" fontWeight="700" fill="currentColor">
            Z
          </text>
          <path
            d="M16 4v15M16 19l-3-3M16 19l3-3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col px-2">
        {SORT_FIELDS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setSelected(f)}
            className="block w-full text-right"
          >
            <MenuItemCell label={f} selected={selected === f} fullWidth />
          </button>
        ))}
      </div>
      <MenuFooter confirm="מיון" />
    </MenuShell>
  )
}

// ---------- Tags / Single Selection ----------

// Solid (filled) plus glyph — used for the "add new tag" affordance.
function PlusSolid({ className = '' }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M8.9 3H7.1v4.1H3v1.8h4.1V13h1.8V8.9H13V7.1H8.9V3z"
        fill="currentColor"
      />
    </svg>
  )
}

const TAGS: { id: number; label: string; bg: string; text: string }[] = [
  { id: 1, label: 'בשיחה', bg: 'bg-[#FFDCD8]', text: 'text-caution' },
  { id: 2, label: 'בזמינות', bg: 'bg-[#DDFFEA]', text: 'text-success' },
  {
    id: 3,
    label: 'הפסקה',
    bg: 'bg-neutrals-silver',
    text: 'text-neutrals-lead',
  },
  { id: 4, label: 'משימה', bg: 'bg-[#FFEBA4]', text: 'text-[#8B700E]' },
  { id: 5, label: 'שם תגית', bg: 'bg-hues-sky', text: 'text-accent' },
]

// Swatch palette mirrors the Tags colors (chip bg + matching text + swatch dot).
const TAG_PALETTE = [
  { bg: 'bg-[#FFDCD8]', text: 'text-caution', dot: '#FFDCD8' },
  { bg: 'bg-[#DDFFEA]', text: 'text-success', dot: '#DDFFEA' },
  { bg: 'bg-neutrals-silver', text: 'text-neutrals-lead', dot: '#E1E6EC' },
  { bg: 'bg-[#FFEBA4]', text: 'text-[#8B700E]', dot: '#FFEBA4' },
  { bg: 'bg-hues-sky', text: 'text-accent', dot: '#C9EDFF' },
]

// Selection mode: the create-a-tag path is the SEARCH field (Figma input carries a hidden
// "+ הוספת חדש" affordance). Typing a name that doesn't exist reveals a create button.
export function TagsMenu() {
  const [tags, setTags] = useState(TAGS)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  // when the user starts a create, we reveal a colour picker before adding the tag
  const [picking, setPicking] = useState(false)
  const nextId = useRef(6)
  const q = query.trim()
  const filtered = q ? tags.filter((t) => t.label.includes(q)) : tags
  const canCreate = q.length > 0 && !tags.some((t) => t.label === q)
  const setSearch = (v: string) => {
    setQuery(v)
    setPicking(false) // typing again restarts the flow
  }
  const createWith = (paletteIdx: number) => {
    const p = TAG_PALETTE[paletteIdx]
    const id = nextId.current++
    setTags((ts) => [...ts, { id, label: q, bg: p.bg, text: p.text }])
    setSelected(id)
    setQuery('')
    setPicking(false)
  }
  return (
    <MenuShell>
      {/* search / create field */}
      <div className="flex flex-col gap-2 px-6">
        <div
          dir="rtl"
          className="flex h-10 items-center gap-2 rounded-lg border border-neutrals-palladium px-4"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0 text-neutrals-lead"
            aria-hidden="true"
          >
            <circle
              cx="10.5"
              cy="10.5"
              r="6.5"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M15.5 15.5L21 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            value={query}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && canCreate && setPicking(true)
            }
            placeholder="חיפוש או הוספת תגית"
            className="flex-1 bg-transparent text-[18px] text-neutrals-charcoal placeholder:text-neutrals-nickel outline-none"
          />
        </div>
        {/* step 1 — reveal the create action while typing a new name */}
        {canCreate && !picking && (
          <button
            type="button"
            onClick={() => setPicking(true)}
            dir="rtl"
            className="flex items-center gap-2 text-[15px] text-accent"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-gradient text-white">
              <PlusSolid />
            </span>
            הוספת תגית
          </button>
        )}
        {/* step 2 — choose a colour, which creates the tag */}
        {canCreate && picking && (
          <div dir="rtl" className="flex items-center gap-2">
            <span className="text-[15px] text-neutrals-lead">בחרו צבע:</span>
            {TAG_PALETTE.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => createWith(i)}
                aria-label={`צבע ${i + 1}`}
                className="h-6 w-6 rounded-full border border-neutrals-silver transition-transform hover:scale-110"
                style={{ backgroundColor: p.dot }}
              />
            ))}
          </div>
        )}
      </div>
      {/* tag chips — click to select (single) */}
      <div dir="rtl" className="flex flex-col items-start gap-2 px-[26px]">
        {filtered.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelected(t.id)}
            className={`inline-flex h-6 items-center rounded-full px-[9px] ${t.bg} ${
              selected === t.id ? 'ring-2 ring-accent ring-offset-1' : ''
            }`}
          >
            <span className={`text-[15px] ${t.text}`}>{t.label}</span>
          </button>
        ))}
      </div>
      <MenuFooter />
    </MenuShell>
  )
}

// ---------- Tags / Single Selection — interactive (add / remove tags) ----------

type TagItem = { id: number; label: string; color: number }

export function TagsMenuInteractive() {
  const [tags, setTags] = useState<TagItem[]>([
    { id: 1, label: 'בשיחה', color: 0 },
    { id: 2, label: 'בזמינות', color: 1 },
    { id: 3, label: 'הפסקה', color: 2 },
  ])
  const [selected, setSelected] = useState<number | null>(2)
  const [draft, setDraft] = useState('')
  const [color, setColor] = useState(3)
  const nextId = useRef(4)

  const addTag = () => {
    const label = draft.trim()
    if (!label) return
    const id = nextId.current++
    setTags((t) => [...t, { id, label, color }])
    setSelected(id)
    setDraft('')
  }
  const removeTag = (id: number) => {
    setTags((t) => t.filter((x) => x.id !== id))
    setSelected((s) => (s === id ? null : s))
  }

  return (
    <MenuShell>
      {/* existing tags — click to select (single), × to remove */}
      <div dir="rtl" className="flex flex-col items-start gap-2 px-[26px]">
        {tags.length === 0 && (
          <span className="text-[15px] text-neutrals-nickel">
            אין תגיות — הוסיפו תגית חדשה למטה
          </span>
        )}
        {tags.map((t) => {
          const p = TAG_PALETTE[t.color]
          const on = selected === t.id
          return (
            <span
              key={t.id}
              className={`group inline-flex items-center gap-1.5 rounded-full px-[9px] h-6 ${p.bg} ${
                on ? 'ring-2 ring-accent ring-offset-1' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => setSelected(t.id)}
                className={`text-[15px] ${p.text}`}
              >
                {t.label}
              </button>
              <button
                type="button"
                onClick={() => removeTag(t.id)}
                aria-label={`הסרת ${t.label}`}
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${p.text} opacity-60 hover:opacity-100`}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 2l6 6M8 2l-6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </span>
          )
        })}
      </div>

      {/* add-tag row: color swatches + text input + add button */}
      <div className="h-px w-full bg-neutrals-silver" />
      <div dir="rtl" className="flex flex-col gap-3 px-[26px]">
        <div className="flex items-center gap-2">
          {TAG_PALETTE.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setColor(i)}
              aria-label={`צבע ${i + 1}`}
              className={`h-6 w-6 rounded-full border ${
                color === i
                  ? 'border-accent ring-2 ring-accent ring-offset-1'
                  : 'border-neutrals-silver'
              }`}
              style={{ backgroundColor: p.dot }}
            />
          ))}
        </div>
        <div
          dir="rtl"
          className="flex h-10 items-center gap-2 rounded-lg border border-neutrals-palladium px-4"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
            placeholder="שם תגית חדשה"
            className="flex-1 bg-transparent text-[18px] text-neutrals-charcoal placeholder:text-neutrals-nickel outline-none"
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!draft.trim()}
            aria-label="הוספת תגית"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-gradient text-white disabled:opacity-40"
          >
            <PlusSolid />
          </button>
        </div>
      </div>
      <MenuFooter />
    </MenuShell>
  )
}

// ---------- Favorites / Multiple Selection ----------

const FAV_ROWS = ['ערך 1', 'ערך 2', 'ערך 3', 'ערך 4', 'ערך 5']

export function FavoritesMultipleMenu() {
  const [checked, setChecked] = useState<string[]>([])
  const toggle = (l: string) =>
    setChecked((c) => (c.includes(l) ? c.filter((x) => x !== l) : [...c, l]))
  return (
    <MenuShell>
      <SearchInput placeholder="חיפוש ערך" />
      <div className="flex flex-col px-2">
        {FAV_ROWS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => toggle(r)}
            className="block w-full text-right"
          >
            <MenuItemCell
              label={r}
              selected={checked.includes(r)}
              checkbox
              fullWidth
            />
          </button>
        ))}
      </div>
      <MenuFooter confirm="סנן" />
    </MenuShell>
  )
}

// ---------- Actions / Single Selection ----------

// Each row has its OWN leading icon (1:1 with Figma Actions/Single Selection).
const ACTIONS: { label: string; icon: ReactNode }[] = [
  { label: 'עריכה', icon: <PhoneLeftIcon /> },
  { label: 'העברת שיחה', icon: <CallForwardingIcon /> },
  { label: 'הקלטה', icon: <AudioRecordIcon /> },
  { label: 'יעד פנימי', icon: <InIcon /> },
  { label: 'יעד חיצוני', icon: <OutIcon /> },
  { label: 'סמס', icon: <SmsIcon /> },
  { label: 'ווצאפ', icon: <WhatsappIcon /> },
  { label: 'ביטול העברת שיחות', icon: <CancelForwardIcon /> },
  { label: 'הגדרות', icon: <SettingsIcon /> },
]

export function ActionsMenu() {
  return (
    <div
      dir="rtl"
      className="flex w-[359px] flex-col divide-y divide-neutrals-silver overflow-hidden rounded-lg border border-neutrals-silver bg-white font-sans"
    >
      {ACTIONS.map((a) => (
        <MenuActionCell key={a.label} label={a.label} icon={a.icon} fullWidth />
      ))}
      <MenuActionCell
        label="מחיקה"
        icon={<RemoveIcon />}
        color="red"
        fullWidth
      />
    </div>
  )
}
