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
  -- Vue et literie, affichées dans le tableau comparatif du site. En base
  -- plutôt que dans les fichiers de traduction : une chambre créée au
  -- back-office n'aurait sinon aucun moyen de les renseigner.
  view VARCHAR(191) NULL,
  view_en VARCHAR(191) NULL,
  bed_type VARCHAR(191) NULL,
  bed_type_en VARCHAR(191) NULL,
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
  -- Nullable : une réservation prise par téléphone et saisie au back-office
  -- n'a pas toujours d'adresse e-mail.
  guest_email VARCHAR(191) NULL,
  guest_phone VARCHAR(64) NULL,
  check_in DATETIME NOT NULL,
  check_out DATETIME NOT NULL,
  rooms_count INT NOT NULL,
  adults INT NOT NULL,
  children INT NOT NULL DEFAULT 0,
  room_id VARCHAR(191) NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  -- D'où vient la réservation : le site public, ou une saisie du back-office.
  source ENUM('website', 'admin') NOT NULL DEFAULT 'website',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY bookings_check_in_check_out_idx (check_in, check_out),
  KEY bookings_room_id_idx (room_id),
  CONSTRAINT bookings_room_fk FOREIGN KEY (room_id) REFERENCES rooms (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*
 * Périodes pendant lesquelles des unités d'un type de chambre ne sont pas
 * vendables : travaux, fermeture, ou réservation reçue hors du site.
 *
 * `end_date` est exclusive, comme `bookings.check_out` : bloquer du 12 au 15
 * occupe les nuits du 12, 13 et 14, et laisse le 15 libre à l'arrivée suivante.
 */
CREATE TABLE IF NOT EXISTS room_blocks (
  id VARCHAR(191) NOT NULL,
  room_id VARCHAR(191) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  units INT NOT NULL DEFAULT 1,
  reason VARCHAR(191) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY room_blocks_dates_idx (start_date, end_date),
  KEY room_blocks_room_id_idx (room_id),
  CONSTRAINT room_blocks_room_fk FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
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
  name VARCHAR(191) NULL,
  name_en VARCHAR(191) NULL,
  duration VARCHAR(191) NULL,
  duration_en VARCHAR(191) NULL,
  description TEXT NULL,
  description_en TEXT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY spa_treatments_key_unique (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gallery_images (
  id VARCHAR(191) NOT NULL,
  src VARCHAR(1024) NOT NULL,
  alt VARCHAR(500) NOT NULL,
  alt_en VARCHAR(500) NULL,
  category ENUM('hero', 'rooms', 'restaurant', 'pool', 'spa', 'events', 'discover', 'gallery') NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY gallery_images_category_idx (category, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- `activity` = encadré illustré ; `attraction` = simple ligne de la liste « à proximité ».
CREATE TABLE IF NOT EXISTS discover_items (
  id VARCHAR(191) NOT NULL,
  type ENUM('activity', 'attraction') NOT NULL DEFAULT 'activity',
  `key` VARCHAR(191) NULL,
  title VARCHAR(191) NULL,
  title_en VARCHAR(191) NULL,
  text TEXT NULL,
  text_en TEXT NULL,
  icon VARCHAR(64) NULL,
  image VARCHAR(1024) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY discover_items_key_unique (`key`),
  KEY discover_items_type_idx (type, sort_order)
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
  name VARCHAR(191) NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'admin',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  -- Incrémenté à chaque changement de mot de passe : invalide les jetons
  -- portant une version antérieure. Un compteur plutôt qu'un horodatage, car
  -- `iat` n'a qu'une précision d'une seconde — un jeton émis dans la même
  -- seconde que le changement ne serait pas distinguable.
  token_version INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY admin_users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Journal des actions d'administration. `user_email` est dupliqué pour que la
-- trace reste lisible même après la suppression du compte.
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id VARCHAR(191) NOT NULL,
  user_id VARCHAR(191) NULL,
  user_email VARCHAR(191) NOT NULL,
  action VARCHAR(32) NOT NULL,
  entity VARCHAR(64) NOT NULL,
  entity_id VARCHAR(191) NULL,
  summary VARCHAR(500) NULL,
  ip VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY admin_audit_log_created_idx (created_at),
  KEY admin_audit_log_entity_idx (entity, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;