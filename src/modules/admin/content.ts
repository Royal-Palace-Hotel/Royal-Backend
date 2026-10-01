import { randomUUID } from 'node:crypto'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import pool from '../../config/db'
import { AppError } from '../../middleware/errorHandler'

interface Row extends RowDataPacket {
  id: string
  [key: string]: any
}

/**
 * `spa_treatments.key` et `discover_items.key` portent une contrainte UNIQUE.
 * Comme pour les chambres, insertion et mise à jour restent séparées : un
 * upsert écraserait la ligne qui porte déjà la clé. Un doublon remonte en 409
 * via ER_DUP_ENTRY.
 */
async function assertExists(table: string, id: string, label: string) {
  const [rows] = await pool.execute<Row[]>(`SELECT id FROM \`${table}\` WHERE id = ?`, [id])
  if (!rows.length) throw new AppError(`${label} introuvable`, 404)
}

async function removeFrom(table: string, id: string, label: string) {
  const [result] = await pool.execute<ResultSetHeader>(`DELETE FROM \`${table}\` WHERE id = ?`, [id])
  if (!result.affectedRows) throw new AppError(`${label} introuvable`, 404)
  return { id }
}

/* ------------------------------------------------------------------ */
/* Soins du spa                                                        */
/* ------------------------------------------------------------------ */

export interface SpaInput {
  key?: string
  durationKey?: string
  name: string
  nameEn: string
  duration?: string | null
  durationEn?: string | null
  description?: string | null
  descriptionEn?: string | null
  price: number
  isActive?: boolean
  sortOrder: number
}

const SPA_SELECT = `SELECT id, \`key\` AS \`key\`, duration_key AS durationKey, name, name_en AS nameEn,
  duration, duration_en AS durationEn, description, description_en AS descriptionEn,
  price, is_active AS isActive, sort_order AS sortOrder
  FROM spa_treatments ORDER BY sort_order, name`

export async function listSpaTreatments() {
  const [rows] = await pool.execute<Row[]>(SPA_SELECT)
  return rows.map(row => ({ ...row, isActive: Boolean(row.isActive) }))
}

export async function saveSpaTreatment(input: SpaInput, id?: string) {
  if (id) await assertExists('spa_treatments', id, 'Soin')
  const itemId = id || randomUUID()
  const values = [
    input.key || itemId,
    input.durationKey || `${input.key || itemId}Duration`,
    input.name, input.nameEn,
    input.duration ?? null, input.durationEn ?? null,
    input.description ?? null, input.descriptionEn ?? null,
    input.price,
    input.isActive === false ? 0 : 1,
    input.sortOrder,
  ]

  if (id) {
    await pool.execute(
      `UPDATE spa_treatments SET \`key\` = ?, duration_key = ?, name = ?, name_en = ?,
       duration = ?, duration_en = ?, description = ?, description_en = ?,
       price = ?, is_active = ?, sort_order = ? WHERE id = ?`,
      [...values, itemId],
    )
  } else {
    await pool.execute(
      `INSERT INTO spa_treatments (\`key\`, duration_key, name, name_en, duration, duration_en,
       description, description_en, price, is_active, sort_order, id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...values, itemId],
    )
  }
  return (await listSpaTreatments()).find(row => row.id === itemId)
}

export const deleteSpaTreatment = (id: string) => removeFrom('spa_treatments', id, 'Soin')

/* ------------------------------------------------------------------ */
/* Galerie photo                                                       */
/* ------------------------------------------------------------------ */

export interface GalleryInput {
  src: string
  alt: string
  altEn?: string | null
  category: string
  sortOrder: number
}

const GALLERY_SELECT = `SELECT id, src, alt, alt_en AS altEn, category, sort_order AS sortOrder
  FROM gallery_images ORDER BY category, sort_order`

export async function listGalleryImages(category?: string) {
  if (category) {
    const [rows] = await pool.execute<Row[]>(
      `SELECT id, src, alt, alt_en AS altEn, category, sort_order AS sortOrder
       FROM gallery_images WHERE category = ? ORDER BY sort_order`,
      [category],
    )
    return rows
  }
  const [rows] = await pool.execute<Row[]>(GALLERY_SELECT)
  return rows
}

export async function saveGalleryImage(input: GalleryInput, id?: string) {
  if (id) await assertExists('gallery_images', id, 'Image')
  const itemId = id || randomUUID()
  const values = [input.src, input.alt, input.altEn ?? null, input.category, input.sortOrder]

  if (id) {
    await pool.execute(
      'UPDATE gallery_images SET src = ?, alt = ?, alt_en = ?, category = ?, sort_order = ? WHERE id = ?',
      [...values, itemId],
    )
  } else {
    await pool.execute(
      'INSERT INTO gallery_images (src, alt, alt_en, category, sort_order, id) VALUES (?, ?, ?, ?, ?, ?)',
      [...values, itemId],
    )
  }
  return (await listGalleryImages()).find(row => row.id === itemId)
}

export const deleteGalleryImage = (id: string) => removeFrom('gallery_images', id, 'Image')

/* ------------------------------------------------------------------ */
/* Page « Découvrir »                                                  */
/* ------------------------------------------------------------------ */

export interface DiscoverInput {
  type: 'activity' | 'attraction'
  key?: string | null
  title: string
  titleEn: string
  text?: string | null
  textEn?: string | null
  icon?: string | null
  image?: string | null
  sortOrder: number
}

const DISCOVER_SELECT = `SELECT id, type, \`key\` AS \`key\`, title, title_en AS titleEn,
  text, text_en AS textEn, icon, image, sort_order AS sortOrder
  FROM discover_items ORDER BY type, sort_order`

export async function listDiscoverItems(type?: string) {
  if (type) {
    const [rows] = await pool.execute<Row[]>(
      `SELECT id, type, \`key\` AS \`key\`, title, title_en AS titleEn, text, text_en AS textEn,
       icon, image, sort_order AS sortOrder FROM discover_items WHERE type = ? ORDER BY sort_order`,
      [type],
    )
    return rows
  }
  const [rows] = await pool.execute<Row[]>(DISCOVER_SELECT)
  return rows
}

export async function saveDiscoverItem(input: DiscoverInput, id?: string) {
  if (id) await assertExists('discover_items', id, 'Élément')
  const itemId = id || randomUUID()
  // `key` est UNIQUE mais facultatif : NULL échappe à la contrainte, ce qui
  // permet d'ajouter des éléments sans clé de traduction.
  const values = [
    input.type, input.key || null, input.title, input.titleEn,
    input.text ?? null, input.textEn ?? null, input.icon ?? null, input.image ?? null,
    input.sortOrder,
  ]

  if (id) {
    await pool.execute(
      `UPDATE discover_items SET type = ?, \`key\` = ?, title = ?, title_en = ?,
       text = ?, text_en = ?, icon = ?, image = ?, sort_order = ? WHERE id = ?`,
      [...values, itemId],
    )
  } else {
    await pool.execute(
      `INSERT INTO discover_items (type, \`key\`, title, title_en, text, text_en, icon, image, sort_order, id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...values, itemId],
    )
  }
  return (await listDiscoverItems()).find(row => row.id === itemId)
}

export const deleteDiscoverItem = (id: string) => removeFrom('discover_items', id, 'Élément')
