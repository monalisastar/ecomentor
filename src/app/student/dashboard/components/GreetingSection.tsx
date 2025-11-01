'use client';

type Summary = {
  enrolled?: number;
  completed?: number;
  certificates?: number;
  averageProgress?: number;
};

type GreetingSectionProps = {
  name: string;
  summary?: Summary;
};

export default function GreetingSection({ name, summary }: GreetingSectionProps) {
  const hasSummary = summary && Object.keys(summary).length > 0;

  return (
    <section className="space-y-3">
      {/* 👋 Greeting */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
        Hello, {name}! 👋
      </h1>

      {/* ✨ Motivational line */}
      <p className="text-gray-600">
        What would you like to learn today? Explore new environmental and sustainability courses below.
      </p>

      {/* 📊 Progress overview */}
      {hasSummary && (
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-700">
          <span className="px-3 py-1 bg-green-50 border border-green-200 rounded-full">
            {summary.enrolled ?? 0} Enrolled
          </span>
          <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
            {summary.completed ?? 0} Completed
          </span>
          <span className="px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
            {summary.certificates ?? 0} Certificates
          </span>
          <span className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
            Avg Progress: {summary.averageProgress ?? 0}%
          </span>
        </div>
      )}
    </section>
  );
}
