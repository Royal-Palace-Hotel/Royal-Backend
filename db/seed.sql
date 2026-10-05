USE royal_palace;

-- `view` et `bed_type` reprennent ce qui vivait dans les fichiers de traduction,
-- pour que les quatre chambres d'origine soient éditables au back-office comme
-- les autres. `COALESCE` ne les pose que si elles sont encore vides : une
-- valeur saisie au back-office n'est jamais réécrite par un nouveau seed.
INSERT INTO rooms (id, slug, translation_key, name, name_en, description, description_en,
  view, view_en, bed_type, bed_type_en, price, currency, size, max_guests, total_units) VALUES
  ('classic', 'chambre-classique', 'classic', NULL, NULL, NULL, NULL,
   'Vue jardin', 'Garden view', 'Lit double ou lits jumeaux', 'Double or twin beds', 65, 'EUR', 22, 2, 10),
  ('superior', 'chambre-superieure', 'superior', NULL, NULL, NULL, NULL,
   'Vue jardin ou piscine', 'Garden or pool view', 'Lit king size', 'King size bed', 95, 'EUR', 28, 3, 8),
  ('deluxe', 'chambre-deluxe', 'deluxe', NULL, NULL, NULL, NULL,
   'Vue piscine', 'Pool view', 'Lit king size', 'King size bed', 130, 'EUR', 34, 3, 6),
  ('suite', 'suite-royale', 'suite', NULL, NULL, NULL, NULL,
   'Vue panoramique', 'Panoramic view', 'Lit king size + canapé-lit', 'King size bed + sofa bed', 220, 'EUR', 55, 4, 4)
ON DUPLICATE KEY UPDATE
  slug = VALUES(slug), translation_key = VALUES(translation_key), price = VALUES(price),
  currency = VALUES(currency), size = VALUES(size), max_guests = VALUES(max_guests),
  total_units = VALUES(total_units),
  view = COALESCE(view, VALUES(view)), view_en = COALESCE(view_en, VALUES(view_en)),
  bed_type = COALESCE(bed_type, VALUES(bed_type)), bed_type_en = COALESCE(bed_type_en, VALUES(bed_type_en));

INSERT INTO room_images (room_id, image, sort_order) VALUES
  ('classic', '/images/rooms/room-4.jpg', 0),
  ('classic', '/images/rooms/room-1.jpg', 1),
  ('superior', '/images/rooms/room-1.jpg', 0),
  ('superior', '/images/rooms/room-2.jpg', 1),
  ('deluxe', '/images/rooms/room-2.jpg', 0),
  ('deluxe', '/images/rooms/room-3.jpg', 1),
  ('suite', '/images/rooms/room-3.jpg', 0),
  ('suite', '/images/rooms/room-4.jpg', 1)
ON DUPLICATE KEY UPDATE image = VALUES(image);

INSERT INTO room_amenities (room_id, amenity, sort_order) VALUES
  ('classic', 'ac', 0), ('classic', 'wifi', 1), ('classic', 'tv', 2), ('classic', 'bathroom', 3),
  ('superior', 'ac', 0), ('superior', 'wifi', 1), ('superior', 'tv', 2), ('superior', 'minibar', 3), ('superior', 'safe', 4), ('superior', 'bathroom', 5),
  ('deluxe', 'ac', 0), ('deluxe', 'wifi', 1), ('deluxe', 'tv', 2), ('deluxe', 'minibar', 3), ('deluxe', 'safe', 4), ('deluxe', 'bathroom', 5), ('deluxe', 'balcony', 6),
  ('suite', 'ac', 0), ('suite', 'wifi', 1), ('suite', 'tv', 2), ('suite', 'minibar', 3), ('suite', 'safe', 4), ('suite', 'bathroom', 5), ('suite', 'balcony', 6), ('suite', 'lounge', 7)
ON DUPLICATE KEY UPDATE amenity = VALUES(amenity);

INSERT INTO menu_sections (id, title, title_en, sort_order) VALUES
  ('starters', 'Entrées', 'Starters', 0),
  ('mains', 'Plats Principaux', 'Main Courses', 1),
  ('desserts', 'Desserts', 'Desserts', 2),
  ('drinks', 'Bar & Boissons', 'Bar & Drinks', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title), title_en = VALUES(title_en), sort_order = VALUES(sort_order);

