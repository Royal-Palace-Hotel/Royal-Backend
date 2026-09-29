CREATE DATABASE IF NOT EXISTS royal_palace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE royal_palace;

CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(191) NOT NULL,
  slug VARCHAR(191) NOT NULL,
  translation_key VARCHAR(191) NOT NULL,
  name VARCHAR(191) NULL,
  name_en VARCHAR(191) NULL,
  description TEXT NULL,
  description_en TEXT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'EUR',
  size INT NOT NULL,
  max_guests INT NOT NULL,
  total_units INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY rooms_slug_unique (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS room_images (
  room_id VARCHAR(191) NOT NULL,
  image VARCHAR(1024) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (room_id, sort_order),
  CONSTRAINT room_images_room_fk FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS room_amenities (
  room_id VARCHAR(191) NOT NULL,
  amenity VARCHAR(191) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (room_id, sort_order),
  CONSTRAINT room_amenities_room_fk FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(191) NOT NULL,
  guest_name VARCHAR(191) NOT NULL,
  guest_email VARCHAR(191) NOT NULL,
  guest_phone VARCHAR(64) NULL,
  check_in DATETIME NOT NULL,
  check_out DATETIME NOT NULL,
  rooms_count INT NOT NULL,
  adults INT NOT NULL,
  children INT NOT NULL DEFAULT 0,
  room_id VARCHAR(191) NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY bookings_check_in_check_out_idx (check_in, check_out),
  KEY bookings_room_id_idx (room_id),
  CONSTRAINT bookings_room_fk FOREIGN KEY (room_id) REFERENCES rooms (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_sections (
  id VARCHAR(191) NOT NULL,
  title VARCHAR(191) NOT NULL,
  title_en VARCHAR(191) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  name_en VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  description_en TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  section_id VARCHAR(191) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY menu_items_section_id_idx (section_id),
  CONSTRAINT menu_items_section_fk FOREIGN KEY (section_id) REFERENCES menu_sections (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spa_treatments (
  id VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  duration_key VARCHAR(191) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY spa_treatments_key_unique (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS event_rooms (
  id VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  name VARCHAR(191) NULL,
  name_en VARCHAR(191) NULL,
  description TEXT NULL,
  description_en TEXT NULL,
  image VARCHAR(1024) NOT NULL,
  capacity INT NULL,
  schedule VARCHAR(191) NULL,
  price DECIMAL(10, 2) NULL,
  currency VARCHAR(8) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY event_rooms_key_unique (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
  id VARCHAR(191) NOT NULL,
  type ENUM('contact', 'event') NOT NULL,
  status ENUM('new', 'read', 'replied', 'archived') NOT NULL DEFAULT 'new',
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  phone VARCHAR(64) NULL,
  subject VARCHAR(191) NULL,
  message TEXT NOT NULL,
  event_date DATETIME NULL,
  guest_count INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY contact_messages_type_status_idx (type, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY newsletter_subscribers_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'admin',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY admin_users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;