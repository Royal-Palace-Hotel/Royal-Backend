import { RowDataPacket } from 'mysql2/promise'
import pool from '../src/config/db'

/**
 * Ajoute les colonnes apparues après la création initiale de la base.
 *
 * Les nouvelles *tables* sont créées par `db/schema.sql` (CREATE TABLE IF NOT
 * EXISTS) ; ce script ne traite que les colonnes ajoutées à des tables qui
 * existaient déjà. Il est sûr à relancer : seules les colonnes manquantes
 * sont ajoutées.
 */

interface ColumnRow extends RowDataPacket {
  COLUMN_NAME: string
}

interface NullabilityRow extends RowDataPacket {
  IS_NULLABLE: 'YES' | 'NO'
}

const schemaUpdates: Record<string, Array<readonly [string, string]>> = {
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
  spa_treatments: [
    ['name', 'VARCHAR(191) NULL'],
    ['name_en', 'VARCHAR(191) NULL'],
    ['duration', 'VARCHAR(191) NULL'],
    ['duration_en', 'VARCHAR(191) NULL'],
    ['description', 'TEXT NULL'],
    ['description_en', 'TEXT NULL'],
    ['is_active', 'TINYINT(1) NOT NULL DEFAULT 1'],
  ],
  admin_users: [
    ['name', 'VARCHAR(191) NULL'],
    ['is_active', 'TINYINT(1) NOT NULL DEFAULT 1'],
    ['last_login_at', 'DATETIME NULL'],
    ['token_version', 'INT NOT NULL DEFAULT 0'],
  ],
  bookings: [
    // Distingue une réservation venue du site d'une saisie du back-office.
    ['source', "ENUM('website', 'admin') NOT NULL DEFAULT 'website'"],
  ],
}

/**
 * Colonnes existantes qui doivent devenir nullables.
 *
 * `guest_email` était obligatoire : une réservation prise par téléphone et
 * saisie au back-office n'a pas toujours d'adresse. On ne rejoue le `MODIFY`
 * que si la colonne est encore NOT NULL, pour ne pas reconstruire la table à
 * chaque exécution.
 */
const nullableUpdates: Array<readonly [string, string, string]> = [
  ['bookings', 'guest_email', 'VARCHAR(191) NULL'],
]

async function main() {
  try {
    let total = 0

    for (const [table, columns] of Object.entries(schemaUpdates)) {
      const [existingColumns] = await pool.query<ColumnRow[]>(
        'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
        [table],
      )
      // Table absente : schema.sql la créera déjà complète.
      if (existingColumns.length === 0) continue

      const existingNames = new Set(existingColumns.map(({ COLUMN_NAME }) => COLUMN_NAME))
      const missingColumns = columns.filter(([name]) => !existingNames.has(name))
      if (missingColumns.length === 0) continue

      const definitions = missingColumns
        .map(([name, definition]) => `ADD COLUMN \`${name}\` ${definition}`)
        .join(', ')
      await pool.query(`ALTER TABLE \`${table}\` ${definitions}`)
      total += missingColumns.length
      console.log(`  + ${missingColumns.map(([name]) => `${table}.${name}`).join(', ')}`)
    }

    for (const [table, column, definition] of nullableUpdates) {
      const [rows] = await pool.query<NullabilityRow[]>(
        `SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column],
      )
      if (rows.length === 0 || rows[0].IS_NULLABLE === 'YES') continue

      await pool.query(`ALTER TABLE \`${table}\` MODIFY \`${column}\` ${definition}`)
      total += 1
      console.log(`  ~ ${table}.${column} devient facultative`)
    }

    console.log(total === 0 ? 'Schéma déjà à jour.' : `${total} modification(s) appliquée(s).`)
  } finally {
    await pool.end()
  }
}

main().catch(error => {
  console.error('Migration échouée :', error.message)
  process.exitCode = 1
})
