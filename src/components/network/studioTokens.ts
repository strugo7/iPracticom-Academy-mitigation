/**
 * פלטת ה"סטודיו" הכהה של עורך-הטופולוגיה (שלב 6.4b). ה-DS הוא בהיר; המסך הזה
 * מעוצב כהה ב-design-export/Network Canvas.dc.html — הערכים כאן נגזרים ממנו
 * 1:1 (לא מומצאים), ומרוכזים כדי שלא יתפזרו כמחרוזות-קסם בקוד (CLAUDE.md §4).
 */
export const STUDIO = {
  stageBg: '#181D24', // רקע הקנבס (neutral-charcoal)
  panelBg: '#20262F', // aside/inspector
  fieldBg: '#161B22', // שדות קלט
  nodeBg: '#232A33',
  nodeBorder: '#313A45',
  overlayBg: 'rgba(32,38,47,.96)', // פאנלים צפים (פלטה/זום)
  overlayBorder: 'rgba(255,255,255,.09)',
  divider: 'rgba(255,255,255,.07)',
  textPrimary: '#FFFFFF',
  textStrong: '#D2DAE3',
  textMuted: '#AEB9C6',
  textDim: '#8A97A6',
  textFaint: '#6C7787',
  iconIdle: '#C3CDD8',
  accentSky: '#7CCBFF', // הדגשות (אינדיגו-בהיר) בסטודיו הכהה
  nodeGlow: '0 4px 14px rgba(0,0,0,.3)',
  nodeGlowSelected: '0 10px 30px rgba(0,117,219,.45), 0 0 0 4px rgba(46,180,255,.18)',
  selectedGradient: 'linear-gradient(135deg,#0075DB,#2EB4FF)',
} as const
