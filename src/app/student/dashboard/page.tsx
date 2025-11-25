'use client';

import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { api } from '@/lib/api';

// 🧩 Components
import GreetingSection from './components/GreetingSection';
import SearchBar from './components/SearchBar';
import CategoryChips from './components/CategoryChips';
import ContinueLearning from './components/ContinueLearning';
import PopularCertificates from './components/PopularCertificates';
import LearningInsights from './components/LearningInsights';
import RecommendedCourses from './components/RecommendedCourses';

// 🧩 SWR fetcher
const fetcher = (url: string) => api.get(url);

export default function StudentDashboard() {
  const { data: session } = useSession();

  // 🧠 Fetch main overview
  const {
    data: overview,
    error: overviewError,
    isLoading: overviewLoading,
  } = useSWR('progress/overview', fetcher, {
    revalidateOnFocus: true,
    shouldRetryOnError: false,
  });

  // 🧠 Fetch certificates
  const {
    data: certificates,
    error: certsError,
    isLoading: certsLoading,
  } = useSWR('certificates', fetcher, {
    revalidateOnFocus: true,
    shouldRetryOnError: false,
  });

  // 🧩 State helpers
  const loading = overviewLoading || certsLoading;
  const error = overviewError || certsError;
  const summary = overview?.summary || {};
  const certList = certificates || [];

  const name = session?.user?.name?.split(' ')[0] || 'Learner';

  // ❌ Error Fallback
  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center text-gray-600">
        <p className="text-lg font-semibold mb-3">
          Failed to load your dashboard data.
        </p>
        <p className="text-sm">Please refresh the page or try again later.</p>
      </main>
    );
  }

  // ✅ Dashboard Layout
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">

        {/* 👋 Greeting Section */}
        <section>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : (
            <GreetingSection name={name} summary={summary} />
          )}
        </section>

        {/* 🔍 Search */}
        <section>
          <SearchBar disabled={loading} />
        </section>

        {/* 🌿 Categories */}
        <section>
          {loading ? (
            <div className="flex flex-wrap gap-3 animate-pulse">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-24 bg-gray-200 rounded-full"
                  ></div>
                ))}
            </div>
          ) : (
            <CategoryChips />
          )}
        </section>

        {/* 💡 Recommended Courses — moved above Insights */}
        <section>
          <RecommendedCourses />
        </section>

        {/* 📈 Learning Insights */}
        <section>
          <LearningInsights />
        </section>

        {/* ▶️ Continue Learning */}
        <section>
          <ContinueLearning loading={loading} />
        </section>

        {/* 🏅 Popular Certificates */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-40 bg-gray-200 rounded-xl"
                  ></div>
                ))}
            </div>
          ) : (
            <PopularCertificates certificates={certList} loading={loading} />
          )}
        </section>
      </div>
    </main>
  );
}
