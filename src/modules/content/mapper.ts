import {
  DiscoverItemRow,
  EventRoomRow,
  GalleryImageRow,
  MenuItemRow,
  MenuSectionRow,
  RoomAmenityRow,
  RoomImageRow,
  RoomRow,
  SpaTreatmentRow,
} from '../../types/database'

export interface RoomContent {
  id: string
  slug: string
  translationKey: string
  name: string | null
  nameEn: string | null
  description: string | null
  descriptionEn: string | null
  view: string | null
  viewEn: string | null
  bedType: string | null
  bedTypeEn: string | null
  price: number
  currency: string
  images: string[]
  size: number
  maxGuests: number
  amenities: string[]
}

export interface MenuItemContent {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  price: number
  order: number
}

export interface MenuSectionContent {
  id: string
  title: string
  titleEn: string
  order: number
  items: MenuItemContent[]
}

export function mapRoom(
  room: RoomRow,
  images: RoomImageRow[],
  amenities: RoomAmenityRow[],
): RoomContent {
  return {
    id: room.slug,
    slug: room.slug,
    translationKey: room.translation_key,
    name: room.name,
    nameEn: room.name_en,
    description: room.description,
    descriptionEn: room.description_en,
    view: room.view,
    viewEn: room.view_en,
    bedType: room.bed_type,
    bedTypeEn: room.bed_type_en,
    price: room.price,
    currency: room.currency,
    images: images.map(row => row.image),
    size: room.size,
    maxGuests: room.max_guests,
    amenities: amenities.map(row => row.amenity),
  }
}

export function mapMenuItem(row: MenuItemRow): MenuItemContent {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    description: row.description,
    descriptionEn: row.description_en,
    price: row.price,
    order: row.sort_order,
  }
}

export function mapMenuSection(row: MenuSectionRow, items: MenuItemRow[]): MenuSectionContent {
  return {
    id: row.id,
    title: row.title,
    titleEn: row.title_en,
    order: row.sort_order,
    items: items.map(mapMenuItem),
  }
}

export function mapSpaTreatment(row: SpaTreatmentRow) {
  return {
    id: row.id,
    key: row.key,
    durationKey: row.duration_key,
    name: row.name,
    nameEn: row.name_en,
    duration: row.duration,
    durationEn: row.duration_en,
    description: row.description,
    descriptionEn: row.description_en,
    price: row.price,
    order: row.sort_order,
  }
}

export function mapGalleryImage(row: GalleryImageRow) {
  return {
    id: row.id,
    src: row.src,
    alt: row.alt,
    altEn: row.alt_en,
    category: row.category,
    order: row.sort_order,
  }
}

export function mapDiscoverItem(row: DiscoverItemRow) {
  return {
    id: row.id,
    type: row.type,
    key: row.key,
    title: row.title,
    titleEn: row.title_en,
    text: row.text,
    textEn: row.text_en,
    icon: row.icon,
    image: row.image,
    order: row.sort_order,
  }
}

export function mapEventRoom(row: EventRoomRow) {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    nameEn: row.name_en,
    description: row.description,
    descriptionEn: row.description_en,
    image: row.image,
    capacity: row.capacity,
    schedule: row.schedule,
    price: row.price,
    currency: row.currency,
    order: row.sort_order,
  }
}