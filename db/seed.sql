USE royal_palace;

INSERT INTO rooms (id, slug, translation_key, price, currency, size, max_guests, total_units) VALUES
  ('classic', 'chambre-classique', 'classic', 65, 'EUR', 22, 2, 10),
  ('superior', 'chambre-superieure', 'superior', 95, 'EUR', 28, 3, 8),
  ('deluxe', 'chambre-deluxe', 'deluxe', 130, 'EUR', 34, 3, 6),
  ('suite', 'suite-royale', 'suite', 220, 'EUR', 55, 4, 4)
ON DUPLICATE KEY UPDATE
  slug = VALUES(slug), translation_key = VALUES(translation_key), price = VALUES(price),
  currency = VALUES(currency), size = VALUES(size), max_guests = VALUES(max_guests), total_units = VALUES(total_units);

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

INSERT INTO spa_treatments (id, `key`, duration_key, price, sort_order) VALUES
  ('t1', 'treatment1', 'treatment1Duration', 45000, 0),
  ('t2', 'treatment2', 'treatment2Duration', 60000, 1),
  ('t3', 'treatment3', 'treatment3Duration', 40000, 2),
  ('t4', 'treatment4', 'treatment4Duration', 42000, 3),
  ('t5', 'treatment5', 'treatment5Duration', 95000, 4)
ON DUPLICATE KEY UPDATE `key` = VALUES(`key`), duration_key = VALUES(duration_key), price = VALUES(price), sort_order = VALUES(sort_order);

INSERT INTO event_rooms (id, `key`, image, sort_order) VALUES
  ('room1', 'room1', '/images/events/events-1.jpg', 0),
  ('room2', 'room2', '/images/events/events-2.jpg', 1),
  ('room3', 'room3', '/images/events/events-3.jpg', 2)
ON DUPLICATE KEY UPDATE `key` = VALUES(`key`), image = VALUES(image), sort_order = VALUES(sort_order);