import { Request, Response } from 'express';
import prisma from '../db/prisma';
import { GeminiService } from '../services/geminiService';

/** Resolve internal User.id from firebaseUid query param */
async function resolveUserId(firebaseUid: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { firebaseUid },
    select: { id: true },
  });
  return user?.id ?? null;
}

/** Simple SM-2 spaced-repetition calculation */
function sm2(
  prevInterval: number,
  prevEase: number,
  prevReps: number,
  rating: number // 1=again, 2=hard, 3=good, 4=easy
): { interval: number; easeFactor: number; repetitions: number; nextReviewAt: Date } {
  let interval: number;
  let repetitions = prevReps;
  let easeFactor = Math.max(1.3, prevEase + 0.1 - (4 - rating) * (0.08 + (4 - rating) * 0.02));

  if (rating < 3) {
    interval = 1;
    repetitions = 0;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(prevInterval * easeFactor);
    }
    repetitions++;
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return { interval, easeFactor, repetitions, nextReviewAt };
}

// ─────────────────────────────────────────────────────────────────────────────
// Study Guide CRUD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/study-guides
 * List all study guides
 */
export const getStudyGuides = async (req: Request, res: Response) => {
  try {
    const guides = await prisma.studyGuide.findMany({
      where: { isPublished: true },
      include: {
        _count: { select: { keyConcepts: true, quickRefs: true, flashcards: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return res.status(200).json({ success: true, guides });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch study guides', details: error.message });
  }
};

/**
 * GET /api/study-guides/:id
 * Get the full study guide by id (with all nested content)
 */
export const getStudyGuideById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const guide = await prisma.studyGuide.findUnique({
      where: { id },
      include: {
        keyConcepts: { orderBy: { order: 'asc' } },
        quickRefs: { orderBy: { order: 'asc' } },
        flashcards: { orderBy: { order: 'asc' } },
      },
    });

    if (!guide) {
      return res.status(404).json({ error: 'Study guide not found' });
    }

    return res.status(200).json({ success: true, guide });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch study guide', details: error.message });
  }
};

/**
 * POST /api/study-guides
 * Create a study guide manually
 * Body: { title, summary, overview?, isPublished? }
 */
export const createStudyGuide = async (req: Request, res: Response) => {
  try {
    const { title, summary, overview, isPublished = true } = req.body;

    if (!title || !summary) {
      return res.status(400).json({ error: 'title and summary are required' });
    }

    const guide = await prisma.studyGuide.create({
      data: { title, summary, overview, isPublished },
      include: {
        keyConcepts: true,
        quickRefs: true,
        flashcards: true,
      },
    });

    return res.status(201).json({ success: true, guide });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create study guide', details: error.message });
  }
};

/**
 * PUT /api/study-guides/:id
 * Update a study guide
 */
export const updateStudyGuide = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { title, summary, overview, isPublished } = req.body;

    const guide = await prisma.studyGuide.update({
      where: { id },
      data: { title, summary, overview, isPublished },
      include: { keyConcepts: true, quickRefs: true, flashcards: true },
    });

    return res.status(200).json({ success: true, guide });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update study guide', details: error.message });
  }
};

/**
 * DELETE /api/study-guides/:id
 * Delete a study guide (cascades to all nested content)
 */
export const deleteStudyGuide = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.studyGuide.delete({ where: { id } });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete study guide', details: error.message });
  }
};

/**
 * POST /api/study-guides/generate
 * AI-generate a full study guide using Gemini
 * Body: { title, firebaseUid, courseId? }
 * courseId is optional — if provided, lessons are used as AI context.
 */
