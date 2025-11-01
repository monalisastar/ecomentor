'use client';

import { useEffect, useState } from 'react';
import { PlayCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

// 🧩 Props + types
type ContinueLearningProps = {
  loading?: boolean;
};

type CourseProgress = {
  id: string;
  progress: number;
  completed: boolean;
  course: {
    id: string;
    title: string;
    slug: string;
    image?: string;
  };
};

export default function ContinueLearning({ loading = false }: ContinueLearningProps) {
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      try {
        setLocalLoading(true);
        const res = await apiRequest('/api/progress', 'GET');
        if (res && Array.isArray(res)) setCourses(res);
      } catch (err) {
        console.error('Error fetching progress:', err);
      } finally {
        setLocalLoading(false);
      }
    }
    fetchProgress();
  }, []);

  const isLoading = loading || localLoading;

  // ⏳ Loading skeleton
  if (isLoading) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading your courses...
      </section>
    );
  }

  // 🚫 No progress
  if (courses.length === 0) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Continue Learning
        </h2>
        <p className="text-sm">You haven’t started any courses yet.</p>
      </section>
    );
  }

  // ✅ Courses in progress
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Continue Learning</h2>

      <div className="grid sm:grid-cols-2 gap-6">
        {courses.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-lg border border-gray-100 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <h3 className="font-semibold text-gray-900">
                {item.course.title}
              </h3>
              <p className="text-sm text-gray-500">
                {item.completed ? 'Completed' : 'In Progress'}
              </p>
            </div>

            <div className="mt-3">
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{item.progress}% Complete</span>
                <Link
                  href={`/student/courses/${item.course.slug}`}
                  className="flex items-center text-green-600 hover:underline"
                >
                  <PlayCircle size={14} className="mr-1" /> Continue
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
