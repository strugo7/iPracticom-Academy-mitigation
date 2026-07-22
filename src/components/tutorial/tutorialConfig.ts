import type { TutorialConfig } from './types'

export const GLOBAL_APP_TUTORIAL: TutorialConfig = {
  id: 'global-app-tour-v1',
  title: 'סיור מודרך באקדמיית iPracticom',
  steps: [
    {
      id: 'step-welcome',
      title: 'ברוכים הבאים לאקדמיית iPracticom',
      content:
        'מערכת ההכשרה והלמידה הדיגיטלית של הארגון. המערכת מאפשרת קליטה, למידה עצמאית בקצב אישי ומעקב התקדמות שוטף.',
      highlightSelector: null,
      position: 'center',
      tip: 'החזון הוא להחליף הכשרה פרונטלית ארוכה בלמידה דיגיטלית עצמאית ואפקטיבית.',
    },
    {
      id: 'step-sidebar',
      title: 'סרגל הניווט הארגוני',
      content:
        "מכאן ניגשים לכל קטגוריות התוכן: דשבורד, מרכז למידה, מילון מושגים, נהלים, הגדרות ומערכות פנימיות (Fireberry, Priority וכד').",
      highlightSelector: '[data-tutorial="sidebar-nav"]',
      position: 'left',
      tip: 'ניתן לכווץ ולהרחיב את הסרגל בלחיצה בתחתית לשמירה על מרחב עבודה נקי.',
    },
    {
      id: 'step-search',
      title: 'שורת החיפוש וסרגל הפקודות (⌘K)',
      content:
        'מנוע חיפוש מהיר המאפשר לאתר בלחיצה אחת שיעורים, מושגים מתוך המילון, נהלים ומערכות פנים-ארגוניות.',
      highlightSelector: '[data-tutorial="search-bar"]',
      position: 'bottom',
      tip: 'לחצו ⌘K (ב-Mac) או Ctrl+K (ב-Windows) מכל מקום במערכת לפתיחה מיידית.',
    },
    {
      id: 'step-notifications',
      title: 'מרכז ההתראות בזמן אמת',
      content:
        'מעקב אחר נהלים חדשים לקריאה ואישור (קרא וחתום), שיעורים חדשים שנוספו למסלול ומבחני הסמכה זמינים.',
      highlightSelector: '[data-tutorial="notifications-btn"]',
      position: 'bottom',
      tip: 'לחיצה על התראה מעבירה אתכם ישירות למסך הצפייה או לנגן המבחנים.',
    },
    {
      id: 'step-finish',
      title: 'מוכנים להתחיל!',
      content:
        'בכל עת שתרצו לרענן את הזיכרון או לקרוא מדריכים מפורטים, היכנסו למרכז העזרה או לחצו על כפתור העזרה הצף (?).',
      highlightSelector: null,
      position: 'center',
      tip: 'בהצלחה בלמידה!',
    },
  ],
}

export const USERS_MANAGEMENT_TUTORIAL: TutorialConfig = {
  id: 'users-management-v1',
  title: 'מדריך: ניהול משתמשים והרשאות',
  steps: [
    {
      id: 'users-intro',
      title: 'ניהול משתמשים והרשאות ארגוניות',
      content:
        'במסך זה מוגדרים ארבעת תפקידי המערכת (משתמש, מדריך, מנהל, מנהל מערכת), המבנה הארגוני והכלים להזמין ולנהל משתמשים בבטחה.',
      highlightSelector: null,
      position: 'center',
      tip: 'ההרשאות מצטברות מלמטה למעלה — מנהל מערכת מחזיק במלוא ההרשאות.',
    },
    {
      id: 'users-invite',
      title: 'הזמנת משתמשים ומועמדים',
      content:
        'לחצו על "הזמן מועמדים" להזמנת עובדים חדשים. ניתן לשייך אותם למחלקה, לתפקיד ולבחור אם לשלוח להם מבחן כניסה.',
      highlightSelector: '[data-tutorial="invite-users-btn"]',
      position: 'bottom',
      tip: 'מבחן כניסה מומלץ למועמדים חדשים — הנתונים וסיכום ה-AI חוזרים אוטומטית למערכת.',
    },
    {
      id: 'users-table',
      title: 'טבלת משתמשים והגדרת הרשאות',
      content:
        'צפייה בכלל המשתמשים, שינוי תפקיד בלחיצה על תפריט הפעולות (3 נקודות) ועדכון הרשאות מיידי.',
      highlightSelector: '[data-tutorial="users-table"]',
      position: 'top',
      tip: 'שינוי הרשאות נכנס לתוקף באופן מיידי ללא צורך בהתחברות מחדש.',
    },
    {
      id: 'users-view-as',
      title: 'פיצ׳ר "צפה בתור" (View As)',
      content:
        'מנהלי מערכת יכולים לדמות תצוגת משתמש בתפקיד אחר כדי לבדוק שהרשאות הגישה מוגדרות כראוי.',
      highlightSelector: '[data-tutorial="view-as-section"]',
      position: 'top',
      tip: 'לחצו "אפס תצוגה" כדי לחזור לתצוגת מנהל המערכת המלאה שלכם.',
    },
  ],
}

