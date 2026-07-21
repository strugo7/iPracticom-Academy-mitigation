/**
 * ייצוא דוח-צוות ל-CSV (doc 10: "exportTeamProgress" — פורמט CSV; PDF/מודאל-
 * בחירת-פורמט הם איטרציה עתידית, לא בהיקף המסך הבסיסי). הפרדה בין בניית
 * ה-CSV (טהורה, נבדקת) לבין ההורדה (side-effect על ה-DOM).
 */
import type { TeamMemberRow } from '../types'

const STATUS_LABEL: Record<TeamMemberRow['status'], string> = {
  done: 'הושלם',
  active: 'פעיל',
  risk: 'בסיכון',
}

const HEADERS = [
  'שם',
  'מסלול מוקצה',
  'התקדמות %',
  'ציון ממוצע',
  'פעילות אחרונה',
  'סטטוס',
]

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function buildTeamProgressCsv(
  departmentName: string,
  rows: TeamMemberRow[],
): string {
  const lines = [
    `דוח צוות — מחלקת ${departmentName}`,
    HEADERS.join(','),
    ...rows.map((row) =>
      [
        row.fullName,
        row.trackTitle ?? '—',
        String(row.progress),
        row.hasExamAttempt ? String(row.avgScore) : '—',
        row.lastActivityLabel,
        STATUS_LABEL[row.status],
      ]
        .map(escapeCsvCell)
        .join(','),
    ),
  ]
  // BOM כדי ש-Excel יזהה UTF-8 בעברית — code point מפורש, לא תו גולמי בקובץ
  return `${String.fromCharCode(0xfeff)}${lines.join('\n')}`
}

export function downloadTeamProgressCsv(
  departmentName: string,
  rows: TeamMemberRow[],
): void {
  const csv = buildTeamProgressCsv(departmentName, rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `דוח-צוות-${departmentName}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
