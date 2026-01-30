// Course API service - handles all course-related backend calls

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function parseErrorResponse(response: Response) {
  let body: any = null;
  try {
    body = await response.json();
  } catch (e) {
    try {
      body = await response.text();
    } catch (_) {
      body = null;
    }
  }
  return {
    status: response.status,
    body,
  };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  imageUrl: string | null;
  tags: string[];
  difficulty: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface CourseWithProgress extends Course {
  progress: number;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  lastAccessedAt: string | null;
}

export interface CreateCoursePayload {
  title: string;
  description: string;
  category: string;
  duration?: number;
  imageUrl?: string;
  tags?: string[];
  difficulty?: string;
}

export interface UpdateProgressPayload {
  progress?: number;
  status?: string;
}

/**
 * Get all courses with optional filtering
 */
export async function getAllCourses(params?: {
  category?: string;
  difficulty?: string;
  page?: number;
  limit?: number;
}): Promise<{ courses: Course[]; pagination: any }> {
  const searchParams = new URLSearchParams();

  if (params?.category) searchParams.append('category', params.category);
  if (params?.difficulty) searchParams.append('difficulty', params.difficulty);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const url = `${API_URL}/courses${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await parseErrorResponse(response);
    const body = err.body;
    const details = body && (body.details || body.error || body.message);
    const msg = details || String(body) || 'Failed to fetch courses';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url, status: response.status, body });
    throw new Error(errMsg);
  }

  const data = await response.json();
  return { courses: data.courses, pagination: data.pagination };
}

/**
 * Get course by ID
 */
export async function getCourseById(courseId: string): Promise<Course> {
  const response = await fetch(`${API_URL}/courses/${courseId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await parseErrorResponse(response);
    const body = err.body;
    const details = body && (body.details || body.error || body.message);
    const msg = details || String(body) || 'Failed to fetch course';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url: `${API_URL}/courses/${courseId}`, status: response.status, body });
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.course;
}

/**
 * Get courses with user progress
 */
export async function getCoursesWithProgress(
  firebaseUid: string,
  category?: string
): Promise<CourseWithProgress[]> {
  const searchParams = new URLSearchParams();
  if (category && category !== 'All') searchParams.append('category', category);

  const url = `${API_URL}/courses/user/${firebaseUid}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await parseErrorResponse(response);
    const body = err.body;
    const details = body && (body.details || body.error || body.message);
    const msg = details || String(body) || 'Failed to fetch courses with progress';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url, status: response.status, body });
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.courses;
}

/**
 * Get recommended courses for user
 */
export async function getRecommendedCourses(firebaseUid: string): Promise<CourseWithProgress[]> {
  const response = await fetch(`${API_URL}/courses/recommended/${firebaseUid}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await parseErrorResponse(response);
    const body = err.body;
    const details = body && (body.details || body.error || body.message);
    const msg = details || String(body) || 'Failed to fetch recommended courses';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url: `${API_URL}/courses/recommended/${firebaseUid}`, status: response.status, body });
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.courses;
}

/**
 * Update course progress for user
 */
export async function updateCourseProgress(
  courseId: string,
  firebaseUid: string,
  payload: UpdateProgressPayload
): Promise<any> {
  const response = await fetch(`${API_URL}/courses/${courseId}/progress/${firebaseUid}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await parseErrorResponse(response);
    const body = err.body;
    const details = body && (body.details || body.error || body.message);
    const msg = details || String(body) || 'Failed to update course progress';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url: `${API_URL}/courses/${courseId}/progress/${firebaseUid}`, status: response.status, body });
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.courseProgress;
}

/**
 * Create a new course
 */
export async function createCourse(payload: CreateCoursePayload): Promise<Course> {
  const response = await fetch(`${API_URL}/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await parseErrorResponse(response);
    const body = err.body;
    const details = body && (body.details || body.error || body.message);
    const msg = details || String(body) || 'Failed to create course';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url: `${API_URL}/courses`, status: response.status, body });
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.course;
}

/**
 * Update a course (admin only)
 */
export async function updateCourse(courseId: string, payload: Partial<CreateCoursePayload>): Promise<Course> {
  const response = await fetch(`${API_URL}/admin/courses/${courseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await parseErrorResponse(response);
    const body = err.body;
    const details = body && (body.details || body.error || body.message);
    const msg = details || String(body) || 'Failed to update course';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url: `${API_URL}/admin/courses/${courseId}`, status: response.status, body });
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.course;
}

/**
 * Delete a course (admin only)
 */
export async function deleteCourse(courseId: string): Promise<void> {
  const response = await fetch(`${API_URL}/admin/courses/${courseId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await parseErrorResponse(response);
    const body = err.body;
    const details = body && (body.details || body.error || body.message);
    const msg = details || String(body) || 'Failed to delete course';
    const errMsg = `${response.status} ${msg}`;
    console.error('API error:', { url: `${API_URL}/admin/courses/${courseId}`, status: response.status, body });
    throw new Error(errMsg);
  }
}