INSERT INTO menu_items (id, name, name_en, description, description_en, price, sort_order, section_id) VALUES
  ('s1', 'Salade de crudités du jardin', 'Garden salad', 'Légumes frais de notre potager, vinaigrette maison', 'Fresh vegetables from our garden, homemade dressing', 12000, 0, 'starters'),
  ('s2', 'Samoussas malgaches', 'Malagasy samosas', 'Trois pièces, viande ou légumes, sauce pimentée', 'Three pieces, meat or vegetable, chili sauce', 10000, 1, 'starters'),
  ('s3', 'Soupe de courge et gingembre', 'Squash and ginger soup', 'Velouté onctueux, crème fraîche', 'Creamy velouté, fresh cream', 11000, 2, 'starters'),
  ('m1', 'Romazava traditionnel malgache', 'Traditional Malagasy Romazava', 'Bouillon de viande et brèdes mafana, riz blanc', 'Meat broth with mafana greens, white rice', 28000, 0, 'mains'),
  ('m2', 'Poisson grillé, sauce vanille de Madagascar', 'Grilled fish, Madagascar vanilla sauce', 'Poisson du jour, sauce vanille bourbon, légumes de saison', 'Catch of the day, bourbon vanilla sauce, seasonal vegetables', 32000, 1, 'mains'),
  ('m3', 'Filet de zébu au poivre sauvage', 'Zebu filet with wild pepper', 'Poivre sauvage de Madagascar, gratin de pommes de terre', 'Madagascar wild pepper, potato gratin', 35000, 2, 'mains'),
  ('m4', 'Curry de crevettes au lait de coco', 'Shrimp curry with coconut milk', 'Riz parfumé, brochette de légumes grillés', 'Fragrant rice, grilled vegetable skewer', 34000, 3, 'mains'),
  ('d1', 'Assiette de fruits tropicaux', 'Tropical fruit plate', 'Fruits frais du jardin de l''hôtel', 'Fresh fruits from the hotel''s garden', 9000, 0, 'desserts'),
  ('d2', 'Mousse au chocolat et vanille de Madagascar', 'Chocolate mousse with Madagascar vanilla', 'Chocolat noir 70%, éclats de vanille bourbon', '70% dark chocolate, bourbon vanilla shavings', 12000, 1, 'desserts'),
  ('b1', 'Cocktail signature "Royal Palace"', '"Royal Palace" signature cocktail', 'Rhum arrangé maison, fruits de la passion', 'House-infused rum, passion fruit', 15000, 0, 'drinks'),
  ('b2', 'Jus frais naturel', 'Fresh natural juice', 'Ananas, mangue ou fruit de la passion', 'Pineapple, mango or passion fruit', 7000, 1, 'drinks'),
  ('b3', 'Sélection de vins', 'Wine selection', 'Vins locaux et importés au verre ou en bouteille', 'Local and imported wines by the glass or bottle', 18000, 2, 'drinks')
ON DUPLICATE KEY UPDATE
  name = VALUES(name), name_en = VALUES(name_en), description = VALUES(description),
  description_en = VALUES(description_en), price = VALUES(price), sort_order = VALUES(sort_order), section_id = VALUES(section_id);

-- Libellés repris de src/i18n/locales/{fr,en}.ts du front.
INSERT INTO spa_treatments (id, `key`, duration_key, name, name_en, duration, duration_en, price, sort_order) VALUES
  ('t1', 'treatment1', 'treatment1Duration', 'Massage relaxant aux huiles essentielles', 'Relaxing massage with essential oils', '60 min', '60 min', 45000, 0),
  ('t2', 'treatment2', 'treatment2Duration', 'Massage aux pierres chaudes', 'Hot stone massage', '75 min', '75 min', 60000, 1),
  ('t3', 'treatment3', 'treatment3Duration', 'Soin du visage hydratant', 'Hydrating facial treatment', '45 min', '45 min', 40000, 2),
  ('t4', 'treatment4', 'treatment4Duration', 'Gommage corps complet', 'Full body scrub', '50 min', '50 min', 42000, 3),
  ('t5', 'treatment5', 'treatment5Duration', 'Rituel duo (couple)', 'Duo ritual (couples)', '90 min', '90 min', 95000, 4)
