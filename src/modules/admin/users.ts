import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { ResultSetHeader } from 'mysql2/promise'
import pool from '../../config/db'
import { AppError } from '../../middleware/errorHandler'
import { AdminUserRow } from '../../types/database'
import { issueToken } from '../auth/token'

const PUBLIC_FIELDS = `id, email, name, role, is_active AS isActive,
  last_login_at AS lastLoginAt, created_at AS createdAt`

const normalise = (row: any) => ({ ...row, isActive: Boolean(row.isActive) })

export async function listAdminUsers() {
  const [rows] = await pool.execute<AdminUserRow[]>(
    `SELECT ${PUBLIC_FIELDS} FROM admin_users ORDER BY created_at`,
  )
  return rows.map(normalise)
}

async function findById(id: string) {
  const [rows] = await pool.execute<AdminUserRow[]>(
    `SELECT ${PUBLIC_FIELDS} FROM admin_users WHERE id = ? LIMIT 1`, [id],
  )
  if (!rows.length) throw new AppError('Compte introuvable', 404)
  return normalise(rows[0])
}

export async function createAdminUser(input: {
  email: string; password: string; name?: string | null; role: 'admin' | 'staff'
}) {
  const email = input.email.trim().toLowerCase()
  const [existing] = await pool.execute<AdminUserRow[]>(
    'SELECT id FROM admin_users WHERE email = ? LIMIT 1', [email],
  )
  if (existing.length) throw new AppError('Un compte utilise déjà cette adresse', 409)

  const id = randomUUID()
  await pool.execute(
    'INSERT INTO admin_users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
    [id, email, await bcrypt.hash(input.password, 10), input.name ?? null, input.role],
  )
  return findById(id)
}

export async function updateAdminUser(id: string, input: {
  name?: string | null
  role?: 'admin' | 'staff'
  isActive?: boolean
  password?: string
}, actingUserId: string) {
  const user = await findById(id)

  // Garde-fous : on ne peut ni se rétrograder ni se désactiver soi-même, ce
  // qui laisserait potentiellement l'installation sans administrateur actif.
  if (id === actingUserId) {
    if (input.role && input.role !== user.role) {
      throw new AppError('Impossible de modifier son propre rôle', 400)
    }
    if (input.isActive === false) {
      throw new AppError('Impossible de désactiver son propre compte', 400)
    }
  }

  if (input.role === 'staff' || input.isActive === false) {
    await assertAnotherActiveAdminExists(id)
  }

  const sets: string[] = []
  const values: any[] = []
  if (input.name !== undefined) { sets.push('name = ?'); values.push(input.name || null) }
  if (input.role !== undefined) { sets.push('role = ?'); values.push(input.role) }
  if (input.isActive !== undefined) { sets.push('is_active = ?'); values.push(input.isActive ? 1 : 0) }
  if (input.password) {
    // Réinitialiser le mot de passe de quelqu'un déconnecte ses sessions.
    sets.push('password = ?', 'token_version = token_version + 1')
    values.push(await bcrypt.hash(input.password, 10))
  }

  if (sets.length) {
    await pool.execute(`UPDATE admin_users SET ${sets.join(', ')} WHERE id = ?`, [...values, id])
  }
  return findById(id)
}

export async function deleteAdminUser(id: string, actingUserId: string) {
  if (id === actingUserId) throw new AppError('Impossible de supprimer son propre compte', 400)
  await findById(id)
  await assertAnotherActiveAdminExists(id)

  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM admin_users WHERE id = ?', [id])
  if (!result.affectedRows) throw new AppError('Compte introuvable', 404)
  return { id }
}

/** Empêche de retirer le dernier administrateur actif de l'installation. */
async function assertAnotherActiveAdminExists(excludedId: string) {
  const [rows] = await pool.execute<AdminUserRow[]>(
    "SELECT id FROM admin_users WHERE role = 'admin' AND is_active = 1 AND id <> ? LIMIT 1",
    [excludedId],
  )
  if (!rows.length) {
    throw new AppError('Il doit rester au moins un administrateur actif', 400)
  }
}

/**
 * Change son propre mot de passe.
 *
 * L'incrément de `token_version` révoque tous les jetons déjà émis : les
 * autres sessions sont déconnectées. Un jeton neuf, portant la nouvelle
 * version, est renvoyé pour que la session courante ne soit pas coupée.
 */
export async function changeOwnPassword(userId: string, currentPassword: string, newPassword: string) {
  const [rows] = await pool.execute<AdminUserRow[]>(
    'SELECT id, email, password, role, token_version FROM admin_users WHERE id = ? LIMIT 1',
    [userId],
  )
  const user = rows[0]
  if (!user) throw new AppError('Compte introuvable', 404)

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    throw new AppError('Mot de passe actuel incorrect', 400)
  }
  if (await bcrypt.compare(newPassword, user.password)) {
    throw new AppError('Le nouveau mot de passe doit être différent de l’actuel', 400)
  }

  await pool.execute(
    'UPDATE admin_users SET password = ?, token_version = token_version + 1 WHERE id = ?',
    [await bcrypt.hash(newPassword, 10), userId],
  )

  return {
    id: userId,
    token: issueToken({ ...user, token_version: Number(user.token_version ?? 0) + 1 }),
  }
}
