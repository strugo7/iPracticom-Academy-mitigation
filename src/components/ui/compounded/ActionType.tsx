// Figma set "Action Type" (1374:1803) — the IVR Action Item Element configured for each
// concrete action. Every variant is an instance of the same card (radius 8, white, left
// #C9EDFF accent bar, charcoal Dial badge) differing by the chosen action label/content:
//   Route, Record, SMS, Whatsapp, Inner, outer, To Action Item — full body cards (120–154 tall)
//   Back, Back To main — short header-only cards (70 tall).
// We reproduce them on top of <ActionItem> by mapping the variant to its label + height.

import { ActionItem } from './ActionItem'

export type ActionTypeVariant =
  | 'route'
  | 'record'
  | 'sms'
  | 'whatsapp'
  | 'inner'
  | 'outer'
  | 'toActionItem'
  | 'back'
  | 'backToMain'

interface ActionTypeProps {
  variant?: ActionTypeVariant
  digit?: number | string
}

const labelMap: Record<ActionTypeVariant, string> = {
  route: 'נתב',
  record: 'הקלטה',
  sms: 'סמס',
  whatsapp: 'WhatsApp',
  inner: 'יעד פנימי',
  outer: 'יעד חיצוני',
  toActionItem: 'העברה לפריט',
  back: 'חזרה לשלב קודם',
  backToMain: 'חזרה לתפריט ראשי',
}

// Left accent-bar color per Action Type (Figma 1374:1803).
const accentMap: Record<ActionTypeVariant, string> = {
  route: 'bg-hues-sky', // #C9EDFF
  record: 'bg-hues-salmon', // #F5ACA3
  sms: 'bg-hues-green', // #51D5A5
  whatsapp: 'bg-hues-mint', // #BBFFD6
  inner: 'bg-hues-yellow', // #F1C21B
  outer: 'bg-[#C5A3F5]',
  toActionItem: 'bg-[#FFB7ED]',
  back: 'bg-neutrals-nickel', // #9EA5AD
  backToMain: 'bg-neutrals-nickel', // #9EA5AD
}

const noteMap: Partial<Record<ActionTypeVariant, string>> = {
  route: 'הקש 1 לניתוב למוקד המכירות',
  record: 'הודעת ההקלטה תושמע למתקשר',
  sms: 'תוכן ההודעה שתישלח אוטומטית',
  whatsapp: 'תוכן הודעת ה-Whatsapp',
  inner: 'מספר השלוחה הפנימית',
  outer: 'מספר היעד החיצוני',
  toActionItem: 'בחר את פריט הפעולה הבא',
}

export function ActionType({ variant = 'route', digit = 1 }: ActionTypeProps) {
  // Back / Back To main are header-only (zero) cards: real label, nickel accent bar, NO dial.
  if (variant === 'back' || variant === 'backToMain') {
    return (
      <ActionItem
        state="zero"
        zeroLabel={labelMap[variant]}
        showDial={false}
        accentClass={accentMap[variant]}
      />
    )
  }
  return (
    <ActionItem
      state="default"
      digit={digit}
      label={labelMap[variant]}
      fieldText={noteMap[variant] ?? 'בחרו או צרפו הקלטה'}
      accentClass={accentMap[variant]}
    />
  )
}
