import pool from '../../config/db'
import {
  DiscoverItemRow,
  EventRoomRow,
  GalleryImageRow,
  RoomAmenityRow,
  RoomImageRow,
  RoomRow,
  SpaTreatmentRow,
} from '../../types/database'
import {
  mapDiscoverItem, mapEventRoom, mapGalleryImage, mapRoom, mapSpaTreatment,
} from './mapper'
import { getRestaurantMenu } from '../restaurant/service'

export async function getRooms() {
  const [rooms] = await pool.execute<RoomRow[]>(
    `SELECT id, slug, translation_key, name, name_en, description, description_en,
     view, view_en, bed_type, bed_type_en, price, currency, size, max_guests, total_units
     FROM rooms ORDER BY price ASC`,
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

export const getMenu = getRestaurantMenu

export async function getSpaTreatments() {
  const [rows] = await pool.execute<SpaTreatmentRow[]>(
    `SELECT id, \`key\`, duration_key, name, name_en, duration, duration_en,
     description, description_en, price, is_active, sort_order
     FROM spa_treatments WHERE is_active = 1 ORDER BY sort_order ASC`,
  )
  return rows.map(mapSpaTreatment)
}

export async function getGallery() {
  const [rows] = await pool.execute<GalleryImageRow[]>(
    'SELECT id, src, alt, alt_en, category, sort_order FROM gallery_images ORDER BY category, sort_order',
  )
  return rows.map(mapGalleryImage)
}

export async function getDiscover() {
  const [rows] = await pool.execute<DiscoverItemRow[]>(
    `SELECT id, type, \`key\`, title, title_en, text, text_en, icon, image, sort_order
     FROM discover_items ORDER BY type, sort_order`,
  )
  // Le front affiche les activités en encadrés et les attractions en liste :
  // la réponse les sépare pour éviter un filtrage côté client.
  return {
    activities: rows.filter(row => row.type === 'activity').map(mapDiscoverItem),
    attractions: rows.filter(row => row.type === 'attraction').map(mapDiscoverItem),
  }
}

export async function getEventRooms() {
  const [rows] = await pool.execute<EventRoomRow[]>(
    'SELECT id, `key`, name, name_en, description, description_en, image, capacity, schedule, price, currency, sort_order FROM event_rooms ORDER BY sort_order ASC',
  )
  return rows.map(mapEventRoom)
}