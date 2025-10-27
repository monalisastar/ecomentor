'use client';

import useSWR from 'swr';
import CourseHeader from './components/CourseHeader';
import CourseSearch from './components/CourseSearch';
import CourseFilterBar from './components/CourseFilterBar';
import CourseGrid from './components/CourseGrid';
import { api } from '@/lib/api';
import { useState, useMemo } from 'react';

// 🧩 Reusable fetcher
const fetcher = (url: string) => api.get(url);

export default function CoursesPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  // 🧠 SWR hooks — auto caching + background refresh
  const {
    data: courses,
    error: coursesError,
    isLoading: loadingCourses,
  } = useSWR('courses', fetcher, {
    revalidateOnFocus: true,
    shouldRetryOnError: false,
  });

  const {
    data: enrollments,
    error: enrollmentsError,
    isLoading: loadingEnrollments,
  } = useSWR('enrollments', fetcher, {
    revalidateOnFocus: true,
    shouldRetryOnError: false,
  });

  // 🧩 Derived state
  const loading = loadingCourses || loadingEnrollments;
  const error = coursesError || enrollmentsError;

  // 🧠 Normalize enrollment IDs
  const enrolledCourses = useMemo(() => {
    if (!enrollments) return [];
    return enrollments.map((e: any) => e.course.id);
  }, [enrollments]);

  // 🔍 Apply filters and search
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter((course: any) => {
      const matchesCategory =
        filter === 'All' || course.title.toLowerCase().includes(filter.toLowerCase());
      const matchesSearch =
        query === '' ||
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description?.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [courses, query, filter]);

  // ⚠️ Handle error state gracefully
  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center text-gray-600">
        <p className="text-lg font-semibold mb-3">
          Failed to load course data.
        </p>
        <p className="text-sm">Please refresh or try again later.</p>
      </main>
    );
  }

  // ⏳ Loading state
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-500">
        Loading courses...
      </main>
    );
  }

  // ✅ Main layout
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* 🧠 Page Header */}
        <CourseHeader />

        {/* 🔍 Filters + Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <CourseSearch query={query} setQuery={setQuery} />
          <CourseFilterBar filter={filter} setFilter={setFilter} />
        </div>

        {/* 🧩 Grid of Courses */}
        <CourseGrid
          courses={filteredCourses}
          enrolledCourses={enrolledCourses}
        />
      </div>
    </main>
  );
}
