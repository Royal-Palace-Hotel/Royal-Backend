import { RowDataPacket } from 'mysql2'

export interface RoomRow extends RowDataPacket {
  id: string
  slug: string
  translation_key: string
  name: string | null
  name_en: string | null
  description: string | null
  description_en: string | null
  price: number
  currency: string
  size: number
  max_guests: number
  total_units: number
}

export interface RoomImageRow extends RowDataPacket {
  room_id: string
  image: string
  sort_order: number
}

export interface RoomAmenityRow extends RowDataPacket {
  room_id: string
  amenity: string
  sort_order: number
}

export interface BookingRow extends RowDataPacket {
  id: string
  guest_name: string
  guest_email: string
  guest_phone: string | null
  check_in: Date
  check_out: Date
  rooms_count: number
  adults: number
  children: number
  room_id: string
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: Date
  updated_at: Date
}

export interface MenuSectionRow extends RowDataPacket {
  id: string
  title: string
  title_en: string
  sort_order: number
}

export interface MenuItemRow extends RowDataPacket {
  id: string
  name: string
  name_en: string
  description: string
  description_en: string
  price: number
  sort_order: number
  section_id: string
}

export interface SpaTreatmentRow extends RowDataPacket {
  id: string
  key: string
  duration_key: string
  price: number
  sort_order: number
}

export interface EventRoomRow extends RowDataPacket {
  id: string
  key: string
  name: string | null
  name_en: string | null
  description: string | null
  description_en: string | null
  image: string
  capacity: number | null
  schedule: string | null
  price: number | null
  currency: string | null
  sort_order: number
}

export interface ContactMessageRow extends RowDataPacket {
  id: string
  type: 'contact' | 'event'
  status: 'new' | 'read' | 'replied' | 'archived'
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  event_date: Date | null
  guest_count: number | null
  created_at: Date
}

export interface NewsletterSubscriberRow extends RowDataPacket {
  id: string
  email: string
  created_at: Date
}

export interface AdminUserRow extends RowDataPacket {
  id: string
  email: string
  password: string
  role: string
  created_at: Date
  updated_at: Date
}