-- COALESCE : on remplit les colonnes encore vides (base créée avant leur ajout)
-- sans jamais écraser un libellé saisi au back-office.
ON DUPLICATE KEY UPDATE
  `key` = VALUES(`key`), duration_key = VALUES(duration_key),
  name = COALESCE(name, VALUES(name)), name_en = COALESCE(name_en, VALUES(name_en)),
  duration = COALESCE(duration, VALUES(duration)), duration_en = COALESCE(duration_en, VALUES(duration_en)),
  price = VALUES(price), sort_order = VALUES(sort_order);

-- Images de la galerie : reprise du registre de src/data/gallery.ts du front.
INSERT INTO gallery_images (id, src, alt, alt_en, category, sort_order) VALUES
  ('hero-1', '/images/hero/hero-building.jpg', 'Façade du Royal Palace Antsirabe au crépuscule', 'Royal Palace Antsirabe facade at dusk', 'hero', 0),
  ('room-1', '/images/rooms/room-1.jpg', 'Chambre supérieure avec lit confortable', 'Superior room with a comfortable bed', 'rooms', 0),
  ('room-2', '/images/rooms/room-2.jpg', 'Chambre deluxe élégante', 'Elegant deluxe room', 'rooms', 1),
  ('room-3', '/images/rooms/room-3.jpg', 'Suite royale avec décoration raffinée', 'Royal suite with refined decor', 'rooms', 2),
  ('room-4', '/images/rooms/room-4.jpg', 'Chambre classique lumineuse', 'Bright classic room', 'rooms', 3),
  ('restaurant-1', '/images/restaurant/restaurant-1.jpg', 'Salle du restaurant Royal Palace', 'Royal Palace dining room', 'restaurant', 0),
  ('restaurant-2', '/images/restaurant/restaurant-2.jpg', 'Table dressée dans une ambiance élégante', 'Table set in an elegant setting', 'restaurant', 1),
  ('restaurant-3', '/images/restaurant/food-1.jpg', 'Plat gastronomique raffiné', 'Refined gourmet dish', 'restaurant', 2),
  ('restaurant-4', '/images/restaurant/breakfast-1.jpg', 'Buffet petit-déjeuner gourmand', 'Hearty breakfast buffet', 'restaurant', 3),
  ('pool-1', '/images/pool/pool-1.jpg', 'Piscine entourée de palmiers', 'Pool surrounded by palm trees', 'pool', 0),
  ('pool-2', '/images/pool/pool-2.jpg', 'Piscine et jardin tropical', 'Pool and tropical garden', 'pool', 1),
  ('pool-3', '/images/pool/pool-3.jpg', 'Espace détente au bord de la piscine', 'Poolside lounge area', 'pool', 2),
  ('spa-1', '/images/spa/spa-1.jpg', 'Cabine de soin du spa', 'Spa treatment room', 'spa', 0),
  ('spa-2', '/images/spa/spa-2.jpg', 'Ambiance zen du spa', 'Zen spa atmosphere', 'spa', 1),
  ('spa-3', '/images/spa/spa-3.jpg', 'Salle de massage apaisante', 'Soothing massage room', 'spa', 2),
  ('events-1', '/images/events/events-1.jpg', 'Salle de réunion équipée', 'Equipped meeting room', 'events', 0),
  ('events-2', '/images/events/events-2.jpg', 'Salle de conférence professionnelle', 'Professional conference room', 'events', 1),
  ('events-3', '/images/events/events-3.jpg', 'Espace de réception pour événements', 'Reception space for events', 'events', 2),
  ('discover-1', '/images/discover/antsirabe-1.jpg', 'Rue d''Antsirabe avec architecture coloniale', 'Antsirabe street with colonial architecture', 'discover', 0),
  ('discover-2', '/images/discover/antsirabe-2.jpg', 'Paysage des hauts-plateaux malgaches', 'Malagasy highlands landscape', 'discover', 1),
  ('discover-3', '/images/discover/antsirabe-3.jpg', 'Vue d''Antsirabe', 'View of Antsirabe', 'discover', 2),
  ('discover-4', '/images/discover/garden-1.jpg', 'Jardin tropical luxuriant', 'Lush tropical garden', 'discover', 3),
  ('gallery-1', '/images/gallery/lobby-1.jpg', 'Hall d''accueil élégant du Royal Palace', 'Elegant Royal Palace lobby', 'gallery', 0)
