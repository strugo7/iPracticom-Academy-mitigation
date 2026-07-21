/** SHA-256 → hex. משמש לגיבוב טוקני-הזמנה (נשמר hash בלבד — CLAUDE.md §5). */
export async function sha256Hex(raw: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
