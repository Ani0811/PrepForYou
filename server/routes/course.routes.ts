import { Router } from 'express';
import {
  getAllCourses,
  getCourseById,
  getCoursesWithProgress,
  getRecommendedCourses,
  updateCourseProgress,
  createCourse,
  getCourseProgressByUser,
  generateContent,
} from '../controllers/course.controller';
import {
  addLesson,
  getLessonsByCourseId,
  completeLesson,
} from '../controllers/lesson.controller';

const router = Router();

/**
 * GET /api/courses
 * Get all courses with optional filtering
 * Query params: category, difficulty, page, limit, includeInactive
 */
router.get('/', getAllCourses);

/**
 * POST /api/courses
 * Create a new course (admin only in production)
 * Body: { title, description, category, duration, imageUrl?, tags?, difficulty? }
 */
router.post('/', createCourse);

/**
 * POST /api/courses/:courseId/lessons
 * Add a lesson to a course
 * Body: { title, content, order, duration, videoUrl }
 */
router.post('/:courseId/lessons', addLesson);

/**
 * GET /api/courses/:courseId/lessons
 * Get all lessons for a course
 */
router.get('/:courseId/lessons', getLessonsByCourseId);

/**
 * POST /api/courses/:courseId/lessons/:lessonId/complete
 * Mark a lesson as complete
 * Body: { firebaseUid }
 */
router.post('/:courseId/lessons/:lessonId/complete', completeLesson);

/**
 * GET /api/courses/user/:firebaseUid
 * Get all courses with user's progress
 */
router.get('/user/:firebaseUid', getCoursesWithProgress);

/**
 * GET /api/courses/recommended/:firebaseUid
 * Get recommended courses for user
 */
router.get('/recommended/:firebaseUid', getRecommendedCourses);

/**
 * GET /api/courses/:courseId
 * Get course by ID (includes lessons)
 */
router.get('/:courseId', getCourseById);

/**
 * PATCH /api/courses/:courseId/progress/:firebaseUid
 * Update course progress for user
 * Body: { progress, status }
 */
router.patch('/:courseId/progress/:firebaseUid', updateCourseProgress);

/**
 * GET /api/courses/:courseId/progress/:firebaseUid/details
 * Get detailed course progress for user including lesson status
 */
router.get('/:courseId/progress/:firebaseUid/details', getCourseProgressByUser);

/**
 * POST /api/courses/generate-content
 * Generate content using AI
 * Body: { topic, level, count }
 */
router.post('/generate-content', generateContent);

export default router;
