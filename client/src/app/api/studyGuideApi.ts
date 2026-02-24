// Study Guide API service — handles all study-guide-related backend calls

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function parseErrorResponse(response: Response) {
  let body: any = null;
  try {
    body = await response.json();
  } catch {
    try { body = await response.text(); } catch { body = null; }
  }
  return { status: response.status, body };
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface KeyConcept {
  id: string;
  studyGuideId: string;
  term: string;
  definition: string;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuickReference {
  id: string;
  studyGuideId: string;
  title: string;
  content: string;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  studyGuideId: string;
  front: string;
  back: string;
  difficulty: string;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGuide {
  id: string;
  title: string;
  courseId?: string | null;
  summary: string;
  overview: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  keyConcepts: KeyConcept[];
  quickRefs: QuickReference[];
  flashcards: Flashcard[];
}

export interface StudyGuideSummary {
  id: string;
  title: string;
  courseId?: string | null;
  isPublished: boolean;
  updatedAt: string;
  _count: { keyConcepts: number; quickRefs: number; flashcards: number };
}

export interface UserFlashcardProgress {
  id: string;
  userId: string;
  flashcardId: string;
  rating: number | null;
  nextReviewAt: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Study Guides
// ─────────────────────────────────────────────────────────────────────────────

/** List all published study guides */
export async function getAllStudyGuides(): Promise<StudyGuideSummary[]> {
  const res = await fetch(`${API_URL}/study-guides`);
  if (!res.ok) {
    const err = await parseErrorResponse(res);
    throw Object.assign(new Error('Failed to fetch study guides'), err);
  }
  const data = await res.json();
  return data.guides;
}

/** Get full study guide by id */
export async function getStudyGuideById(id: string): Promise<StudyGuide> {
  const res = await fetch(`${API_URL}/study-guides/${id}`);
  if (!res.ok) {
    const err = await parseErrorResponse(res);
    throw Object.assign(new Error('Study guide not found'), err);
  }
  const data = await res.json();
  return data.guide;
}

/** AI-generate a study guide (title required; courseId optional for AI context) */
export async function generateStudyGuide(
  title: string,
  firebaseUid: string,
  courseId?: string
): Promise<StudyGuide> {
  const res = await fetch(`${API_URL}/study-guides/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, firebaseUid, courseId }),
  });
  if (!res.ok) {
    const err = await parseErrorResponse(res);
    throw Object.assign(new Error('Failed to generate study guide'), err);
  }
  const data = await res.json();
  return data.guide;
}

/** Create a study guide manually */
export async function createStudyGuide(payload: {
  title: string;
  summary: string;
  overview?: string;
  isPublished?: boolean;
}): Promise<StudyGuide> {
  const res = await fetch(`${API_URL}/study-guides`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await parseErrorResponse(res);
    throw Object.assign(new Error('Failed to create study guide'), err);
  }
  const data = await res.json();
  return data.guide;
}

/** Update a study guide */
export async function updateStudyGuide(id: string, payload: Partial<Pick<StudyGuide, 'summary' | 'overview' | 'isPublished'>>): Promise<StudyGuide> {
  const res = await fetch(`${API_URL}/study-guides/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await parseErrorResponse(res);
    throw Object.assign(new Error('Failed to update study guide'), err);
  }
  const data = await res.json();
  return data.guide;
}

/** Delete a study guide */
export async function deleteStudyGuide(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/study-guides/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await parseErrorResponse(res);
    throw Object.assign(new Error('Failed to delete study guide'), err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Key Concepts
// ─────────────────────────────────────────────────────────────────────────────

export async function addKeyConcept(studyGuideId: string, payload: { term: string; definition: string; tags?: string[]; order?: number }): Promise<KeyConcept> {
  const res = await fetch(`${API_URL}/study-guides/${studyGuideId}/concepts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw Object.assign(new Error('Failed to add concept'), await parseErrorResponse(res));
  return (await res.json()).concept;
}

export async function updateKeyConcept(studyGuideId: string, conceptId: string, payload: Partial<KeyConcept>): Promise<KeyConcept> {
  const res = await fetch(`${API_URL}/study-guides/${studyGuideId}/concepts/${conceptId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw Object.assign(new Error('Failed to update concept'), await parseErrorResponse(res));
  return (await res.json()).concept;
}

export async function deleteKeyConcept(studyGuideId: string, conceptId: string): Promise<void> {
  const res = await fetch(`${API_URL}/study-guides/${studyGuideId}/concepts/${conceptId}`, { method: 'DELETE' });
  if (!res.ok) throw Object.assign(new Error('Failed to delete concept'), await parseErrorResponse(res));
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick References
// ─────────────────────────────────────────────────────────────────────────────

export async function addQuickReference(studyGuideId: string, payload: { title: string; content: string; tags?: string[]; order?: number }): Promise<QuickReference> {
  const res = await fetch(`${API_URL}/study-guides/${studyGuideId}/references`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw Object.assign(new Error('Failed to add reference'), await parseErrorResponse(res));
  return (await res.json()).ref;
}

export async function updateQuickReference(studyGuideId: string, refId: string, payload: Partial<QuickReference>): Promise<QuickReference> {
  const res = await fetch(`${API_URL}/study-guides/${studyGuideId}/references/${refId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw Object.assign(new Error('Failed to update reference'), await parseErrorResponse(res));
  return (await res.json()).ref;
}

export async function deleteQuickReference(studyGuideId: string, refId: string): Promise<void> {
  const res = await fetch(`${API_URL}/study-guides/${studyGuideId}/references/${refId}`, { method: 'DELETE' });
  if (!res.ok) throw Object.assign(new Error('Failed to delete reference'), await parseErrorResponse(res));
}

// ─────────────────────────────────────────────────────────────────────────────
// Flashcards
// ─────────────────────────────────────────────────────────────────────────────

export async function addFlashcard(studyGuideId: string, payload: { front: string; back: string; difficulty?: string; tags?: string[]; order?: number }): Promise<Flashcard> {
  const res = await fetch(`${API_URL}/study-guides/${studyGuideId}/flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw Object.assign(new Error('Failed to add flashcard'), await parseErrorResponse(res));
  return (await res.json()).card;
}

export async function updateFlashcard(studyGuideId: string, flashcardId: string, payload: Partial<Flashcard>): Promise<Flashcard> {
  const res = await fetch(`${API_URL}/study-guides/${studyGuideId}/flashcards/${flashcardId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw Object.assign(new Error('Failed to update flashcard'), await parseErrorResponse(res));
  return (await res.json()).card;
}

export async function deleteFlashcard(studyGuideId: string, flashcardId: string): Promise<void> {
  const res = await fetch(`${API_URL}/study-guides/${studyGuideId}/flashcards/${flashcardId}`, { method: 'DELETE' });
  if (!res.ok) throw Object.assign(new Error('Failed to delete flashcard'), await parseErrorResponse(res));
}

// ─────────────────────────────────────────────────────────────────────────────
// Spaced-Repetition Review
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Record a flashcard review rating (1=again, 2=hard, 3=good, 4=easy)
 */
export async function reviewFlashcard(flashcardId: string, firebaseUid: string, rating: number): Promise<UserFlashcardProgress> {
  const res = await fetch(`${API_URL}/study-guides/flashcards/${flashcardId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firebaseUid, rating }),
  });
  if (!res.ok) throw Object.assign(new Error('Failed to record review'), await parseErrorResponse(res));
  return (await res.json()).progress;
}

/**
 * Get flashcards due for review today for a given user and study guide
 */
export async function getFlashcardsForReview(studyGuideId: string, firebaseUid: string): Promise<Flashcard[]> {
  const res = await fetch(`${API_URL}/study-guides/${studyGuideId}/flashcards/review?firebaseUid=${encodeURIComponent(firebaseUid)}`);
  if (!res.ok) throw Object.assign(new Error('Failed to fetch review queue'), await parseErrorResponse(res));
  return (await res.json()).cards;
}
