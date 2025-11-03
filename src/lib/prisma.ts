import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // ✅ Only log minimal info in dev, nothing in production
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"] // optional: add "info" if you want summary logs
        : ["error"],
  })

// Prevent multiple Prisma clients during hot reload in dev
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
