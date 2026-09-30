import 'dotenv/config'
import { RowDataPacket } from 'mysql2/promise'
import pool from '../src/config/db'

interface ColumnRow extends RowDataPacket {
  COLUMN_NAME: string
}

const schemaUpdates = {
  rooms: [
    ['name', 'VARCHAR(191) NULL'],
    ['name_en', 'VARCHAR(191) NULL'],
    ['description', 'TEXT NULL'],
    ['description_en', 'TEXT NULL'],
  ],
  event_rooms: [
    ['name', 'VARCHAR(191) NULL'],
    ['name_en', 'VARCHAR(191) NULL'],
    ['description', 'TEXT NULL'],
    ['description_en', 'TEXT NULL'],
    ['capacity', 'INT NULL'],
    ['schedule', 'VARCHAR(191) NULL'],
    ['price', 'DECIMAL(10, 2) NULL'],
    ['currency', 'VARCHAR(8) NULL'],
  ],
} as const

async function main() {
  try {
    for (const [table, columns] of Object.entries(schemaUpdates)) {
      const [existingColumns] = await pool.query<ColumnRow[]>(
        'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
        [table],
      )
      const existingNames = new Set(existingColumns.map(({ COLUMN_NAME }) => COLUMN_NAME))
      const missingColumns = columns.filter(([name]) => !existingNames.has(name))

      if (missingColumns.length === 0) continue

      const definitions = missingColumns
        .map(([name, definition]) => `ADD COLUMN \`${name}\` ${definition}`)
        .join(', ')
      await pool.query(`ALTER TABLE \`${table}\` ${definitions}`)
      console.log(`Added ${missingColumns.map(([name]) => `${table}.${name}`).join(', ')}`)
    }
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error('Admin content schema migration failed:', error)
  process.exitCode = 1
})
