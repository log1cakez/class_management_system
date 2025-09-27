import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultBehaviors = [
  'Participate',
  'Following instruction',
  'Sitting properly',
  'Finish task on time',
  'Listening attentively',
  'Stays in the designated place',
  'Working cooperatively',
  'Working quietly'
]

async function main() {
  console.log('🌱 Starting database seed...')

  // Create a default teacher for seeding behaviors
  const defaultTeacher = await prisma.teacher.upsert({
    where: { email: 'default@teacher.com' },
    update: {},
    create: {
      email: 'default@teacher.com',
      name: 'Default Teacher',
      password: 'hashed_password_placeholder' // This will be updated when real teachers are created
    }
  })

  console.log('✅ Default teacher created:', defaultTeacher.id)

  // Seed default behaviors
  for (const behaviorName of defaultBehaviors) {
    const behavior = await prisma.behavior.upsert({
      where: {
        name_teacherId: {
          name: behaviorName,
          teacherId: defaultTeacher.id
        }
      },
      update: {
        // Mark as default behavior
        name: behaviorName,
        isDefault: true
      },
      create: {
        name: behaviorName,
        teacherId: defaultTeacher.id,
        isDefault: true
      }
    })
    console.log(`✅ Default behavior created: ${behaviorName}`)
  }

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
