import { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions";  // your NextAuth options

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session || !session.user?.email) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    // Find the student by email
    const student = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!student) {
      return res.status(404).json({ error: "Student not found" })
    }

    // Fetch submissions
    const submissions = await prisma.submission.findMany({
      where: { studentId: student.id },
      include: { assignment: true },
      orderBy: { submittedAt: "desc" },
    })

    const grades = submissions.map((s) => ({
      id: s.id,
      assignment: s.assignment.title,
      grade: s.grade ? `${s.grade}%` : "Pending",
      status: s.grade ? "Graded" : "Submitted",
      feedback: s.feedback || "",
    }))

    res.status(200).json({ grades })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
}