export const SECURITY_SETTINGS_TUTORIAL: TutorialConfig = {
  id: 'security-settings-v1',
  title: 'מדריך: אבטחה והגדרות מערכת',
  steps: [
    {
      id: 'security-intro',
      title: 'אבטחה והעדפות מערכת',
      content:
        'הגדרת מדיניות ההתחברות לאקדמיה: דומיינים מורשים, הגבלות כתובות IP ורשימת אימיילים מורשים (Whitelist).',
      highlightSelector: null,
      position: 'center',
      tip: 'הגבלות אבטחה מגנות על תכני האקדמיה ומונעות גישה מכתובות לא מורשות.',
    },
    {
      id: 'security-domains',
      title: 'כתובות מייל ודומיינים מורשים',
      content:
        'הגדרת הדומיינים המורשים להתחברות (למשל company.co.il). רק משתמשים בדומיין זה יוכלו להיכנס.',
      highlightSelector: '[data-tutorial="allowed-domains-section"]',
      position: 'bottom',
      tip: 'חובה שיישאר לפחות דומיין מורשה אחד פעיל במערכת בכל עת.',
    },
    {
      id: 'security-ip',
      title: 'הגבלת טווחי IP (VPN / משרד)',
      content:
        'הגבלת הגישה לכתובות IP מסוימות או לטווח ה-VPN הארגוני לשכבת הגנה נוספת.',
      highlightSelector: '[data-tutorial="ip-range-section"]',
      position: 'top',
      tip: 'ברגע שמוגדר טווח IP אחד, הגישה מותרת מטווחים אלו בלבד.',
    },
  ],
}

export const CONTENT_MANAGER_TUTORIAL: TutorialConfig = {
  id: 'content-manager-v1',
  title: 'מדריך: ניהול תוכן ועורך שיעורים',
  steps: [
    {
      id: 'content-intro',
      title: 'ניהול תוכן ועורך שיעורים',
      content:
        'המרכז לבנייה ועריכה של מסלולי הלמידה באקדמיה: היררכיית התוכן (מסלול ← מודול ← נושא ← שיעור), עורך הבלוקים וסוכן ה-AI.',
      highlightSelector: null,
      position: 'center',
      tip: 'בנו את השיעור מבלוקים קטנים ועצמאיים במקום גוש טקסט ארוך.',
    },
    {
      id: 'content-tree',
      title: 'עץ התוכן והיררכיית הלמידה',
      content:
        'צפייה במבנה העץ של האקדמיה, הוספת נושאים ושיעורים חדשים ושינוי סדר ההופעה בגרירה.',
      highlightSelector: '[data-tutorial="content-tree-section"]',
      position: 'left',
      tip: 'שמרו על מבנה היררכי עקבי כדי להקל על הלומדים במסלול.',
    },
    {
      id: 'content-ai-agent',
      title: 'סוכן AI — יצירת שיעורים ממסמכים',
      content:
        'העלאת מסמכי PDF/Word ויצירה אוטומטית של טיוטת שיעור מעוצבת הכוללת תמונות ושאלות.',
      highlightSelector: '[data-tutorial="ai-agent-tab"]',
      position: 'bottom',
      tip: 'סוכן ה-AI מחלץ את הרעיונות המרכזיים ומייצר מבנה שיעור מוכן לעריכה.',
    },
  ],
}

