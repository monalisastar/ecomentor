'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Award, BookOpen, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'

type CourseProgress = {
  id: string
  title: string
  progress: number
}

type Certificate = {
  id: string
  title: string
  date: string
  url: string
}

type StudentProfile = {
  id: string
  name: string
  email: string
  joined: string
  bio?: string
  avatar?: string
  courses: CourseProgress[]
  certificates: Certificate[]
}

export default function StudentProfilePage() {
  const { id } = useParams()
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStudent() {
      try {
        setLoading(true)
        const data = await api.get(`students/${id}`)
        setStudent(data)
      } catch (err) {
        console.error('Failed to fetch student:', err)
        setError('Failed to load student profile.')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchStudent()
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-500">
        Loading student profile...
      </main>
    )
  }

  if (error || !student) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center text-red-500">
        {error || 'Student not found.'}
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 space-y-8">
      {/* 🔙 Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/staff/students"
          className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 font-medium"
        >
          <ArrowLeft size={16} /> Back to Students
        </Link>
      </div>

      {/* 🧑 Profile Header */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center gap-6">
        <img
          src={
            student.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              student.name
            )}&background=16a34a&color=fff`
          }
          alt={student.name}
          className="w-28 h-28 rounded-full object-cover border-4 border-green-100"
        />
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-600">{student.email}</p>
          <p className="text-sm text-gray-500">Joined on {student.joined}</p>
          {student.bio && <p className="text-gray-700 mt-3">{student.bio}</p>}
        </div>
      </section>

      {/* 📘 Enrolled Courses */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="text-green-700" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">
            Enrolled Courses
          </h2>
        </div>

        <div className="space-y-3">
          {student.courses.length > 0 ? (
            student.courses.map((course) => (
              <div
                key={course.id}
                className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium text-gray-800">{course.title}</p>
                  <div className="w-40 bg-gray-200 h-2 rounded-full mt-1">
                    <div
                      className="h-2 rounded-full bg-green-600"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600">
                  {course.progress}% complete
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No enrolled courses yet.</p>
          )}
        </div>
      </section>

      {/* 🏅 Certificates */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="text-yellow-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Certificates</h2>
        </div>

        {student.certificates.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {student.certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-medium text-gray-800">{cert.title}</h3>
                  <p className="text-sm text-gray-500">
                    Issued on {cert.date}
                  </p>
                </div>
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-green-700 hover:text-green-900 text-sm font-medium flex items-center gap-1"
                >
                  <User size={14} /> View Certificate
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No certificates issued yet.</p>
        )}
      </section>
    </main>
  )
}
