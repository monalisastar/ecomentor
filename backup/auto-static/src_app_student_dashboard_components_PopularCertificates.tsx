'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

// 🧩 Props + types
interface Certificate {
  id?: string;
  courseTitle: string;
  status?: string;
}

type PopularCertificatesProps = {
  certificates?: Certificate[];
  loading?: boolean;
};

export default function PopularCertificates({
  certificates: propCertificates,
  loading = false,
}: PopularCertificatesProps) {
  const [certificates, setCertificates] = useState<Certificate[]>(propCertificates || []);
  const [localLoading, setLocalLoading] = useState(!propCertificates);
  const [error, setError] = useState<string | null>(null);

  // 🧠 Fetch only if not provided from parent
  useEffect(() => {
    if (propCertificates) return; // parent already provided data

    async function fetchCertificates() {
      try {
        const certs = await api.get('certificates');
        setCertificates(certs || []);
      } catch (err: any) {
        console.error('Failed to fetch certificates:', err);
        setError('Could not load certificates.');
      } finally {
        setLocalLoading(false);
      }
    }

    fetchCertificates();
  }, [propCertificates]);

  const isLoading = loading || localLoading;

  // ⏳ Loading skeleton
  if (isLoading) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-gray-500 animate-pulse">
        Loading certificates...
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-red-500">
        {error}
      </section>
    );
  }

  const hasCerts = certificates.length > 0;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Popular Certifications</h2>
      <p className="text-gray-600 text-sm">
        Earn recognized certifications and boost your impact in the sustainability sector.
      </p>

      {hasCerts ? (
        <div className="flex flex-wrap gap-3">
          {certificates.map((cert) => (
            <button
              key={cert.id || cert.courseTitle}
              className={`px-4 py-2 rounded-full border text-sm transition
                ${
                  cert.status === 'VERIFIED'
                    ? 'bg-green-100 border-green-400 text-green-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-green-50'
                }`}
            >
              {cert.courseTitle}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          You haven’t earned any certificates yet. Complete your courses to unlock them!
        </p>
      )}
    </section>
  );
}
