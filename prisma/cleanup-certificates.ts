import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function run() {
  console.log("🧹 Starting certificate cleanup...")

  // 1️⃣ Reset accidentally revoked certificates to PENDING
  const reset = await prisma.certificate.updateMany({
    where: { status: "REVOKED" },
    data: { status: "PENDING" },
  })
  console.log(`🔄 Reset ${reset.count} revoked certificates to PENDING.`)

  // 2️⃣ Deduplicate by keeping only the newest per (studentId, courseSlug)
  const all = await prisma.certificate.findMany({
    orderBy: { createdAt: "desc" },
  })

  const seen = new Set<string>()
  let deletedCount = 0

  for (const cert of all) {
    const key = `${cert.studentId}::${cert.courseSlug}`
    if (seen.has(key)) {
      await prisma.certificate.delete({ where: { id: cert.id } })
      deletedCount++
    } else {
      seen.add(key)
    }
  }

  console.log(`🗑️ Deleted ${deletedCount} duplicate certificates.`)
  console.log("✅ Certificate cleanup completed successfully.")
}

run()
  .catch((err) => {
    console.error("❌ Cleanup failed:", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
