import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { createInterface } from 'node:readline'
import { RowDataPacket } from 'mysql2'
import bcrypt from 'bcryptjs'
import pool from '../src/config/db'

interface AdminCountRow extends RowDataPacket {
  admin_count: number
}

function question(prompt: string) {
  const terminal = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise<string>(resolve => terminal.question(prompt, answer => {
    terminal.close()
    resolve(answer)
  }))
}

async function main() {
  try {
    const [rows] = await pool.query<AdminCountRow[]>(
      'SELECT COUNT(*) AS admin_count FROM admin_users',
    )
    if (Number(rows[0].admin_count) > 0) {
      console.log('Admin accounts already exist. Use the registration endpoint for additional admins.')
      return
    }

    const email = await question('Enter admin email: ')
    const password = await question('Enter admin password (min 6 characters): ')
    const role = (await question('Enter role (admin/staff, default: admin): ')) || 'admin'

    if (!email || password.length < 6 || (role !== 'admin' && role !== 'staff')) {
      throw new Error('Provide an email, a password of at least 6 characters, and role admin or staff.')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const id = randomUUID()
    await pool.execute(
      'INSERT INTO admin_users (id, email, password, role) VALUES (?, ?, ?, ?)',
      [id, email, hashedPassword, role],
    )
    console.log(`Admin account created for ${email} (${role}).`)
  } finally {
    await pool.end()
  }
}

main().catch(error => {
  console.error('Error creating admin:', error)
  process.exitCode = 1
})