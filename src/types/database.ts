import { RowDataPacket } from 'mysql2'

export interface RoomRow extends RowDataPacket {
  id: string
  slug: string
  translation_key: string
  name: string | null
  name_en: string | null
  description: string | null
  description_en: string | null
  view: string | null
  view_en: string | null
  bed_type: string | null
  bed_type_en: string | null
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
  /** Absente pour une réservation saisie au back-office depuis un appel. */
  guest_email: string | null
  guest_phone: string | null
  check_in: Date
  check_out: Date
  rooms_count: number
  adults: number
  children: number
  room_id: string
  status: 'pending' | 'confirmed' | 'cancelled'
  source: 'website' | 'admin'
  created_at: Date
  updated_at: Date
}

export interface RoomBlockRow extends RowDataPacket {
  id: string
  room_id: string
  start_date: string
  end_date: string
  units: number
  reason: string | null
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
  name: string | null
  name_en: string | null
  duration: string | null
  duration_en: string | null
  description: string | null
  description_en: string | null
  price: number
  is_active: number
  sort_order: number
}

export type GalleryCategory =
  | 'hero' | 'rooms' | 'restaurant' | 'pool' | 'spa' | 'events' | 'discover' | 'gallery'

export interface GalleryImageRow extends RowDataPacket {
  id: string
  src: string
  alt: string
  alt_en: string | null
  category: GalleryCategory
  sort_order: number
}

export interface DiscoverItemRow extends RowDataPacket {
  id: string
  type: 'activity' | 'attraction'
  key: string | null
  title: string | null
  title_en: string | null
  text: string | null
  text_en: string | null
  icon: string | null
  image: string | null
  sort_order: number
}

export interface AuditLogRow extends RowDataPacket {
  id: string
  user_id: string | null
  user_email: string
  action: string
  entity: string
  entity_id: string | null
  summary: string | null
  ip: string | null
  created_at: Date
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
  name: string | null
  role: string
  is_active: number
  last_login_at: Date | null
  token_version: number
  created_at: Date
  updated_at: Date
}