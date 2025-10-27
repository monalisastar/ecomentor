import { NextResponse } from 'next/server'

export async function GET() {
  // ✅ Return mock or empty data to prevent 404
  const certificates = [
    {
      id: 'demo1',
      courseTitle: 'Carbon Accounting Mastery',
      status: 'VERIFIED',
    },
    {
      id: 'demo2',
      courseTitle: 'Sustainability Leadership',
      status: 'PENDING',
    },
  ];

  return NextResponse.json(certificates);
}