export const DASHBOARD_TUTORIAL: TutorialConfig = {
  id: 'dashboard-v1',
  title: 'מדריך: דשבורד מנהלים',
  steps: [
    {
      id: 'dash-intro',
      title: 'דשבורד מעקב ומנהלים',
      content:
        'מעקב חי בזמן אמת אחר קצב התקדמות העובדים והמועמדים: אחוזי השלמה, ציוני מבחנים ואינדיקטורים לעובדים שנתקעו.',
      highlightSelector: null,
      position: 'center',
      tip: 'סטטוס "נתקע" מסומן לעובד שלא ביצע פעילות מעל 14 יום.',
    },
    {
      id: 'dash-stats',
      title: 'כרטיסי סטטיסטיקה מרכזיים',
      content:
        'סקירה מהירה של סך העובדים הפעילים, אלו שהשלימו מסלול, מועמדים ממתינים והערכות כניסה.',
      highlightSelector: '[data-tutorial="dashboard-stats-grid"]',
      position: 'bottom',
      tip: 'הנתונים מסתננים אוטומטית בהתאם למחלקה שבאחריותכם.',
    },
    {
      id: 'dash-employee-list',
      title: 'סרגל עובדים ופרופיל מפורט',
      content:
        'בחירת עובד מהרשימה מציגה את פרופיל הלמידה המלא שלו, המודולים שהשלים וציוני המבחנים.',
      highlightSelector: '[data-tutorial="dashboard-employee-list"]',
      position: 'right',
      tip: 'לחצו "חזור לתצוגה כללית" לשוב לסקירת כל הפיקוד והצוות בכל רגע.',
    },
  ],
}

export const POLICIES_TUTORIAL: TutorialConfig = {
  id: 'policies-v1',
  title: 'מדריך: נהלים ואישור קרא-וחתום',
  steps: [
    {
      id: 'policy-intro',
      title: 'ספריית הנהלים הארגונית',
      content:
        'ניהול וקריאה של נהלי העבודה בארגון (בטיחות, אבטחת מידע, תפעול). נהלים מסוימים דורשים אישור "קרא וחתום".',
      highlightSelector: null,
      position: 'center',
      tip: 'קריאת הנהלים היא חובה רגולטורית להשלמת ההסמכה.',
    },
    {
      id: 'policy-reader',
      title: 'עמוד קריאת הנוהל וסרגל ההתקדמות',
      content:
        'מעקב אחר אחוז קריאת המסמך בזמן אמת. המערכת מוודאת גלילה מלאה עד סוף הקובץ.',
      highlightSelector: '[data-tutorial="policy-viewer-content"]',
      position: 'top',
      tip: 'תוכן העניינים הצידי מאפשר מעבר מהיר בין פרקי הנוהל.',
    },
    {
      id: 'policy-acknowledge',
      title: 'פס אישור "קרא וחתום"',
      content:
        'בתחתית הנוהל מופיע פס האישור הסטטי הדורש אישור והחתמה דיגיטלית של העובד על הבנת הנוהל.',
      highlightSelector: '[data-tutorial="policy-acknowledge-bar"]',
      position: 'top',
      tip: 'לאחר האישור, הסטטוס מתעדכן אוטומטית בתיק העובד ובדשבורד המנהל.',
    },
  ],
}

export const TROUBLESHOOTING_TUTORIAL: TutorialConfig = {
  id: 'troubleshooting-v1',
  title: 'מדריך: פתרון בעיות ותסריטים',
  steps: [
    {
      id: 'trouble-intro',
      title: 'ספריית תסריטי פתרון בעיות',
      content:
        'ספריית תסריטי שיחה מונחים ועץ זרימה לפתרון מבוקר של תקלות טכניות (מרכזיות ענן, ציוד קצה, תקשורת).',
      highlightSelector: null,
      position: 'center',
      tip: 'תסריטי הזרימה מנחים את הנציג צעד-אחר-צעד עד לפתרון המלא.',
    },
    {
      id: 'trouble-filter',
      title: 'חיפוש וסינון תסריטים',
      content:
        'חיפוש לפי מילות מפתח, קטגוריה, רמת קושי ותגיות למציאת התסריט הרלוונטי תוך שניות.',
      highlightSelector: '[data-tutorial="flow-filter-bar"]',
      position: 'bottom',
      tip: 'לחצו "נקה סינון" לחזרה לתצוגת ברירת המחדל של הספרייה.',
    },
  ],
}

