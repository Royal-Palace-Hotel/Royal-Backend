import pool from '../../config/db'
import { MenuItemRow, MenuSectionRow } from '../../types/database'
import { mapMenuSection } from '../content/mapper'

/** Public menu: sections ordered, each with its items. */
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

  return sections.map(section => mapMenuSection(section, itemsBySection.get(section.id) ?? []))
}
