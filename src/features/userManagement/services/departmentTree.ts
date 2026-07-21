/**
 * מבנה ארגוני — פונקציות טהורות על Department[] (היררכיה דרך parent_id).
 * שיוך-חברים לפי התאמת-שם מול User.department (ראו הערת linkage ב-entities.ts),
 * לא לפי id — לכן memberCount נגזר כאן ולא מאוחסן על הישות.
 */
import type { Department, User } from '@/types/entities'
import type { DepartmentTreeNode } from '../types'

function sortBySiblingOrder(a: Department, b: Department): number {
  return (a.order_index ?? 0) - (b.order_index ?? 0) || a.name.localeCompare(b.name, 'he')
}

export function childrenOf(departments: Department[], parentId: string | null): Department[] {
  return departments.filter((d) => (d.parent_id ?? null) === parentId).sort(sortBySiblingOrder)
}

export function memberCounts(departments: Department[], users: User[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const dept of departments) {
    counts.set(
      dept.id,
      users.filter((u) => u.department === dept.name).length,
    )
  }
  return counts
}

/** רשימה שטוחה בסדר-תצוגה (DFS), מכבדת מצב-הרחבה; שורשים = parent_id null. */
export function buildDepartmentTree(
  departments: Department[],
  expanded: ReadonlySet<string>,
  counts: Map<string, number>,
): DepartmentTreeNode[] {
  const rows: DepartmentTreeNode[] = []
  const walk = (parentId: string | null, depth: number) => {
    for (const dept of childrenOf(departments, parentId)) {
      const kids = childrenOf(departments, dept.id)
      rows.push({
        department: dept,
        depth,
        hasChildren: kids.length > 0,
        memberCount: counts.get(dept.id) ?? 0,
      })
      if (kids.length > 0 && expanded.has(dept.id)) walk(dept.id, depth + 1)
    }
  }
  walk(null, 0)
  return rows
}

/** כל צאצאי-המחלקה (ישירים+עקיפים) — למניעת מעגל בבורר מחלקת-אב. */
export function descendantIds(departments: Department[], id: string): Set<string> {
  const result = new Set<string>()
  const walk = (parentId: string) => {
    for (const child of childrenOf(departments, parentId)) {
      result.add(child.id)
      walk(child.id)
    }
  }
  walk(id)
  return result
}

/** מועמדי מחלקת-אב תקינים בעריכה — לא עצמה ולא אחד מצאצאיה (מונע מעגל). */
export function validParentCandidates(departments: Department[], excludeId: string | null): Department[] {
  if (!excludeId) return departments
  const excluded = descendantIds(departments, excludeId)
  excluded.add(excludeId)
  return departments.filter((d) => !excluded.has(d.id))
}

/** נתיב-פירורי-לחם משורש עד המחלקה הנבחרת (שמות, לא id). */
export function departmentPath(departments: Department[], id: string): string[] {
  const byId = new Map(departments.map((d) => [d.id, d]))
  const path: string[] = []
  let current: Department | undefined = byId.get(id)
  while (current) {
    path.unshift(current.name)
    current = current.parent_id ? byId.get(current.parent_id) : undefined
  }
  return path
}
