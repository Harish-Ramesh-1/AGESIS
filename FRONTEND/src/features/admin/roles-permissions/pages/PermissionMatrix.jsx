import { useEffect } from 'react'
import { Grid3x3 } from 'lucide-react'
import { usePermissionMatrixStore } from '../store/permissionMatrixStore'
import { PERMISSION_MODULES, PERMISSION_ROLES } from '../services/rolesPermissionsService'
import PageHeaderSimple from '../components/PageHeaderSimple'
import RoleTable from '../components/RoleTable'
import GlassCard from '../../../../components/common/GlassCard'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'

const LEVEL_VARIANT = { none: 'neutral', view: 'info', edit: 'warning', full: 'success' }
const LEVEL_LABEL = { none: 'None', view: 'View', edit: 'Edit', full: 'Full' }

function LevelBadge({ level }) {
  return <Badge variant={LEVEL_VARIANT[level] ?? 'neutral'}>{LEVEL_LABEL[level] ?? 'None'}</Badge>
}

export default function PermissionMatrix() {
  const status = usePermissionMatrixStore((state) => state.status)
  const error = usePermissionMatrixStore((state) => state.error)
  const matrix = usePermissionMatrixStore((state) => state.matrix)
  const fetchMatrix = usePermissionMatrixStore((state) => state.fetchMatrix)

  useEffect(() => {
    fetchMatrix()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rows = matrix
    ? PERMISSION_MODULES.map((moduleName) => ({
        id: moduleName,
        module: moduleName,
        ...matrix[moduleName],
      }))
    : []

  const columns = [
    { key: 'module', header: 'Module' },
    ...PERMISSION_ROLES.map((role) => ({
      key: role,
      header: role,
      render: (row) => <LevelBadge level={row[role]} />,
    })),
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Permission Matrix" />

      <div aria-live="polite" className="sr-only">
        Permission matrix loaded for {PERMISSION_ROLES.length} roles across {PERMISSION_MODULES.length} modules.
      </div>

      <GlassCard
        title="Access Levels by Role"
        description="Each cell shows the access level a role has for a given module."
        action={
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {Object.entries(LEVEL_LABEL).map(([level, label]) => (
              <span key={level} className="flex items-center gap-1.5">
                <Badge variant={LEVEL_VARIANT[level]}>{label}</Badge>
              </span>
            ))}
          </div>
        }
      >
        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchMatrix} />}

        {status === 'success' && (
          <RoleTable
            columns={columns}
            rows={rows}
            titleKey="module"
            trailingKey={PERMISSION_ROLES[0]}
            emptyIcon={Grid3x3}
            emptyTitle="No permission data"
            emptyMessage="The permission matrix could not be loaded."
          />
        )}
      </GlassCard>
    </div>
  )
}
