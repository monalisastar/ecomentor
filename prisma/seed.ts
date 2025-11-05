import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 🔑 Hash passwords
  const adminBrianPass = await bcrypt.hash('Hustler2025@', 10)
  const adminVirginiaPass = await bcrypt.hash('1980Kinyeki@', 10)
  const staffBrianPass = await bcrypt.hash('Hustler001@', 10)
  const marvelPass = await bcrypt.hash('Marvel@2025', 10)
  const chepkemboiPass = await bcrypt.hash('Chep@2025', 10)
  const virginiaStaffPass = await bcrypt.hash('Virginia@2025', 10)

  // 👑 Admins
  const admins = [
    {
      name: 'Brian Njau',
      email: 'njatabrian648@gmail.com',
      roles: ['admin'],
      password: adminBrianPass,
    },
    {
      name: 'Virginia Njata',
      email: 'virginia.njata@gmail.com',
      roles: ['admin'],
      password: adminVirginiaPass,
    },
  ]

  // 👩🏽‍🏫 Staff
  const staff = [
    {
      name: 'Marvel',
      email: 'marvel@ecomentor.green',
      roles: ['staff'],
      password: marvelPass,
    },
    {
      name: 'Chepkemboi',
      email: 'chepkemboi@ecomentor.green',
      roles: ['staff'],
      password: chepkemboiPass,
    },
    {
      name: 'Brian (Staff)',
      email: 'brian@ecomentor.green',
      roles: ['staff'],
      password: staffBrianPass,
    },
    {
      name: 'Virginia (Staff)',
      email: 'virginia@ecomentor.green',
      roles: ['staff'],
      password: virginiaStaffPass,
    },
  ]

  // 💾 Insert or update users
  for (const user of [...admins, ...staff]) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { roles: user.roles, password: user.password },
      create: user,
    })
  }

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
