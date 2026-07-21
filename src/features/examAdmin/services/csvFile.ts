/**
 * הורדת קובץ-CSV בדפדפן (side-effect). מוסיף BOM כדי ש-Excel יזהה UTF-8 (עברית).
 * מבודד מהלוגיקה הטהורה (csv.ts/questionCsv.ts) כדי שאלה יישארו נבדקים.
 */
export function downloadCsv(filename: string, csvText: string): void {
  const blob = new Blob([`﻿${csvText}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
