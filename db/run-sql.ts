import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createConnection } from 'mysql2/promise'
import { connectionOptions } from '../src/config/db'

export async function runSql(fileName: string) {
  const sql = await readFile(resolve(process.cwd(), fileName), 'utf8')
  const statements = sql.split(/;\s*(?:\r?\n|$)/).map(statement => statement.trim()).filter(Boolean)
  const connection = await createConnection({ ...connectionOptions, database: undefined })

  try {
    for (const statement of statements) {
      await connection.query(statement)
    }
    console.log(`Executed ${statements.length} SQL statement(s) from ${fileName}`)
  } finally {
    await connection.end()
  }
}

async function main() {
  const fileName = process.argv[2]
  if (!fileName) throw new Error('Usage: tsx db/run-sql.ts <sql-file>')
  await runSql(fileName)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error('SQL script failed:', error)
    process.exitCode = 1
  })
}