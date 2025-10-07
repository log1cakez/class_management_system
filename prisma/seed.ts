import { PrismaClient, BehaviorType } from '@prisma/client'

const prisma = new PrismaClient()

const individualBehaviors = [
  {
    name: 'Sitting properly',
    praise: 'The group is sitting so neatly and properly!'
  },
  {
    name: 'Participating',
    praise: 'Great participation shown by the whole group!'
  },
  {
    name: 'Listening attentively',
    praise: 'The group listened with full attention—fantastic!'
  },
  {
    name: 'Working cooperatively',
    praise: 'Great cooperation—everyone worked so well together!'
  },
  {
    name: 'Following instruction',
    praise: 'Excellent effort in doing exactly what was asked!'
  },
  {
    name: 'Finishing tasks on time',
    praise: 'Task completed right on time—great group effort!'
  },
  {
    name: 'Staying in the designated place',
    praise: 'This group stayed right in place responsibly!'
  },
  {
    name: 'Working quietly',
    praise: 'Fantastic focus and silence while working!'
  }
]

const groupWorkBehaviors = [
  { name: 'Collaboration', praise: 'Amazing teamwork! Everyone contributed and worked together beautifully.' },
  { name: 'Leadership', praise: 'Strong leadership shown—guiding the team with kindness and clarity!' },
  { name: 'Communication', praise: 'Clear and respectful communication—great listening and sharing of ideas!' },
  { name: 'Problem solving', praise: 'Clever thinking to solve the challenge as a team—well done!' },
  { name: 'Active participation', praise: 'Everyone got involved—fantastic group energy and effort!' },
  { name: 'Respectful listening', praise: 'Wonderful listening—everyone gave each other a chance to speak.' },
  { name: 'Sharing ideas', praise: 'So many creative ideas shared—brilliant collaboration!' },
  { name: 'Supporting teammates', praise: 'You lifted each other up—kindness and support all the way!' }
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

  // Seed individual task behaviors
  console.log('📝 Creating individual task behaviors...')
  for (const behavior of individualBehaviors) {
    const behaviorRecord = await prisma.behavior.upsert({
      where: {
        name_teacherId: {
          name: behavior.name,
          teacherId: defaultTeacher.id
        }
      },
      update: {
        name: behavior.name,
        praise: behavior.praise,
        isDefault: true,
        behaviorType: BehaviorType.INDIVIDUAL
      },
      create: {
        name: behavior.name,
        praise: behavior.praise,
        teacherId: defaultTeacher.id,
        isDefault: true,
        behaviorType: BehaviorType.INDIVIDUAL
      }
    })
    console.log(`✅ Individual behavior created: ${behavior.name} - "${behavior.praise}"`)
  }

  // Seed group work behaviors
  console.log('👥 Creating group work behaviors...')
  for (const { name: behaviorName, praise: defaultPraise } of groupWorkBehaviors) {
    const behavior = await prisma.behavior.upsert({
      where: {
        name_teacherId: {
          name: behaviorName,
          teacherId: defaultTeacher.id
        }
      },
      update: {
        name: behaviorName,
        praise: defaultPraise,
        isDefault: true,
        behaviorType: BehaviorType.GROUP_WORK
      },
      create: {
        name: behaviorName,
        praise: defaultPraise,
        teacherId: defaultTeacher.id,
        isDefault: true,
        behaviorType: BehaviorType.GROUP_WORK
      }
    })
    console.log(`✅ Group work behavior created: ${behaviorName}`)
  }

  // Ensure ALL existing teachers have copies of default GROUP_WORK behaviors
  console.log('👩‍🏫 Propagating default group work behaviors to all teachers...')
  const allTeachers = await prisma.teacher.findMany()
  const defaultGroupBehaviors = await prisma.behavior.findMany({
    where: { teacherId: defaultTeacher.id, isDefault: true, behaviorType: BehaviorType.GROUP_WORK }
  })

  for (const teacher of allTeachers) {
    if (teacher.id === defaultTeacher.id) continue
    for (const def of defaultGroupBehaviors) {
      await prisma.behavior.upsert({
        where: {
          name_teacherId: { name: def.name, teacherId: teacher.id }
        },
        update: {
          // keep teacher-specific copy up to date with name/praise
          name: def.name,
          praise: def.praise ?? null,
          behaviorType: BehaviorType.GROUP_WORK,
          isDefault: false
        },
        create: {
          name: def.name,
          praise: def.praise ?? null,
          teacherId: teacher.id,
          isDefault: false,
          behaviorType: BehaviorType.GROUP_WORK
        }
      })
    }
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
