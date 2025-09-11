import prisma from "./prisma"; // default import

async function test() {
  try {
    const users = await prisma.user.findMany();
    console.log("✅ Prisma connected! Users:", users);
  } catch (error) {
    console.error("❌ Prisma connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
