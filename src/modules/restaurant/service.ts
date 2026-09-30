import { randomUUID } from 'node:crypto'
import { ResultSetHeader } from 'mysql2'
import pool from '../../config/db'
import { AppError } from '../../middleware/errorHandler'
import { MenuItemRow, MenuSectionRow } from '../../types/database'

export interface MenuSectionInput {
  title: string
  titleEn: string
  sortOrder: number
}

export interface MenuItemInput {
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  price: number
  sectionId: string
  sortOrder: number
}

export async function getRestaurantMenu() {
  const [sections] = await pool.execute<MenuSectionRow[]>(
    'SELECT id, title, title_en, sort_order FROM menu_sections ORDER BY sort_order ASC, title ASC',
  )
  if (sections.length === 0) return []

  const sectionIds = sections.map(section => section.id)
  const placeholders = sectionIds.map(() => '?').join(', ')
  const [items] = await pool.execute<MenuItemRow[]>(
    `SELECT id, name, name_en, description, description_en, price, sort_order, section_id
     FROM menu_items WHERE section_id IN (${placeholders})
     ORDER BY section_id ASC, sort_order ASC, name ASC`,
    sectionIds,
  )
  const itemsBySection = new Map<string, MenuItemRow[]>()

  for (const item of items) {
    const sectionItems = itemsBySection.get(item.section_id) ?? []
    sectionItems.push(item)
    itemsBySection.set(item.section_id, sectionItems)
  }

  return sections.map(section => ({
    id: section.id,
    title: section.title,
    titleEn: section.title_en,
    order: section.sort_order,
    items: (itemsBySection.get(section.id) ?? []).map(item => ({
      id: item.id,
      name: item.name,
      nameEn: item.name_en,
      description: item.description,
      descriptionEn: item.description_en,
      price: item.price,
      order: item.sort_order,
    })),
  }))
}

export async function getMenuSections() {
  const [rows] = await pool.execute<MenuSectionRow[]>(
    'SELECT id, title, title_en, sort_order FROM menu_sections ORDER BY sort_order ASC, title ASC',
  )
  return rows.map(row => ({
    id: row.id,
    title: row.title,
    titleEn: row.title_en,
    sortOrder: row.sort_order,
  }))
}

export async function getMenuItems() {
  const [rows] = await pool.execute<MenuItemRow[]>(
    `SELECT id, name, name_en, description, description_en, price, sort_order, section_id
     FROM menu_items ORDER BY section_id ASC, sort_order ASC, name ASC`,
  )
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    description: row.description,
    descriptionEn: row.description_en,
    price: row.price,
    sectionId: row.section_id,
    sortOrder: row.sort_order,
  }))
}

export async function createMenuSection(input: MenuSectionInput) {
  const id = randomUUID()
  await pool.execute(
    'INSERT INTO menu_sections (id, title, title_en, sort_order) VALUES (?, ?, ?, ?)',
    [id, input.title, input.titleEn, input.sortOrder],
  )
  return { id, ...input }
}

export async function updateMenuSection(id: string, input: MenuSectionInput) {
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE menu_sections SET title = ?, title_en = ?, sort_order = ? WHERE id = ?',
    [input.title, input.titleEn, input.sortOrder, id],
  )
  if (result.affectedRows === 0) throw new AppError('Menu section not found', 404)
  return { id, ...input }
}

export async function deleteMenuSection(id: string) {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM menu_sections WHERE id = ?',
    [id],
  )
  if (result.affectedRows === 0) throw new AppError('Menu section not found', 404)
  return { id }
}

export async function createMenuItem(input: MenuItemInput) {
  const id = randomUUID()
  await pool.execute(
    `INSERT INTO menu_items
     (id, name, name_en, description, description_en, price, sort_order, section_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, input.name, input.nameEn, input.description, input.descriptionEn,
      input.price, input.sortOrder, input.sectionId],
  )
  return { id, ...input }
}

export async function updateMenuItem(id: string, input: MenuItemInput) {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE menu_items
     SET name = ?, name_en = ?, description = ?, description_en = ?, price = ?, sort_order = ?, section_id = ?
     WHERE id = ?`,
    [input.name, input.nameEn, input.description, input.descriptionEn,
      input.price, input.sortOrder, input.sectionId, id],
  )
  if (result.affectedRows === 0) throw new AppError('Menu item not found', 404)
  return { id, ...input }
}

export async function deleteMenuItem(id: string) {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM menu_items WHERE id = ?',
    [id],
  )
  if (result.affectedRows === 0) throw new AppError('Menu item not found', 404)
  return { id }
}