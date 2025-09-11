'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { courseData } from '../data/courseData'

const ROTATE_INTERVAL = 5000
const CARDS_PER_VIEW = 3

export default function CoursePreview() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + CARDS_PER_VIEW) % courseData.length)
    }, ROTATE_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const visibleCourses = courseData.slice(index, index + CARDS_PER_VIEW)

  return (
    <section className="bg-[#f9fbff] text-gray-900 py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Featured Courses
        </h2>

        <div className="grid gap-10 md:grid-cols-3">
          {visibleCourses.map((course) => (
            <div key={course.slug}>
              <Link href={`/start/${course.slug}`} className="group block">
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
                  <div className="relative w-full h-56">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 text-left">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 transition">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600">{course.description}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <Link href="/courses">
          <button className="mt-10 inline-flex items-center gap-2 text-green-600 font-medium hover:underline transition">
            Browse All Courses <ArrowRight size={18} />
          </button>
        </Link>
      </div>
    </section>
  )
}

