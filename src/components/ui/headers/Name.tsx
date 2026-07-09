type NameState = 'default' | 'error'

interface NameProps {
  state?: NameState
  title?: string
  tag?: string
  warning?: string
}

/* Icon/Edit — exact Figma vector (node 4149:30033), 24x24 viewBox, fill #9EA5AD (nickel). */
function EditIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.5 16.375V19.5H7.625L16.8417 10.2833L13.7167 7.15834L4.5 16.375ZM19.2583 7.86667C19.5833 7.54168 19.5833 7.01668 19.2583 6.69167L17.3083 4.74167C16.9833 4.41667 16.4583 4.41667 16.1333 4.74167L14.6083 6.26667L17.7333 9.39167L19.2583 7.86667Z"
        fill="#9EA5AD"
      />
    </svg>
  )
}

/* 02 - Tags instance — green status pill */
function StatusTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-[40px] bg-[#DDFFEA] px-[9px] h-6">
      <span className="text-[15px] font-sans text-success leading-none">
        {label}
      </span>
    </span>
  )
}

/* Icon / Error — 16x16, #C94236 */
function ErrorIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 1.333A6.667 6.667 0 1 0 8 14.667 6.667 6.667 0 0 0 8 1.333Zm.667 10H7.333v-1.333h1.334v1.333Zm0-2.666H7.333V4.667h1.334v4Z"
        fill="#C94236"
      />
    </svg>
  )
}

export function Name({
  state = 'default',
  title = 'נתב 1',
  tag = 'פעיל',
  warning = 'שם כבר תפוס, יש לבחור שם אחר',
}: NameProps) {
  const titleColor =
    state === 'error' ? 'text-caution' : 'text-neutrals-charcoal'
  return (
    <div className="inline-flex flex-col gap-2" dir="rtl">
      <div className="inline-flex items-center gap-[15px]">
        <span className={`text-h1 font-sans leading-none ${titleColor}`}>
          {title}
        </span>
        <StatusTag label={tag} />
        {state === 'default' && <EditIcon />}
      </div>
      {state === 'error' && (
        <div className="inline-flex items-center gap-2">
          <span className="text-tiny font-sans text-caution leading-none">
            {warning}
          </span>
          <ErrorIcon />
        </div>
      )}
    </div>
  )
}
