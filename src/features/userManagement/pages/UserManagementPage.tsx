/**
 * ניהול משתמשים ומבנה ארגוני — /users, admin בלבד (מסמך 26, שלב 9.1).
 * יושב בתוך AppShell (SideNav+TopBar מהמעטפת, כמו שאר דפי-הניהול).
 * שני חלונות: עץ מחלקות (ימין, ננעל ל-lg+) + הגדרות-מחלקה/טבלת-חברים
 * (שמאל) — עם מגירת-מובייל לעץ מתחת ל-lg.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Button,
  Icon,
  IconButton,
  Loader,
  ToastStack,
} from '@/components/ui'
import { useToasts } from '@/lib/hooks/useToasts'
import type { User } from '@/types/entities'
import {
  buildDepartmentTree,
  departmentPath,
  memberCounts,
  validParentCandidates,
} from '../services/departmentTree'
import {
  managerCandidates,
  membersOfDepartment,
} from '../services/userDirectoryService'
import { pendingInvitesForDepartment } from '../services/inviteService'
import { useDepartmentMutations } from '../hooks/useDepartmentMutations'
import { useDepartments, useDirectoryUsers } from '../hooks/useUserDirectory'
import { useEntranceExams } from '../hooks/useEntranceExams'
import { useInviteMutations, useInvites } from '../hooks/useInvites'
import { useNotificationActions } from '../hooks/useNotificationActions'
import { useUserMutations } from '../hooks/useUserMutations'
import {
  DepartmentFormDialog,
  type DepartmentFormValue,
} from '../components/DepartmentFormDialog'
import { DepartmentSettingsCard } from '../components/DepartmentSettingsCard'
import { DepartmentTree } from '../components/DepartmentTree'
import { InviteModal } from '../components/InviteModal'
import { MobileTreeDrawer } from '../components/MobileTreeDrawer'
import { OrgChartIcon, InvitePersonIcon } from '../icons'
import { UserDetailDrawer } from '../components/UserDetailDrawer'
import { UserTable } from '../components/UserTable'
import type { InviteDraft } from '../types'

type DeptDialogState =
  | { mode: 'create-root' }
  | { mode: 'create-sub'; parentId: string }
  | { mode: 'edit'; departmentId: string }

export function UserManagementPage() {
  const departmentsQuery = useDepartments()
  const usersQuery = useDirectoryUsers()
  const invitesQuery = useInvites()
  const entranceExams = useEntranceExams()

  const departments = departmentsQuery.data ?? []
  const users = usersQuery.data ?? []
  const invites = invitesQuery.data ?? []

  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [mobileTreeOpen, setMobileTreeOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [deptDialog, setDeptDialog] = useState<DeptDialogState | null>(null)

  const { toasts, notify } = useToasts()
  const userMutations = useUserMutations()
  const deptMutations = useDepartmentMutations(users)
  const inviteMutations = useInviteMutations()
  const notificationActions = useNotificationActions()

  const didInitExpand = useRef(false)
  useEffect(() => {
    if (didInitExpand.current || departments.length === 0) return
    didInitExpand.current = true
    const withChildren = departments.filter((d) =>
      departments.some((c) => c.parent_id === d.id),
    )
    setExpandedIds(new Set(withChildren.map((d) => d.id)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departments.length])

  const counts = useMemo(
    () => memberCounts(departments, users),
    [departments, users],
  )
  const treeNodes = useMemo(
    () => buildDepartmentTree(departments, expandedIds, counts),
    [departments, expandedIds, counts],
  )

  const effectiveSelectedId =
    selectedDeptId ?? treeNodes[0]?.department.id ?? null
  const selectedDepartment =
    departments.find((d) => d.id === effectiveSelectedId) ?? null

  const path = selectedDepartment
    ? departmentPath(departments, selectedDepartment.id)
    : []
  const members = useMemo(
    () =>
      selectedDepartment ? membersOfDepartment(users, selectedDepartment) : [],
    [selectedDepartment, users],
  )
  const currentManager =
    users.find(
      (u) =>
        selectedDepartment && u.managed_department === selectedDepartment.name,
    ) ?? null
  const candidates = useMemo(
    () => managerCandidates(members, currentManager?.id ?? null, users),
    [members, currentManager, users],
  )

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase()
    const list = term
      ? members.filter(
          (m) =>
            m.full_name.toLowerCase().includes(term) ||
            m.email.toLowerCase().includes(term),
        )
      : members
    return list.map((user) => ({
      user,
      isDepartmentManager: user.id === currentManager?.id,
    }))
  }, [members, search, currentManager])

  const departmentInvites = selectedDepartment
    ? pendingInvitesForDepartment(invites, selectedDepartment.name)
    : []

  const userPendingInvite = selectedUser
    ? (invites.find(
        (inv) =>
          inv.type === 'user' &&
          inv.email === selectedUser.email &&
          (inv.status === 'pending' || inv.status === 'started'),
      ) ?? null)
    : null

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const selectDepartment = (id: string) => {
    setSelectedDeptId(id)
    setSearch('')
  }

  const handleAssignManager = async (nextManagerId: string | null) => {
    if (!selectedDepartment) return
    await userMutations.assignManager(
      selectedDepartment,
      currentManager?.id ?? null,
      nextManagerId,
    )
    notify('success', 'שיוך מנהל המחלקה עודכן')
  }

  const handleCreateInvite = async (draft: InviteDraft) => {
    if (!selectedDepartment) return
    await inviteMutations.create({
      email: draft.email,
      fullName: draft.fullName,
      department: selectedDepartment.name,
      role: draft.role,
    })
  }

  const handleDeptSave = async (value: DepartmentFormValue) => {
    if (!deptDialog) return
    if (deptDialog.mode === 'edit') {
      const dept = departments.find((d) => d.id === deptDialog.departmentId)
      if (!dept) return
      await deptMutations.update(dept, {
        name: value.name,
        parentId: value.parentId,
        description: value.description || null,
      })
      notify('success', 'פרטי המחלקה עודכנו')
    } else {
      const parentId =
        deptDialog.mode === 'create-sub' ? deptDialog.parentId : value.parentId
      const siblingCount = departments.filter(
        (d) => (d.parent_id ?? null) === parentId,
      ).length
      const created = await deptMutations.create({
        name: value.name,
        parentId,
        orderIndex: siblingCount,
        description: value.description || null,
      })
      notify('success', 'המחלקה נוצרה בהצלחה')
      setSelectedDeptId(created.id)
      if (parentId) setExpandedIds((prev) => new Set(prev).add(parentId))
    }
    setDeptDialog(null)
  }

  if (departmentsQuery.isPending || usersQuery.isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader label="טוען את ניהול המשתמשים…" />
      </div>
    )
  }

  if (departmentsQuery.isError || usersQuery.isError) {
    return (
      <div className="p-8">
        <Alert kind="error" title="שגיאה בטעינת ניהול המשתמשים">
          לא הצלחנו לטעון את המבנה הארגוני והמשתמשים. נסו לרענן את הדף.
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-none flex-wrap items-center justify-end gap-2 border-b border-neutrals-silver bg-white px-6 py-4">
        <IconButton
          variant="outline"
          size="md"
          aria-label="מחלקות"
          onClick={() => setMobileTreeOpen(true)}
          className="lg:hidden"
        >
          <OrgChartIcon size={20} />
        </IconButton>
        <Button
          variant="outlined"
          leadingIcon={<Icon name="Plus" size={16} />}
          onClick={() => setDeptDialog({ mode: 'create-root' })}
        >
          מחלקה חדשה
        </Button>
        <span data-tutorial="invite-users-btn">
          <Button
            variant="primary"
            leadingIcon={<InvitePersonIcon size={16} />}
            disabled={!selectedDepartment}
            onClick={() => setInviteOpen(true)}
          >
            הזמן משתמש
          </Button>
        </span>
      </div>

      <div className="flex flex-1 min-h-0 flex-row">
        <aside
          aria-label="עץ מחלקות"
          className="hidden w-[312px] flex-none flex-col overflow-y-auto border-e border-neutrals-silver bg-white lg:flex"
        >
          <div className="flex flex-none items-center justify-between gap-2 px-4 pb-3 pt-4">
            <h2 className="m-0 flex items-center gap-2 text-small font-semibold text-neutrals-charcoal">
              <OrgChartIcon size={17} className="text-accent" />
              מבנה ארגוני
            </h2>
            <span className="rounded-full bg-hues-sky px-2.5 py-1 text-tiny font-semibold text-hues-cobalt">
              {departments.length} מחלקות
            </span>
          </div>
          <DepartmentTree
            nodes={treeNodes}
            selectedId={effectiveSelectedId}
            expandedIds={expandedIds}
            onSelect={selectDepartment}
            onToggle={toggleExpand}
            onAddSub={(parentId) =>
              setDeptDialog({ mode: 'create-sub', parentId })
            }
          />
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto">
          {selectedDepartment ? (
            <div className="mx-auto max-w-[980px] px-6 py-6">
              <DepartmentSettingsCard
                department={selectedDepartment}
                path={path}
                memberCount={members.length}
                candidates={candidates}
                currentManager={currentManager}
                onAssignManager={handleAssignManager}
                onEdit={() =>
                  setDeptDialog({
                    mode: 'edit',
                    departmentId: selectedDepartment.id,
                  })
                }
              />
              <UserTable
                members={filteredMembers}
                search={search}
                onSearchChange={setSearch}
                onOpenUser={setSelectedUser}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-10 text-center text-neutrals-nickel">
              אין עדיין מחלקות — צרו מחלקה ראשונה כדי להתחיל.
            </div>
          )}
        </main>
      </div>

      <MobileTreeDrawer
        open={mobileTreeOpen}
        nodes={treeNodes}
        selectedId={effectiveSelectedId}
        expandedIds={expandedIds}
        onSelect={selectDepartment}
        onToggle={toggleExpand}
        onAddSub={(parentId) => setDeptDialog({ mode: 'create-sub', parentId })}
        onClose={() => setMobileTreeOpen(false)}
      />

      {selectedUser && selectedDepartment && (
        <UserDetailDrawer
          user={selectedUser}
          department={selectedDepartment}
          isDepartmentManager={selectedUser.id === currentManager?.id}
          entranceExamOptions={entranceExams.options}
          pendingInvite={userPendingInvite}
          onClose={() => setSelectedUser(null)}
          onRoleChange={async (role) => {
            await userMutations.setRole(selectedUser.id, role)
            setSelectedUser((u) => (u ? { ...u, role } : u))
            notify('success', 'התפקיד עודכן')
          }}
          onToggleActive={async (active) => {
            await userMutations.setActive(selectedUser.id, active)
            setSelectedUser((u) =>
              u ? { ...u, disabled: active ? null : true } : u,
            )
            notify('success', active ? 'המשתמש הופעל' : 'המשתמש הושבת')
          }}
          onSendExam={async (exam) => {
            await notificationActions.sendExam(selectedUser.id, exam)
            notify('success', `מבחן הכניסה נשלח · ${exam.title ?? ''}`)
          }}
          onSendMessage={async (message) => {
            await notificationActions.sendMessage(selectedUser.id, message)
            notify('success', 'ההודעה נשלחה כהתראה במערכת')
          }}
          onResendInvite={async (invite) => {
            await inviteMutations.resend(invite)
            notify('success', 'ההזמנה נשלחה שוב למייל')
          }}
        />
      )}

      {inviteOpen && selectedDepartment && (
        <InviteModal
          department={selectedDepartment}
          createdInvite={
            inviteMutations.createdInvite
              ? {
                  invite: inviteMutations.createdInvite.invite,
                  magicLink: inviteMutations.createdInvite.magicLink,
                }
              : null
          }
          isCreating={inviteMutations.isCreating}
          pendingInvites={departmentInvites}
          onCreate={handleCreateInvite}
          onResend={async (invite) => {
            await inviteMutations.resend(invite)
            notify('success', 'ההזמנה נשלחה שוב')
          }}
          onCancel={async (inviteId) => {
            await inviteMutations.cancel(inviteId)
            notify('success', 'ההזמנה בוטלה')
          }}
          onClose={() => {
            setInviteOpen(false)
            inviteMutations.resetCreate()
          }}
          notify={(message) => notify('success', message)}
        />
      )}

      {deptDialog && (
        <DepartmentFormDialog
          mode={deptDialog.mode === 'edit' ? 'edit' : 'create'}
          fixedParent={
            deptDialog.mode === 'create-sub'
              ? (departments.find((d) => d.id === deptDialog.parentId) ?? null)
              : null
          }
          parentOptions={validParentCandidates(
            departments,
            deptDialog.mode === 'edit' ? deptDialog.departmentId : null,
          )}
          initialValue={
            deptDialog.mode === 'edit'
              ? (() => {
                  const dept = departments.find(
                    (d) => d.id === deptDialog.departmentId,
                  )
                  return {
                    name: dept?.name ?? '',
                    parentId: dept?.parent_id ?? null,
                    description: dept?.description ?? '',
                  }
                })()
              : {
                  name: '',
                  parentId:
                    deptDialog.mode === 'create-sub'
                      ? deptDialog.parentId
                      : null,
                  description: '',
                }
          }
          isSaving={deptMutations.isPending}
          onSave={handleDeptSave}
          onClose={() => setDeptDialog(null)}
        />
      )}

      <ToastStack toasts={toasts} />
    </div>
  )
}
