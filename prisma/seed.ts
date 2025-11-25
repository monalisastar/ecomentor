import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // 🔑 Hash passwords
  const adminBrianPass = await bcrypt.hash("Hustler2025@", 10)
  const adminVirginiaPass = await bcrypt.hash("1980Kinyeki@", 10)
  const staffBrianPass = await bcrypt.hash("Hustler001@", 10)
  const marvelPass = await bcrypt.hash("Marvel@2025", 10)
  const chepkemboiPass = await bcrypt.hash("Chep@2025", 10)
  const virginiaStaffPass = await bcrypt.hash("Virginia@2025", 10)

  const now = new Date()

  // 👑 Admins (auto-verified + active)
  const admins = [
    {
      name: "Brian Njau",
      email: "njatabrian648@gmail.com",
      roles: ["admin"],
      password: adminBrianPass,
      emailVerified: now,
      status: "ACTIVE",
    },
    {
      name: "Virginia Njata",
      email: "virginia.njata@gmail.com",
      roles: ["admin"],
      password: adminVirginiaPass,
      emailVerified: now,
      status: "ACTIVE",
    },
  ]

  // 👩🏽‍🏫 Staff (auto-verified + active)
  const staff = [
    {
      name: "Marvel",
      email: "marvel@ecomentor.green",
      roles: ["staff"],
      password: marvelPass,
      emailVerified: now,
      status: "ACTIVE",
    },
    {
      name: "Chepkemboi",
      email: "chepkemboi@ecomentor.green",
      roles: ["staff"],
      password: chepkemboiPass,
      emailVerified: now,
      status: "ACTIVE",
    },
    {
      name: "Brian (Staff)",
      email: "brian@ecomentor.green",
      roles: ["staff"],
      password: staffBrianPass,
      emailVerified: now,
      status: "ACTIVE",
    },
    {
      name: "Virginia (Staff)",
      email: "virginia@ecomentor.green",
      roles: ["staff"],
      password: virginiaStaffPass,
      emailVerified: now,
      status: "ACTIVE",
    },
  ]

  // 💾 Upsert to avoid duplicates and ensure updates
  for (const user of [...admins, ...staff]) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password: user.password,
        roles: user.roles,
        emailVerified: user.emailVerified,
        status: user.status,
      },
      create: user,
    })
  }

  console.log("✅ Seed completed successfully! Admins & Staff marked as verified.")
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