-- Seul le chemin du fichier est réaligné ; les légendes et le classement
-- restent ceux du back-office une fois la ligne créée.
ON DUPLICATE KEY UPDATE src = VALUES(src);

-- Page « Découvrir » : activités illustrées puis attractions à proximité.
-- Les textes reprennent ceux de src/i18n/locales/{fr,en}.ts du front.
INSERT INTO discover_items (id, type, `key`, title, title_en, text, text_en, icon, image, sort_order) VALUES
  ('a1', 'activity', 'activity1', 'Tour en pousse-pousse', 'Rickshaw Tour',
   'Découvrez la ville à bord d''un pousse-pousse coloré, moyen de transport emblématique d''Antsirabe.',
   'Discover the city aboard a colourful pousse-pousse, Antsirabe''s iconic mode of transport.',
   'CarTaxiFront', '/images/discover/antsirabe-1.jpg', 0),
  ('a2', 'activity', 'activity2', 'Lac Andraikiba', 'Lake Andraikiba',
   'Un lac de cratère paisible, idéal pour une promenade ou un pique-nique en pleine nature.',
   'A peaceful crater lake, ideal for a walk or picnic in nature.',
   'Waves', '/images/discover/antsirabe-2.jpg', 1),
  ('a3', 'activity', 'activity3', 'Ateliers d''artisanat', 'Craft Workshops',
   'Visitez les ateliers de corne de zébu, de pierres précieuses et de miniatures automobiles.',
   'Visit workshops for zebu horn carving, gemstones and miniature car models.',
   'Hammer', '/images/discover/antsirabe-3.jpg', 2),
  ('a4', 'activity', 'activity4', 'Sources thermales', 'Thermal Springs',
   'Profitez des vertus des eaux thermales, réputées depuis l''époque coloniale.',
   'Enjoy the benefits of thermal waters, renowned since colonial times.',
   'Droplets', '/images/discover/garden-1.jpg', 3),
  ('at1', 'attraction', 'attraction1',
   'Parc national de Ranomafana (à la journée)', 'Ranomafana National Park (day trip)',
   NULL, NULL, NULL, NULL, 0),
  ('at2', 'attraction', 'attraction2',
   'Route des Baobabs (excursion)', 'Avenue of the Baobabs (excursion)',
   NULL, NULL, NULL, NULL, 1),
  ('at3', 'attraction', 'attraction3',
   'Marché artisanal local', 'Local craft market',
   NULL, NULL, NULL, NULL, 2),
  ('at4', 'attraction', 'attraction4',
   'Cathédrale d''Antsirabe', 'Antsirabe Cathedral',
   NULL, NULL, NULL, NULL, 3)
-- Idem : on complète ce qui est vide, on n'écrase pas ce qui a été saisi.
ON DUPLICATE KEY UPDATE
  type = VALUES(type),
  title = COALESCE(title, VALUES(title)), title_en = COALESCE(title_en, VALUES(title_en)),
  text = COALESCE(text, VALUES(text)), text_en = COALESCE(text_en, VALUES(text_en)),
  icon = COALESCE(icon, VALUES(icon)), image = COALESCE(image, VALUES(image));

INSERT INTO event_rooms (id, `key`, name, name_en, description, description_en, image, capacity, schedule, price, currency, sort_order) VALUES
  ('room1', 'room1', NULL, NULL, NULL, NULL, '/images/events/events-1.jpg', NULL, NULL, NULL, NULL, 0),
  ('room2', 'room2', NULL, NULL, NULL, NULL, '/images/events/events-2.jpg', NULL, NULL, NULL, NULL, 1),
  ('room3', 'room3', NULL, NULL, NULL, NULL, '/images/events/events-3.jpg', NULL, NULL, NULL, NULL, 2)
ON DUPLICATE KEY UPDATE `key` = VALUES(`key`), image = VALUES(image), sort_order = VALUES(sort_order);