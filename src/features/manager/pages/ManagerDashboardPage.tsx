/**
 * דשבורד ניהול מחלקה — /manager (doc 10). קריאה בלבד מ-useDepartmentProgress
 * (Phase 1 §12, מסונן ל-managed_department בשכבת ה-service) — אותו מנוע
 * שמזין את הדשבורד האישי, כדי שהמספרים יהיו עקביים בין המסכים (CLAUDE.md,
 * "כל המספרים מאותו מקור-אמת").
 *
 * בורר-התקופה (שבוע/חודש/הכל) שבבריף המקורי לא ממומש בשלב הזה: המנוע
 * (PROGRESS_ENGINE.md §12) מסכם all-time בלבד, ואין תמיכה תת-שכבתית
 * לאגרגציה תקופתית — בורר שלא היה פועל הוא UI מת, ולכן הושמט במודע.
 */
import { useMemo, useState } from 'react'
import { Alert, Button, Icon, Loader } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { useDepartmentProgress } from '@/lib/hooks/useDepartmentProgress'
import { AtRiskPanel } from '../components/AtRiskPanel'
import { DeptKpiRow } from '../components/DeptKpiRow'
import { EmployeeComparisonChart } from '../components/EmployeeComparisonChart'
import { EmployeeDrilldown } from '../components/EmployeeDrilldown'
import { TeamTable } from '../components/TeamTable'
import { downloadTeamProgressCsv } from '../services/exportTeamProgress'
import {
  assembleManagerDashboard,
  buildComparisonBars,
} from '../services/managerDashboardService'
import type { ComparisonMetric } from '../types'

const PAGE_CONTAINER =
  'mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-8 pb-12 pt-[26px]'

export function ManagerDashboardPage() {
  const { user } = useAuth()
  const departmentProgress = useDepartmentProgress(user?.id)
  const now = useMemo(() => new Date(), [])
  const [metric, setMetric] = useState<ComparisonMetric>('progress')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const viewModel = useMemo(
    () =>
      departmentProgress.data
        ? assembleManagerDashboard(departmentProgress.data, now)
        : undefined,
    [departmentProgress.data, now],
  )

  if (!user) return null

  if (departmentProgress.isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader label="טוען את דשבורד הניהול..." />
      </div>
    )
  }

  if (departmentProgress.isError || !viewModel) {
    return (
      <div className={PAGE_CONTAINER}>
        <Alert kind="error" title="שגיאה בטעינת נתוני המחלקה">
          לא הצלחנו לטעון את נתוני המחלקה. נסה לרענן את הדף.
        </Alert>
      </div>
    )
  }

  const bars = buildComparisonBars(viewModel.rows, metric)
  const selectedRow = viewModel.rows.find((r) => r.userId === selectedUserId)

  return (
    <div className={PAGE_CONTAINER}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-h4 font-semibold text-neutrals-charcoal">
          סקירת מחלקה
        </h2>
        <Button
          variant="primary"
          leadingIcon={<Icon name="Export" size={17} />}
          onClick={() =>
            downloadTeamProgressCsv(viewModel.departmentName, viewModel.rows)
          }
        >
          ייצוא דוח
        </Button>
      </div>

      {viewModel.rows.length === 0 ? (
        <Alert kind="info" title="אין עדיין עובדים במחלקה">
          כשמשתמשים ישויכו למחלקה {viewModel.departmentName}, הנתונים שלהם
          יופיעו כאן.
        </Alert>
      ) : (
        <>
          <DeptKpiRow kpis={viewModel.kpis} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
            <EmployeeComparisonChart
              bars={bars}
              metric={metric}
              onMetricChange={setMetric}
              onSelectEmployee={setSelectedUserId}
            />
            <AtRiskPanel
              members={viewModel.atRisk}
              onSelectEmployee={setSelectedUserId}
            />
          </div>

          <TeamTable rows={viewModel.rows} onSelectEmployee={setSelectedUserId} />
        </>
      )}

      {selectedRow && (
        <EmployeeDrilldown
          row={selectedRow}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  )
}
