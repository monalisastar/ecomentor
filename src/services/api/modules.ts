// /services/api/modules.ts

// -------------------------
// Fetch modules for a specific course
// -------------------------
export const getCourseModules = async (courseId: string) => {
  const res = await fetch(`/api/courses/${courseId}/modules`);
  if (!res.ok) throw new Error('Failed to fetch modules');
  return res.json();
};

// -------------------------
// Fetch a single module by ID
// -------------------------
export const getModule = async (moduleId: string) => {
  const res = await fetch(`/api/modules/${moduleId}`);
  if (!res.ok) throw new Error('Failed to fetch module');
  return res.json();
};

// -------------------------
// Create a new module (Lecturer/Admin)
// -------------------------
export const createModule = async (courseId: string, data: any) => {
  const res = await fetch(`/api/courses/${courseId}/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create module');
  return res.json();
};

// -------------------------
// Update an existing module (Lecturer/Admin)
// -------------------------
export const updateModule = async (moduleId: string, data: any) => {
  const res = await fetch(`/api/modules/${moduleId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update module');
  return res.json();
};

// -------------------------
// Delete a module (Lecturer/Admin)
// -------------------------
export const deleteModule = async (moduleId: string) => {
  const res = await fetch(`/api/modules/${moduleId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete module');
  return res.json();
};

// -------------------------
// Mark module as completed (Student)
// -------------------------
export const completeModule = async (moduleId: string) => {
  const res = await fetch(`/api/modules/${moduleId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to complete module');
  return res.json();
};

// -------------------------
// Fetch module resources
// -------------------------
export const getModuleResources = async (moduleId: string) => {
  const res = await fetch(`/api/modules/${moduleId}/resources`);
  if (!res.ok) throw new Error('Failed to fetch module resources');
  return res.json();
};

// -------------------------
// Add resource to module (Lecturer/Admin)
// -------------------------
export const addModuleResource = async (moduleId: string, data: any) => {
  const res = await fetch(`/api/modules/${moduleId}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add module resource');
  return res.json();
};

// -------------------------
// Delete module resource (Lecturer/Admin)
// -------------------------
export const deleteModuleResource = async (moduleId: string, resourceId: string) => {
  const res = await fetch(`/api/modules/${moduleId}/resources/${resourceId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete module resource');
  return res.json();
};
