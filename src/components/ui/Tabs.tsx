import { type ReactNode } from 'react'

export interface TabItem {
  id: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

interface TabsProps {
  tabs: TabItem[]
  value: string
  onChange: (id: string) => void
  variant?: 'underline' | 'pill'
}

export function Tabs({
  tabs,
  value,
  onChange,
  variant = 'underline',
}: TabsProps) {
  if (variant === 'pill') {
    return (
      <div className="inline-flex items-center gap-1 p-1 rounded-full bg-neutrals-whisper font-sans">
        {tabs.map((tab) => {
          const active = tab.id === value
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-small font-semibold transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${
                active
                  ? 'bg-white text-accent shadow-sm'
                  : 'bg-transparent text-neutrals-lead hover:text-neutrals-charcoal'
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              {tab.label}
            </button>
          )
        })}
      </div>
    )
  }

  // Figma "02 - New Tabs": text 18px. Selected = 600 + charcoal + 4px gradient underline.
  // Hover = 400 + accent. Default = 400 + charcoal. Icon+label gap 10px.
  return (
    <div className="flex items-end gap-8 font-sans">
      {tabs.map((tab) => {
        const active = tab.id === value
        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            className="group flex flex-col items-stretch gap-0.5 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span
              className={`inline-flex items-center justify-center gap-2.5 text-body transition-colors duration-150 ${
                active
                  ? 'font-semibold text-neutrals-charcoal'
                  : 'font-normal text-neutrals-charcoal group-hover:text-accent'
              }`}
            >
              {tab.label}
              {tab.icon && (
                <span className="shrink-0 w-[17px] h-[17px]">{tab.icon}</span>
              )}
            </span>
            <span
              className={`h-1 rounded-full ${active ? 'bg-accent-gradient' : 'bg-transparent'}`}
            />
          </button>
        )
      })}
    </div>
  )
}
