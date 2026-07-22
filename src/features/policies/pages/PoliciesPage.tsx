/**
 * עמוד הנהלים — /policies (מאחורי canManageContent). מארח שני מצבים באותו מסך
 * (design-export/Policies.dc.html): ספריית הנהלים (library) ומעקב קרא-וחתום
 * (tracking). יושב בתוך AppShell (SideNav+TopBar מהמעטפת) ולכן משתמש ב-<section>.
 * העמוד מרכיב UI בלבד: הנתונים והסינון מ-usePolicies; המעקב ב-PolicyTrackingView.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Icon,
  Loader,
  ToastStack,
  ZeroStates,
} from '@/components/ui'
import { canManageContent, isManager, useAuth } from '@/lib/auth'
import { useToasts } from '@/lib/hooks/useToasts'
import { PoliciesToolbar } from '../components/PoliciesToolbar'
import { PolicyDeleteDialog } from '../components/PolicyDeleteDialog'
import { PolicyRow } from '../components/PolicyRow'
import { PolicyTrackingView } from '../components/PolicyTrackingView'
import { useDeletePolicy } from '../hooks/useDeletePolicy'
import { usePolicies } from '../hooks/usePolicies'
import { POLICIES_VIEW, type PoliciesView, type PolicyListItem } from '../types'

export function PoliciesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const gallery = usePolicies()
  const { toasts, notify } = useToasts()
  const deletePolicy = useDeletePolicy()
  const canEdit = Boolean(user && canManageContent(user))
  // מחיקה — מנהל בלבד (הרשאה מחמירה יותר מעריכה).
  const canDelete = Boolean(user && isManager(user))
  const [view, setView] = useState<PoliciesView>(POLICIES_VIEW.library)
  const [trackingId, setTrackingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<PolicyListItem | null>(null)

  const confirmDelete = (reason: string) => {
    if (!deleting) return
    deletePolicy.mutate(
      { procedureId: deleting.id, reason },
      {
        onSuccess: () => {
          notify('success', `הנוהל «${deleting.title}» נמחק ותועד`)
          setDeleting(null)
        },
        onError: () => notify('error', 'מחיקת הנוהל נכשלה'),
      },
    )
  }

  const openPolicy = (policy: PolicyListItem) => {
    setTrackingId(policy.id)
    setView(POLICIES_VIEW.tracking)
  }

  const backToLibrary = () => {
    setView(POLICIES_VIEW.library)
    setTrackingId(null)
  }

  if (view === POLICIES_VIEW.tracking && trackingId) {
    return (
      <section className="p-6">
        <PolicyTrackingView procedureId={trackingId} onBack={backToLibrary} />
      </section>
    )
  }

  if (gallery.isLoading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </section>
    )
  }

  if (gallery.isError) {
    return (
      <section className="p-6">
        <Alert kind="error" title="טעינת הנהלים נכשלה">
          <div className="flex items-center gap-3">
            <span>לא הצלחנו לטעון את רשימת הנהלים.</span>
            <Button variant="outlined" onClick={() => gallery.refetch()}>
              נסה שוב
            </Button>
          </div>
        </Alert>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h2 font-semibold text-neutrals-charcoal">
            נהלים
          </h1>
          <p className="mt-1 text-small text-neutrals-lead">
            ניהול נהלים ארגוניים · קרא וחתום
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outlined"
            leadingIcon={<Icon name="Upload" size={17} />}
            onClick={() => navigate('/policies/new?mode=upload')}
          >
            העלה נוהל
          </Button>
          <Button
            variant="primary"
            leadingIcon={<Icon name="Edit" size={17} />}
            onClick={() => navigate('/policies/new')}
          >
            כתוב נוהל
          </Button>
        </div>
      </header>

      {gallery.total === 0 ? (
        <ZeroStates
          title="עדיין אין נהלים"
          cta="כתיבת נוהל ראשון"
          onCreate={() => navigate('/policies/new')}
        />
      ) : (
        <>
          <PoliciesToolbar
            filters={gallery.filters}
            categories={gallery.categories}
            departments={gallery.departments}
            onChange={gallery.patchFilters}
          />

          {gallery.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutrals-silver bg-white p-10 text-center text-small text-neutrals-lead">
              לא נמצאו נהלים התואמים לסינון.
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-2.5">
              {gallery.items.map((policy) => (
                <PolicyRow
                  key={policy.id}
                  policy={policy}
                  onOpen={openPolicy}
                  onView={(p) => navigate(`/policies/${p.id}`)}
                  onEdit={(p) => navigate(`/policies/${p.id}/edit`)}
                  onDelete={setDeleting}
                  canEdit={canEdit}
                  canDelete={canDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      {deleting && (
        <PolicyDeleteDialog
          policy={deleting}
          isDeleting={deletePolicy.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}

      <ToastStack toasts={toasts} />
    </section>
  )
}
