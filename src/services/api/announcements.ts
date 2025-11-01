// src/services/api/announcements.ts
export async function getAnnouncements() {
  const res = await fetch('/api/announcements', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch announcements')
  return res.json()
}