export const generateStudyGuide = async (req: Request, res: Response) => {
  try {
    const { title, firebaseUid, courseId } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    let courseTitle = title;
    let courseDescription = '';
    let courseDifficulty = 'beginner';
    let lessons: { title: string; content: string }[] = [];

    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { lessons: { orderBy: { order: 'asc' } } },
      });
      if (course) {
        courseTitle = course.title;
        courseDescription = course.description;
        courseDifficulty = course.difficulty;
        lessons = (course.lessons ?? []).map((l: { title: string; content: string }) => ({
          title: l.title,
          content: l.content,
        }));
      }
    }

    // Generate with Gemini
    const generated = await GeminiService.generateStudyGuide(
      courseTitle,
      courseDescription,
      courseDifficulty,
      lessons
    );

    const guide = await prisma.studyGuide.create({
      data: {
        title,
        courseId: courseId ?? null,
        summary: generated.summary,
        overview: generated.overview,
        isPublished: true,
        keyConcepts: {
          create: generated.keyConcepts.map((c, i) => ({
            term: c.term,
            definition: c.definition,
            tags: c.tags,
            order: i,
          })),
        },
        quickRefs: {
          create: generated.quickRefs.map((r, i) => ({
            title: r.title,
            content: r.content,
            tags: r.tags,
            order: i,
          })),
        },
        flashcards: {
          create: generated.flashcards.map((f, i) => ({
            front: f.front,
            back: f.back,
            difficulty: f.difficulty,
            tags: f.tags,
            order: i,
          })),
        },
      },
      include: {
        keyConcepts: { orderBy: { order: 'asc' } },
        quickRefs: { orderBy: { order: 'asc' } },
        flashcards: { orderBy: { order: 'asc' } },
      },
    });

    return res.status(201).json({ success: true, guide });
  } catch (error: any) {
    console.error('Error generating study guide:', error);
    return res.status(500).json({ error: 'Failed to generate study guide', details: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Key Concepts CRUD
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/study-guides/:id/concepts */
export const addKeyConcept = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { term, definition, tags = [], order = 0 } = req.body;
    if (!term || !definition) return res.status(400).json({ error: 'term and definition required' });
    const concept = await prisma.keyConcept.create({ data: { studyGuideId: id, term, definition, tags, order } });
    return res.status(201).json({ success: true, concept });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to add concept', details: error.message });
  }
};

/** PUT /api/study-guides/:id/concepts/:conceptId */
export const updateKeyConcept = async (req: Request, res: Response) => {
  try {
    const conceptId = Array.isArray(req.params.conceptId) ? req.params.conceptId[0] : req.params.conceptId;
    const { term, definition, tags, order } = req.body;
    const concept = await prisma.keyConcept.update({ where: { id: conceptId }, data: { term, definition, tags, order } });
    return res.status(200).json({ success: true, concept });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update concept', details: error.message });
  }
};

/** DELETE /api/study-guides/:id/concepts/:conceptId */
export const deleteKeyConcept = async (req: Request, res: Response) => {
  try {
    const conceptId = Array.isArray(req.params.conceptId) ? req.params.conceptId[0] : req.params.conceptId;
    await prisma.keyConcept.delete({ where: { id: conceptId } });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete concept', details: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Quick References CRUD
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/study-guides/:id/references */
export const addQuickReference = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { title, content, tags = [], order = 0 } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title and content required' });
    const ref = await prisma.quickReference.create({ data: { studyGuideId: id, title, content, tags, order } });
    return res.status(201).json({ success: true, ref });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to add reference', details: error.message });
  }
};

/** PUT /api/study-guides/:id/references/:refId */
export const updateQuickReference = async (req: Request, res: Response) => {
  try {
    const refId = Array.isArray(req.params.refId) ? req.params.refId[0] : req.params.refId;
    const { title, content, tags, order } = req.body;
    const ref = await prisma.quickReference.update({ where: { id: refId }, data: { title, content, tags, order } });
    return res.status(200).json({ success: true, ref });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update reference', details: error.message });
  }
};

/** DELETE /api/study-guides/:id/references/:refId */
export const deleteQuickReference = async (req: Request, res: Response) => {
  try {
    const refId = Array.isArray(req.params.refId) ? req.params.refId[0] : req.params.refId;
    await prisma.quickReference.delete({ where: { id: refId } });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete reference', details: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Flashcards CRUD
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/study-guides/:id/flashcards */
export const addFlashcard = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { front, back, difficulty = 'medium', tags = [], order = 0 } = req.body;
    if (!front || !back) return res.status(400).json({ error: 'front and back required' });
    const card = await prisma.flashcard.create({ data: { studyGuideId: id, front, back, difficulty, tags, order } });
    return res.status(201).json({ success: true, card });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to add flashcard', details: error.message });
  }
};

/** PUT /api/study-guides/:id/flashcards/:flashcardId */
export const updateFlashcard = async (req: Request, res: Response) => {
  try {
    const flashcardId = Array.isArray(req.params.flashcardId) ? req.params.flashcardId[0] : req.params.flashcardId;
    const { front, back, difficulty, tags, order } = req.body;
    const card = await prisma.flashcard.update({ where: { id: flashcardId }, data: { front, back, difficulty, tags, order } });
    return res.status(200).json({ success: true, card });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update flashcard', details: error.message });
  }
};

/** DELETE /api/study-guides/:id/flashcards/:flashcardId */
export const deleteFlashcard = async (req: Request, res: Response) => {
  try {
    const flashcardId = Array.isArray(req.params.flashcardId) ? req.params.flashcardId[0] : req.params.flashcardId;
    await prisma.flashcard.delete({ where: { id: flashcardId } });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete flashcard', details: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Spaced-Repetition Review
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/study-guides/flashcards/:flashcardId/review
 * Record a flashcard review rating and compute next review date (SM-2)
 * Body: { firebaseUid, rating } — rating: 1=again, 2=hard, 3=good, 4=easy
 */
export const reviewFlashcard = async (req: Request, res: Response) => {
  try {
    const flashcardId = Array.isArray(req.params.flashcardId) ? req.params.flashcardId[0] : req.params.flashcardId;
    const { firebaseUid, rating } = req.body;

    if (!firebaseUid || !rating) {
      return res.status(400).json({ error: 'firebaseUid and rating are required' });
    }

    const userId = await resolveUserId(firebaseUid);
    if (!userId) return res.status(404).json({ error: 'User not found' });

    const existing = await prisma.userFlashcardProgress.findUnique({
      where: { userId_flashcardId: { userId, flashcardId } },
    });

    const { interval, easeFactor, repetitions, nextReviewAt } = sm2(
      existing?.interval ?? 1,
      existing?.easeFactor ?? 2.5,
      existing?.repetitions ?? 0,
      Number(rating)
    );

    const progress = await prisma.userFlashcardProgress.upsert({
      where: { userId_flashcardId: { userId, flashcardId } },
      create: { userId, flashcardId, rating: Number(rating), interval, easeFactor, repetitions, nextReviewAt },
      update: { rating: Number(rating), interval, easeFactor, repetitions, nextReviewAt },
    });

    return res.status(200).json({ success: true, progress });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to record review', details: error.message });
  }
};

/**
 * GET /api/study-guides/:id/flashcards/review?firebaseUid=xxx
 * Get flashcards due for review for a given user
 */
export const getFlashcardsForReview = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const firebaseUid = req.query.firebaseUid as string;
    if (!firebaseUid) return res.status(400).json({ error: 'firebaseUid is required' });

    const userId = await resolveUserId(firebaseUid);
    if (!userId) return res.status(404).json({ error: 'User not found' });

    const now = new Date();

    // Get all flashcards for this guide
    const allCards = await prisma.flashcard.findMany({
      where: { studyGuideId: id },
      include: {
        userProgress: {
          where: { userId },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Due = never reviewed OR nextReviewAt <= now
    const dueCards = allCards.filter((card: any) => {
      const progress = card.userProgress[0];
      if (!progress) return true; // never reviewed
      return progress.nextReviewAt <= now;
    });

    // Strip userProgress from response
    const cards = dueCards.map((dc: any) => {
      const { userProgress, ...card } = dc;
      return card;
    });

    return res.status(200).json({ success: true, cards });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch review queue', details: error.message });
  }
};
