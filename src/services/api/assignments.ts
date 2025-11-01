// /services/api/assignments.ts

// Fetch all assignments (admin/general overview)
export const getAssignments = async () => {
  const res = await fetch('/api/assignments');
  if (!res.ok) throw new Error('Failed to fetch assignments');
  return res.json();
};

// Fetch assignments for a specific course
export const getCourseAssignments = async (courseId: string) => {
  const res = await fetch(`/api/assignments/course/${courseId}`);
  if (!res.ok) throw new Error('Failed to fetch course assignments');
  return res.json();
};

// Create a new assignment (admin/lecturer)
export const createAssignment = async (data: any) => {
  const res = await fetch('/api/assignments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create assignment');
  return res.json();
};

// Update an existing assignment (admin/lecturer)
export const updateAssignment = async (id: string, data: any) => {
  const res = await fetch(`/api/assignments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update assignment');
  return res.json();
};

// Submit an assignment (student)
export const submitAssignment = async (assignmentId: string, submissionData: any) => {
  const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submissionData),
  });
  if (!res.ok) throw new Error('Failed to submit assignment');
  return res.json();
};

// Fetch all submissions for an assignment (lecturer)
export const getAssignmentSubmissions = async (assignmentId: string) => {
  const res = await fetch(`/api/assignments/${assignmentId}/submissions`);
  if (!res.ok) throw new Error('Failed to fetch submissions');
  return res.json();
};

// Grade a submission (lecturer)
export const gradeSubmission = async (
  submissionId: string,
  gradeData: { grade: number; feedback?: string }
) => {
  const res = await fetch(`/api/assignments/${submissionId}/grades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gradeData),
  });
  if (!res.ok) throw new Error('Failed to grade submission');
  return res.json();
};
