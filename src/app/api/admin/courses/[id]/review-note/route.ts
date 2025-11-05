import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: token.email },
    select: { roles: true },
  })

  const isAdmin = user?.roles?.includes('admin')
  if (!isAdmin)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = params
  const { note } = await req.json()

  if (!note?.trim())
    return NextResponse.json({ error: 'Empty note' }, { status: 400 })

  const saved = await prisma.course.update({
    where: { id },
    data: {
      // append or overwrite the adminNote field
      instructorNotes: note,
      adminStatus: 'UNDER_REVIEW',
    },
  })

  return NextResponse.json(saved)
}
