import { randomUUID } from 'node:crypto'
import { createInterface } from 'node:readline'
import { RowDataPacket } from 'mysql2'
import bcrypt from 'bcryptjs'
import pool from '../src/config/db'

interface AdminRow extends RowDataPacket {
  id: string
  email: string
  role: string
}

function question(prompt: string) {
  const terminal = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise<string>(resolve => terminal.question(prompt, answer => {
    terminal.close()
    resolve(answer)
  }))
}

/**
 * Usage:
 *   npm run create-admin                              (interactive)
 *   npm run create-admin -- email@host.com motdepasse [admin|staff]
 *
 * Re-running with an existing email resets that account's password.
 */
async function main() {
  try {
    const [argEmail, argPassword, argRole] = process.argv.slice(2)

    const email = (argEmail ?? await question('Email admin : ')).trim().toLowerCase()
    const password = argPassword ?? await question('Mot de passe (6 caractères minimum) : ')
    const role = (argRole ?? ((await question('Rôle (admin/staff, défaut : admin) : ')) || 'admin')).trim()

    if (!email.includes('@')) throw new Error('Adresse e-mail invalide.')
    if (!password || password.length < 6) throw new Error('Le mot de passe doit faire au moins 6 caractères.')
    if (role !== 'admin' && role !== 'staff') throw new Error('Le rôle doit être "admin" ou "staff".')

    const hashedPassword = await bcrypt.hash(password, 10)
    const [existing] = await pool.execute<AdminRow[]>(
      'SELECT id, email, role FROM admin_users WHERE email = ? LIMIT 1',
      [email],
    )

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE admin_users SET password = ?, role = ? WHERE id = ?',
        [hashedPassword, role, existing[0].id],
      )
      console.log(`Mot de passe mis à jour pour ${email} (${role}).`)
      return
    }

    await pool.execute(
      'INSERT INTO admin_users (id, email, password, role) VALUES (?, ?, ?, ?)',
      [randomUUID(), email, hashedPassword, role],
    )
    console.log(`Compte administrateur créé : ${email} (${role}).`)
  } finally {
    await pool.end()
  }
}

main().catch(error => {
  console.error('Création du compte admin échouée :', error.message)
  process.exitCode = 1
})
