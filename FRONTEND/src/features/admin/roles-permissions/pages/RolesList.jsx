import { useEffect } from 'react'
import { Layers, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useRolesListStore } from '../store/rolesListStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import GlassCard from '../../../../components/common/GlassCard'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import { GlassButton } from '../../../../components/common/Button'

export default function RolesList() {
  const status = useRolesListStore((state) => state.status)
  const error = useRolesListStore((state) => state.error)
  const roles = useRolesListStore((state) => state.roles)
  const fetchRoles = useRolesListStore((state) => state.fetchRoles)

  useEffect(() => {
    fetchRoles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Roles List"
        extraControls={
          <GlassButton icon={Plus} aria-label="Create a new role">
            Create Role
          </GlassButton>
        }
      />

      <div aria-live="polite" className="sr-only">
        {roles.length} roles defined.
      </div>

      {status === 'loading' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
      )}

      {status === 'error' && <ErrorState message={error} onRetry={fetchRoles} />}

      {status === 'success' && roles.length === 0 && (
        <EmptyState icon={Layers} title="No roles defined" description="Create a role to start assigning permissions." />
      )}

      {status === 'success' && roles.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <GlassCard key={role.id} title={role.name}>
              <p className="text-sm text-slate-600 dark:text-slate-300">{role.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-4 dark:border-white/10">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  {role.userCount.toLocaleString('en-IN')} users
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={`Edit ${role.name} role`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${role.name} role`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
