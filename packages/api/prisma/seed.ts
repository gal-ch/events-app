import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

const STATUSES = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'] as const
const CATEGORIES = ['Music', 'Tech', 'Sports', 'Art', 'Food', 'Business', 'Education']

async function main() {
  await prisma.event.deleteMany()

  const events = Array.from({ length: 100 }, () => {
    const startDate = faker.date.between({
      from: '2025-01-01',
      to: '2026-12-31',
    })
    const endDate = new Date(startDate.getTime() + faker.number.int({ min: 1, max: 8 }) * 60 * 60 * 1000)

    return {
      title: faker.company.catchPhrase(),
      category: faker.helpers.arrayElement(CATEGORIES),
      location: `${faker.location.city()}, ${faker.location.country()}`,
      status: faker.helpers.arrayElement(STATUSES),
      startDate,
      endDate,
      capacity: faker.number.int({ min: 20, max: 1000 }),
    }
  })

  await prisma.event.createMany({ data: events })
  console.log(`Seeded ${events.length} events`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
