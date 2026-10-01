import { randomUUID } from 'node:crypto'
import { Request } from 'express'
import pool from '../../config/db'
import { AuditLogRow } from '../../types/database'

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'status'

/**
 * Enregistre une action d'administration.
 *
 * Volontairement silencieux en cas d'échec : le journal ne doit jamais faire
 * échouer l'opération métier qui vient de réussir.
 */
export async function recordAudit(
  req: Request,
  action: AuditAction,
  entity: string,
  entityId?: string | null,
  summary?: string | null,
) {
  try {
    await pool.execute(
      `INSERT INTO admin_audit_log (id, user_id, user_email, action, entity, entity_id, summary, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        req.user?.userId ?? null,
        req.user?.email ?? 'inconnu',
        action,
        entity,
        entityId ?? null,
        summary?.slice(0, 500) ?? null,
        (req.ip || '').slice(0, 64) || null,
      ],
    )
  } catch (error) {
    console.warn('[audit] écriture impossible :', (error as Error).message)
  }
}

export async function listAuditLog(filters: { entity?: string; action?: string; limit?: number }) {
  const conditions: string[] = []
  const values: unknown[] = []
  if (filters.entity) { conditions.push('entity = ?'); values.push(filters.entity) }
  if (filters.action) { conditions.push('action = ?'); values.push(filters.action) }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 500)

  const [rows] = await pool.query<AuditLogRow[]>(
    `SELECT id, user_email AS userEmail, action, entity, entity_id AS entityId,
            summary, ip, created_at AS createdAt
     FROM admin_audit_log ${where} ORDER BY created_at DESC LIMIT ${limit}`,
    values,
  )
  return rows
}
