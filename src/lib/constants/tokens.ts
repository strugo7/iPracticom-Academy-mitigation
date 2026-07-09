/**
 * טוקני עיצוב — מראה JS של מערכת העיצוב, לשימוש בקוד (recharts, קנבס, SVG)
 * שבו אין class של Tailwind. מקור-אמת: DesignSystem/tailwind.config.ts.
 * הערכים ב-@theme של index.css זהים לאלה — אין להמציא כאן ערך. 1:1 עם ה-DS.
 */

export const colors = {
  neutrals: {
    charcoal: '#181D24',
    lead: '#757D86',
    nickel: '#9EA5AD',
    palladium: '#BCC3CB',
    silver: '#E1E6EC',
    whisper: '#F2F5F8',
  },
  functional: {
    accent: '#0075DB',
    caution: '#C94236',
    success: '#00857C',
    warning: '#F1C21B',
    focus: '#8E7057',
    neutral: '#9EA5AD',
  },
  hues: {
    bronze: '#8E7057',
    cobalt: '#004E9B',
    denim: '#0075DB',
    green: '#51D5A5',
    indigo: '#2EB4FF',
    latte: '#BCA28D',
    mint: '#BBFFD6',
    red: '#C94236',
    salmon: '#F5ACA3',
    sky: '#C9EDFF',
    strawberry: '#AD2120',
    teal: '#00857C',
    yellow: '#F1C21B',
  },
  charcoal: '#181D24',
  white: '#FFFFFF',
} as const

/** גרדיאנט המותג (DesignSystem/index.css — 45deg #33B1FF → #282FEF). */
export const accentGradient = 'linear-gradient(45deg, #33B1FF 0%, #282FEF 100%)'

/** אפקט Figma "Card" (drop-shadow 0/11/30, #040D37 @ 5%). */
export const shadowCard = '0px 11px 30px 0px rgba(4, 13, 55, 0.05)'

export const font = {
  sans: '"Ploni ML v2 AAA", "Heebo", sans-serif',
} as const

/** סקאלת טיפוגרפיה (size/lineHeight) — 1:1 עם fontSize ב-DS. */
export const typography = {
  h1: {
    size: '44px',
    lineHeight: '48px',
    letterSpacing: '-0.37px',
    weight: 400,
  },
  h2: {
    size: '36px',
    lineHeight: '45px',
    letterSpacing: '-0.30px',
    weight: 400,
  },
  h3: {
    size: '28px',
    lineHeight: '35px',
    letterSpacing: '-0.23px',
    weight: 400,
  },
  h4: { size: '23px', lineHeight: '32px', weight: 400 },
  body: { size: '18px', lineHeight: '24px', weight: 400 },
  bodyBold: { size: '18px', lineHeight: '24px', weight: 600 },
  small: { size: '16px', lineHeight: '20px', weight: 400 },
  tiny: { size: '14px', lineHeight: '20px', weight: 400 },
  tinyBold: { size: '14px', lineHeight: '20px', weight: 600 },
} as const
