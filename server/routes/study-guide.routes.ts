import { Router } from 'express';
import {
  getStudyGuides,
  getStudyGuideById,
  createStudyGuide,
  updateStudyGuide,
  deleteStudyGuide,
  generateStudyGuide,
  addKeyConcept,
  updateKeyConcept,
  deleteKeyConcept,
  addQuickReference,
  updateQuickReference,
  deleteQuickReference,
  addFlashcard,
  updateFlashcard,
  deleteFlashcard,
  reviewFlashcard,
  getFlashcardsForReview,
} from '../controllers/study-guide.controller';

const router = Router();

// ── Study Guide ──────────────────────────────────────────────────────────────

/** GET  /api/study-guides             - list all published guides */
router.get('/', getStudyGuides);

/** POST /api/study-guides/generate    - AI-generate (title + optional courseId in body) */
router.post('/generate', generateStudyGuide);

/** GET  /api/study-guides/:id         - get full guide by id */
router.get('/:id', getStudyGuideById);

/** POST /api/study-guides             - create manually */
router.post('/', createStudyGuide);

/** PUT  /api/study-guides/:id         - update */
router.put('/:id', updateStudyGuide);

/** DELETE /api/study-guides/:id       - delete */
router.delete('/:id', deleteStudyGuide);

// ── Key Concepts ─────────────────────────────────────────────────────────────

/** POST   /api/study-guides/:id/concepts */
router.post('/:id/concepts', addKeyConcept);

/** PUT    /api/study-guides/:id/concepts/:conceptId */
router.put('/:id/concepts/:conceptId', updateKeyConcept);

/** DELETE /api/study-guides/:id/concepts/:conceptId */
router.delete('/:id/concepts/:conceptId', deleteKeyConcept);

// ── Quick References ─────────────────────────────────────────────────────────

/** POST   /api/study-guides/:id/references */
router.post('/:id/references', addQuickReference);

/** PUT    /api/study-guides/:id/references/:refId */
router.put('/:id/references/:refId', updateQuickReference);

/** DELETE /api/study-guides/:id/references/:refId */
router.delete('/:id/references/:refId', deleteQuickReference);

// ── Flashcards ───────────────────────────────────────────────────────────────

/** POST   /api/study-guides/:id/flashcards */
router.post('/:id/flashcards', addFlashcard);

/** PUT    /api/study-guides/:id/flashcards/:flashcardId */
router.put('/:id/flashcards/:flashcardId', updateFlashcard);

/** DELETE /api/study-guides/:id/flashcards/:flashcardId */
router.delete('/:id/flashcards/:flashcardId', deleteFlashcard);

// ── Spaced-Repetition Review ─────────────────────────────────────────────────

/** POST /api/study-guides/flashcards/:flashcardId/review */
router.post('/flashcards/:flashcardId/review', reviewFlashcard);

/** GET  /api/study-guides/:id/flashcards/review?firebaseUid=xxx */
router.get('/:id/flashcards/review', getFlashcardsForReview);

export default router;
