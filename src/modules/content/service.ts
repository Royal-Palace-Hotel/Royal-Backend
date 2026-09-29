import pool from '../../config/db'
import {
  EventRoomRow,
  MenuItemRow,
  MenuSectionRow,
  RoomAmenityRow,
  RoomImageRow,
  RoomRow,
  SpaTreatmentRow,
} from '../../types/database'
import { mapEventRoom, mapMenuSection, mapRoom, mapSpaTreatment } from './mapper'

export async function getRooms() {
  const [rooms] = await pool.execute<RoomRow[]>(
    'SELECT id, slug, translation_key, name, name_en, description, description_en, price, currency, size, max_guests, total_units FROM rooms ORDER BY price ASC',
  )
  if (rooms.length === 0) return []

  const roomIds = rooms.map(room => room.id)
  const placeholders = roomIds.map(() => '?').join(', ')
  const [images] = await pool.execute<RoomImageRow[]>(
    `SELECT room_id, image, sort_order FROM room_images WHERE room_id IN (${placeholders}) ORDER BY room_id, sort_order`,
    roomIds,
  )
  const [amenities] = await pool.execute<RoomAmenityRow[]>(
    `SELECT room_id, amenity, sort_order FROM room_amenities WHERE room_id IN (${placeholders}) ORDER BY room_id, sort_order`,
    roomIds,
  )
  const imagesByRoom = new Map<string, RoomImageRow[]>()
  const amenitiesByRoom = new Map<string, RoomAmenityRow[]>()

  for (const image of images) {
    imagesByRoom.set(image.room_id, [...(imagesByRoom.get(image.room_id) ?? []), image])
  }
  for (const amenity of amenities) {
    amenitiesByRoom.set(amenity.room_id, [...(amenitiesByRoom.get(amenity.room_id) ?? []), amenity])
  }

  return rooms.map(room => mapRoom(
    room,
    imagesByRoom.get(room.id) ?? [],
    amenitiesByRoom.get(room.id) ?? [],
  ))
}

export async function getMenu() {
  const [sections] = await pool.execute<MenuSectionRow[]>(
    'SELECT id, title, title_en, sort_order FROM menu_sections ORDER BY sort_order ASC',
  )
  if (sections.length === 0) return []

  const sectionIds = sections.map(section => section.id)
  const placeholders = sectionIds.map(() => '?').join(', ')
  const [items] = await pool.execute<MenuItemRow[]>(
    `SELECT id, name, name_en, description, description_en, price, sort_order, section_id FROM menu_items WHERE section_id IN (${placeholders}) ORDER BY section_id, sort_order ASC`,
    sectionIds,
  )
  const itemsBySection = new Map<string, MenuItemRow[]>()

  for (const item of items) {
    itemsBySection.set(item.section_id, [...(itemsBySection.get(item.section_id) ?? []), item])
  }

  return sections.map(section => mapMenuSection(section, itemsBySection.get(section.id) ?? []))
}

export async function getSpaTreatments() {
  const [rows] = await pool.execute<SpaTreatmentRow[]>(
    'SELECT id, `key`, duration_key, price, sort_order FROM spa_treatments ORDER BY sort_order ASC',
  )
  return rows.map(mapSpaTreatment)
}

export async function getEventRooms() {
  const [rows] = await pool.execute<EventRoomRow[]>(
    'SELECT id, `key`, name, name_en, description, description_en, image, capacity, schedule, price, currency, sort_order FROM event_rooms ORDER BY sort_order ASC',
  )
  return rows.map(mapEventRoom)
}