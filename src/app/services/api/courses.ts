// /services/api/courses.ts

// Fetch all courses (for general users)
export const getCourses = async () => {
  const res = await fetch('/api/courses');
  if (!res.ok) throw new Error('Failed to fetch courses');
  return res.json();
};

// Fetch courses for logged-in user
export const getMyCourses = async () => {
  const res = await fetch('/api/courses/my');
  if (!res.ok) throw new Error('Failed to fetch my courses');
  return res.json();
};

// Enroll user into a course
export const enrollInCourse = async (courseId: string) => {
  const res = await fetch(`/api/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Enrollment failed');
  return res.json();
};

// Admin: fetch pending courses
export const getPendingCourses = async () => {
  const res = await fetch('/api/courses/pending');
  if (!res.ok) throw new Error('Failed to fetch pending courses');
  return res.json();
};

// Admin: approve a course
export const approveCourse = async (courseId: string) => {
  const res = await fetch(`/api/courses/${courseId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Approval failed');
  return res.json();
};
