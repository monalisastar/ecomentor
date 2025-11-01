import React from "react";;;
import { outlines, findCourseBySlug } from "@/utils/courseHelpers";;;
import { courseData } from "@/data/courseData";;;


export default async function Page({ params }: any) {
  const course = findCourseBySlug(params.slug);
  const outline = outlines[params.slug];

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-500">
        <h1>Course not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {course.title}
        </h1>
        <p className="text-lg text-gray-700 mb-6">{course.description}</p>

        {outline && (
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Course Outline</h2>
            <ul className="list-disc list-inside space-y-2">
              {outline.map((item, index) => (
                <li key={index} className="text-gray-800">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return courseData.map((course) => ({
    slug: course.slug,
  }));
}

