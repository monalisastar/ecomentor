import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/nextAuthBridge'
import ClientCoursePage from './ClientCoursePage'

/**
 * 🔒 Server Component Wrapper
 * Ensures only enrolled students can access the course content.
 */
export default async function CoursePage(context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params // ✅ Must await params in Next.js 15

  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // 🧠 Fetch course
  const course = await prisma.course.findUnique({
    where: { slug },
  })
  if (!course) redirect('/student/courses')

  // 🔒 Check enrollment
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      courseId: course.id,
      user: { email: session.user.email },
    },
  })
  if (!enrollment) redirect(`/student/courses/${course.slug}/enroll`)

  // ✅ Pass to client UI
  return <ClientCoursePage slug={slug} />
}
