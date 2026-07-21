/**
 * מחרוזות UI (עברית) של רכיבי-הרשת המשותפים (components/network) — פאנל-הסוויץ',
 * תצוגת-הלומד והמקרא. מרוכזות כאן כדי שהרכיבים המשותפים לא יתלו ב-constants של
 * feature כלשהו (גבולות CLAUDE.md §8).
 */
export const NET_STRINGS = {
  // switch panel
  switchPanel: 'ניהול הסוויץ׳',
  portsActive: (active: number, total: number) => `${active} / ${total} פעילים`,
  port: 'פורט',
  connectedTo: 'מחובר ל',
  status: 'סטטוס',
  portActive: 'פעיל',
  noPorts: 'אין רכיבים מחוברים לסוויץ׳',
  // learner viewer (מסמך 25 §B)
  viewerBanner: 'תצוגה אינטראקטיבית — לחצו על רכיב לצפייה בהגדרותיו',
  viewerEmpty: 'לא הוגדרה טופולוגיית רשת',
  fullscreen: 'מסך מלא',
  exitFullscreen: 'סגור מסך מלא',
  close: 'סגור',
  legend: 'מקרא',
  legendDevices: 'רכיבים',
  legendVlans: 'רשתות VLAN',
  deviceDetails: 'פרטי הרכיב',
  ip: 'כתובת IP',
  subnet: 'Subnet',
} as const