export const PROFILE_TUTORIAL: TutorialConfig = {
  id: 'profile-v1',
  title: 'מדריך: הפרופיל שלי',
  steps: [
    {
      id: 'profile-intro',
      title: 'הפרופיל האישי וההישגים',
      content:
        'ריכוז הפרטים האישיים, נקודות ה-XP שצברתם, מעגלי התקדמות בלמידה ורשימת התעודות שהושגו.',
      highlightSelector: null,
      position: 'center',
      tip: 'תמונת פרופיל עדכנית עוזרת למנהלים ולמדריכים לזהות אתכם בדשבורד.',
    },
    {
      id: 'profile-stats',
      title: 'מעגלי התקדמות ו-XP',
      content:
        'מעקב אחר אחוזי השלמת השיעורים, המבחנים וההתקדמות הכללית במסלול המשויך אליכם.',
      highlightSelector: '[data-tutorial="profile-stats-section"]',
      position: 'bottom',
      tip: 'עקבו אחר מעגל ההתקדמות הכללית לדעת כמה נשאר עד לסיום המסלול.',
    },
  ],
}

export function getTutorialForRoute(pathname: string): TutorialConfig | null {
  // 1. ניהול משתמשים והרשאות
  if (pathname === '/settings/users') {
    return USERS_MANAGEMENT_TUTORIAL
  }

  // 2. אבטחת התחברות
  if (pathname === '/settings' || pathname === '/settings/security') {
    return SECURITY_SETTINGS_TUTORIAL
  }

  // 3. סקשנים נוספים בהגדרות שעדיין אין עבורם מדריך ספציפי (גיוס וקליטה, מיתוג, ברירות מחדל וכד')
  if (pathname.startsWith('/settings/')) {
    return null
  }

  // 4. דשבורד מנהלים
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/manager')) {
    return DASHBOARD_TUTORIAL
  }

  // 5. ניהול תוכן ועורך שיעורים
  if (
    pathname.startsWith('/content-manager') ||
    pathname.startsWith('/lessons')
  ) {
    return CONTENT_MANAGER_TUTORIAL
  }

  // 6. פתרון בעיות ותסריטים
  if (pathname.startsWith('/troubleshooting')) {
    return TROUBLESHOOTING_TUTORIAL
  }

  // 7. נהלים וקרא-וחתום
  if (pathname.startsWith('/policies')) {
    return POLICIES_TUTORIAL
  }

  // 8. הפרופיל שלי
  if (pathname.startsWith('/profile')) {
    return PROFILE_TUTORIAL
  }

  // אין מדריך ספציפי לעמוד זה
  return null
}

export function getPageTitleForRoute(pathname: string): string {
  if (pathname === '/settings/recruitment') return 'הגדרות מערכת — גיוס וקליטה'
  if (pathname === '/settings/branding') return 'הגדרות מערכת — מיתוג ועיצוב'
  if (pathname === '/settings/defaults') return 'הגדרות מערכת — ברירות מחדל'
  if (pathname === '/settings/integrations') return 'הגדרות מערכת — אינטגרציות'
  if (pathname === '/settings/login-logs') return 'הגדרות מערכת — יומני התחברות'
  if (pathname === '/settings/documents') return 'הגדרות מערכת — מסמכים ו-PDF'
  if (pathname === '/settings/users') return 'הגדרות מערכת — ניהול משתמשים'
  if (pathname === '/settings/security' || pathname === '/settings')
    return 'הגדרות מערכת — אבטחת התחברות'
  if (pathname.startsWith('/media-library')) return 'ספריית המדיה'
  if (pathname.startsWith('/recycle-bin')) return 'פח אשפה'
  if (pathname.startsWith('/question-bank')) return 'מאגר שאלות'
  if (pathname.startsWith('/recruitment')) return 'גיוס וקליטת מועמדים'
  if (pathname.startsWith('/trainings')) return 'מסלולי למידה'
  if (pathname.startsWith('/help')) return 'מרכז עזרה'

  return `עמוד מערכת (${pathname})`
}
