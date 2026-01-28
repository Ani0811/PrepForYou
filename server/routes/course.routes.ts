import { Router } from 'express';
import {
  getAllCourses,
  getCourseById,
  getCoursesWithProgress,
  getRecommendedCourses,
  updateCourseProgress,
  createCourse,
} from '../controllers/course.controller';

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
 * Get course by ID
 */
router.get('/:courseId', getCourseById);

/**
 * PATCH /api/courses/:courseId/progress/:firebaseUid
 * Update course progress for user
 * Body: { progress, status }
 */
router.patch('/:courseId/progress/:firebaseUid', updateCourseProgress);

export default router;
