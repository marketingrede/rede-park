import AuditLog from '#models/audit_log'
import type User from '#models/user'

type AuditParams = {
  user?: User | null
  action: string
  entityType?: string
  entityId?: number
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  ip?: string
}

export async function auditLog(params: AuditParams): Promise<void> {
  try {
    await AuditLog.create({
      userId: params.user?.id ?? null,
      action: params.action,
      entityType: params.entityType ?? null,
      entityId: params.entityId ?? null,
      oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
      newValues: params.newValues ? JSON.stringify(params.newValues) : null,
      ipAddress: params.ip ?? null,
    })
  } catch (error) {
    console.warn('Falha ao gravar auditoria', { err: error, action: params.action })
  }
}
