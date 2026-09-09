import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Seed Rooms
  console.log('Seeding rooms...')
  await prisma.room.createMany({
    data: [
      {
        id: 'classic',
        slug: 'chambre-classique',
        translationKey: 'classic',
        price: 65,
        currency: 'EUR',
        images: ['/images/rooms/room-4.jpg', '/images/rooms/room-1.jpg'],
        size: 22,
        maxGuests: 2,
        quantity: 10,
        amenities: ['ac', 'wifi', 'tv', 'bathroom'],
      },
      {
        id: 'superior',
        slug: 'chambre-superieure',
        translationKey: 'superior',
        price: 95,
        currency: 'EUR',
        images: ['/images/rooms/room-1.jpg', '/images/rooms/room-2.jpg'],
        size: 28,
        maxGuests: 3,
        quantity: 8,
        amenities: ['ac', 'wifi', 'tv', 'minibar', 'safe', 'bathroom'],
      },
      {
        id: 'deluxe',
        slug: 'chambre-deluxe',
        translationKey: 'deluxe',
        price: 130,
        currency: 'EUR',
        images: ['/images/rooms/room-2.jpg', '/images/rooms/room-3.jpg'],
        size: 34,
        maxGuests: 3,
        quantity: 6,
        amenities: ['ac', 'wifi', 'tv', 'minibar', 'safe', 'bathroom', 'balcony'],
      },
      {
        id: 'suite',
        slug: 'suite-royale',
        translationKey: 'suite',
        price: 220,
        currency: 'EUR',
        images: ['/images/rooms/room-3.jpg', '/images/rooms/room-4.jpg'],
        size: 55,
        maxGuests: 4,
        quantity: 4,
        amenities: ['ac', 'wifi', 'tv', 'minibar', 'safe', 'bathroom', 'balcony', 'lounge'],
      },
    ],
    skipDuplicates: true,
  })

  // Seed Menu Sections
  console.log('Seeding menu...')
  const startersSection = await prisma.menuSection.upsert({
    where: { id: 'starters' },
    update: {},
    create: {
      id: 'starters',
      title: 'Entrées',
      titleEn: 'Starters',
      order: 0,
    },
  })

  const mainsSection = await prisma.menuSection.upsert({
    where: { id: 'mains' },
    update: {},
    create: {
      id: 'mains',
      title: 'Plats Principaux',
      titleEn: 'Main Courses',
      order: 1,
    },
  })

  const dessertsSection = await prisma.menuSection.upsert({
    where: { id: 'desserts' },
    update: {},
    create: {
      id: 'desserts',
      title: 'Desserts',
      titleEn: 'Desserts',
      order: 2,
    },
  })

  const drinksSection = await prisma.menuSection.upsert({
    where: { id: 'drinks' },
    update: {},
    create: {
      id: 'drinks',
      title: 'Bar & Boissons',
      titleEn: 'Bar & Drinks',
      order: 3,
    },
  })

  // Seed Menu Items
  await prisma.menuItem.createMany({
    data: [
      // Starters
      { id: 's1', name: 'Salade de crudités du jardin', nameEn: 'Garden salad', description: 'Légumes frais de notre potager, vinaigrette maison', descriptionEn: 'Fresh vegetables from our garden, homemade dressing', price: 12000, order: 0, sectionId: startersSection.id },
      { id: 's2', name: 'Samoussas malgaches', nameEn: 'Malagasy samosas', description: 'Trois pièces, viande ou légumes, sauce pimentée', descriptionEn: 'Three pieces, meat or vegetable, chili sauce', price: 10000, order: 1, sectionId: startersSection.id },
      { id: 's3', name: 'Soupe de courge et gingembre', nameEn: 'Squash and ginger soup', description: 'Velouté onctueux, crème fraîche', descriptionEn: 'Creamy velouté, fresh cream', price: 11000, order: 2, sectionId: startersSection.id },
      // Mains
      { id: 'm1', name: 'Romazava traditionnel malgache', nameEn: 'Traditional Malagasy Romazava', description: 'Bouillon de viande et brèdes mafana, riz blanc', descriptionEn: 'Meat broth with mafana greens, white rice', price: 28000, order: 0, sectionId: mainsSection.id },
      { id: 'm2', name: 'Poisson grillé, sauce vanille de Madagascar', nameEn: 'Grilled fish, Madagascar vanilla sauce', description: 'Poisson du jour, sauce vanille bourbon, légumes de saison', descriptionEn: 'Catch of the day, bourbon vanilla sauce, seasonal vegetables', price: 32000, order: 1, sectionId: mainsSection.id },
      { id: 'm3', name: 'Filet de zébu au poivre sauvage', nameEn: 'Zebu filet with wild pepper', description: 'Poivre sauvage de Madagascar, gratin de pommes de terre', descriptionEn: 'Madagascar wild pepper, potato gratin', price: 35000, order: 2, sectionId: mainsSection.id },
      { id: 'm4', name: 'Curry de crevettes au lait de coco', nameEn: 'Shrimp curry with coconut milk', description: 'Riz parfumé, brochette de légumes grillés', descriptionEn: 'Fragrant rice, grilled vegetable skewer', price: 34000, order: 3, sectionId: mainsSection.id },
      // Desserts
      { id: 'd1', name: 'Assiette de fruits tropicaux', nameEn: 'Tropical fruit plate', description: "Fruits frais du jardin de l'hôtel", descriptionEn: "Fresh fruits from the hotel's garden", price: 9000, order: 0, sectionId: dessertsSection.id },
      { id: 'd2', name: 'Mousse au chocolat et vanille de Madagascar', nameEn: 'Chocolate mousse with Madagascar vanilla', description: 'Chocolat noir 70%, éclats de vanille bourbon', descriptionEn: '70% dark chocolate, bourbon vanilla shavings', price: 12000, order: 1, sectionId: dessertsSection.id },
      // Drinks
      { id: 'b1', name: 'Cocktail signature "Royal Palace"', nameEn: '"Royal Palace" signature cocktail', description: 'Rhum arrangé maison, fruits de la passion', descriptionEn: 'House-infused rum, passion fruit', price: 15000, order: 0, sectionId: drinksSection.id },
      { id: 'b2', name: 'Jus frais naturel', nameEn: 'Fresh natural juice', description: 'Ananas, mangue ou fruit de la passion', descriptionEn: 'Pineapple, mango or passion fruit', price: 7000, order: 1, sectionId: drinksSection.id },
      { id: 'b3', name: 'Sélection de vins', nameEn: 'Wine selection', description: 'Vins locaux et importés au verre ou en bouteille', descriptionEn: 'Local and imported wines by the glass or bottle', price: 18000, order: 2, sectionId: drinksSection.id },
    ],
    skipDuplicates: true,
  })

  // Seed Spa Treatments
  console.log('Seeding spa treatments...')
  await prisma.spaTreatment.createMany({
    data: [
      { id: 't1', key: 'treatment1', durationKey: 'treatment1Duration', price: 45000, order: 0 },
      { id: 't2', key: 'treatment2', durationKey: 'treatment2Duration', price: 60000, order: 1 },
      { id: 't3', key: 'treatment3', durationKey: 'treatment3Duration', price: 40000, order: 2 },
      { id: 't4', key: 'treatment4', durationKey: 'treatment4Duration', price: 42000, order: 3 },
      { id: 't5', key: 'treatment5', durationKey: 'treatment5Duration', price: 95000, order: 4 },
    ],
    skipDuplicates: true,
  })

  // Seed Event Rooms
  console.log('Seeding event rooms...')
  await prisma.eventRoom.createMany({
    data: [
      { id: 'room1', key: 'room1', image: '/images/events/events-1.jpg', order: 0 },
      { id: 'room2', key: 'room2', image: '/images/events/events-2.jpg', order: 1 },
      { id: 'room3', key: 'room3', image: '/images/events/events-3.jpg', order: 2 },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed completed successfully!')
  console.log('💡 To create the first admin account, run: npm run create-admin')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
