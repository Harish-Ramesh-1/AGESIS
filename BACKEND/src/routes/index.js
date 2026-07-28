import { Router } from 'express'
import { authRouter } from '../modules/auth/auth.routes.js'
import { studentsRouter } from '../modules/students/students.routes.js'
import { feesRouter } from '../modules/fees/fees.routes.js'
import { duesRouter } from '../modules/dues/dues.routes.js'
import { documentsRouter } from '../modules/documents/documents.routes.js'
import { paymentsRouter } from '../modules/payments/payments.routes.js'
import { notificationsRouter } from '../modules/notifications/notifications.routes.js'
import { reportsRouter } from '../modules/reports/reports.routes.js'
import { dashboardRouter } from '../modules/dashboard/dashboard.routes.js'
import { supportRouter } from '../modules/support/support.routes.js'
import { rewardsRouter } from '../modules/rewards/rewards.routes.js'
import { auditRouter } from '../modules/audit/audit.routes.js'
import { settingsRouter } from '../modules/settings/settings.routes.js'
import { adminUsersRouter } from '../modules/admin-users/users.routes.js'
import { schoolRouter } from '../modules/admin-school/school.routes.js'
import { systemSettingsRouter } from '../modules/admin-settings/systemSettings.routes.js'
import { securityRouter } from '../modules/admin-security/security.routes.js'
import { integrationsRouter } from '../modules/admin-integrations/integrations.routes.js'
import { backupRouter } from '../modules/admin-backup/backup.routes.js'
import { aiInsightsRouter } from '../modules/admin-ai/aiInsights.routes.js'
import { requireAuth, requirePortal } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/response.js'
import { supabaseAdmin } from '../config/supabaseClient.js'

export const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/students', studentsRouter)
apiRouter.use('/fees', feesRouter)
apiRouter.use('/dues', duesRouter)
apiRouter.use('/documents', documentsRouter)
apiRouter.use('/payments', paymentsRouter)
apiRouter.use('/notifications', notificationsRouter)
apiRouter.use('/reports', reportsRouter)
apiRouter.use('/dashboard', dashboardRouter)
apiRouter.use('/support', supportRouter)
apiRouter.use('/rewards', rewardsRouter)
apiRouter.use('/audit-logs', auditRouter)
apiRouter.use('/settings', settingsRouter)

// Admin / management portal
apiRouter.use('/admin/users', adminUsersRouter)
apiRouter.use('/admin/school', schoolRouter)
apiRouter.use('/admin/settings', systemSettingsRouter)
apiRouter.use('/admin/security', securityRouter)
apiRouter.use('/admin/integrations', integrationsRouter)
apiRouter.use('/admin/backup', backupRouter)
apiRouter.use('/admin/ai-insights', aiInsightsRouter)

// FAQs shared lookup used by admin fee-structure/school screens for class/section options
apiRouter.get(
  '/meta/classes-sections',
  requireAuth,
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('classes_sections').select('*').order('class_name')
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)
