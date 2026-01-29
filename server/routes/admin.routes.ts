import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsersWithStats,
  getAllCoursesWithMetrics,
  updateUserRole,
  toggleCoursePublished,
  deactivateUser,
  getActivityLogs,
  createUser,
  updateUserDetails,
  deleteUserById,
  reportUser,
} from '../controllers/admin.controller';

const router = Router();

/**
 * GET /api/admin/stats
 * Get aggregated dashboard statistics
 */
router.get('/stats', getDashboardStats);

/**
 * GET /api/admin/users
 * Get all users with enrollment statistics
 * Query params: page, limit
 */
router.get('/users', getAllUsersWithStats);

/**
 * GET /api/admin/courses
 * Get all courses with performance metrics
 */
router.get('/courses', getAllCoursesWithMetrics);

/**
 * PATCH /api/admin/users/:userId/role
 * Update user role (owner/admin only)
 * Body: { role: 'user' | 'admin' | 'owner' }
 */
router.patch('/users/:userId/role', updateUserRole);

/**
 * PATCH /api/admin/courses/:courseId/publish
 * Toggle course published status
 * Body: { isPublished: boolean }
 */
router.patch('/courses/:courseId/publish', toggleCoursePublished);

/**
 * DELETE /api/admin/users/:userId
 * Deactivate user (soft delete)
 */
router.delete('/users/:userId', deactivateUser);

/**
 * GET /api/admin/activity
 * Get recent activity logs
 * Query params: limit
 */
router.get('/activity', getActivityLogs);

/**
 * POST /api/admin/users
 * Create new user
 * Body: { email, displayName?, username?, role? }
 */
router.post('/users', createUser);

/**
 * PATCH /api/admin/users/:userId
 * Update user details
 * Body: { displayName?, username?, email? }
 */
router.patch('/users/:userId', updateUserDetails);

/**
 * DELETE /api/admin/users/:userId  
 * Delete user by ID (soft delete)
 */
router.delete('/users/:userId', deleteUserById);

/**
 * POST /api/admin/users/:userId/report
 * Report a user
 * Body: { reason, details? }
 */
router.post('/users/:userId/report', reportUser);

export default router;
