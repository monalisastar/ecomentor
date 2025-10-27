// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { courseData } from '../src/data/courseData.ts'


const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Eco-Mentor LMS courses...')

  for (const course of courseData) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        description: course.description,
        image: course.image,
        unlockWithAERA: course.unlockWithAERA,
        category: getCategoryFromSlug(course.slug),
        createdBy: 'system-seed', // ✅ default system marker
      },
      create: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        image: course.image,
        unlockWithAERA: course.unlockWithAERA,
        category: getCategoryFromSlug(course.slug),
        createdBy: 'system-seed',
      },
    })
  }

  console.log('✅ Course seeding complete!')
}

// 🧩 Helper: simple mapping function for category
function getCategoryFromSlug(slug: string): string {
  if (slug.startsWith('climate') || slug.startsWith('carbon') || slug.startsWith('ghg'))
    return 'Foundational'
  if (slug.startsWith('scope-')) return 'Sectoral Scopes'
  if (slug.includes('diploma') || slug.includes('management') || slug.includes('mrv'))
    return 'Professional Diplomas'
  if (
    slug.includes('project') ||
    slug.includes('policy') ||
    slug.includes('validation') ||
    slug.includes('verification') ||
    slug.includes('digital')
  )
    return 'Carbon Projects & Technology'
  return 'General'
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
