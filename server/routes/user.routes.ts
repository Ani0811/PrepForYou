import { Router } from 'express';
import {
  upsertUserOnSignIn,
  getUserByFirebaseUid,
  updateUserProfile,
  deleteUser,
  getAllUsers,
  updateUserRole,
  getUserStats,
} from '../controllers/user.controller';

const router = Router();

/**
 * POST /api/users/signin
 * Upsert user on sign-in (create or update from Firebase)
 * Body: { firebaseUid, email, displayName?, avatarUrl?, avatarProvider? }
 */
router.post('/signin', upsertUserOnSignIn);
 
/**
 * GET /api/users/:firebaseUid/stats
 * Get user stats and learning analytics
 */
router.get('/:firebaseUid/stats', getUserStats);

/**
 * GET /api/users/:firebaseUid
 * Get user by Firebase UID
 */
router.get('/:firebaseUid', getUserByFirebaseUid);

/**
 * PATCH /api/users/:firebaseUid
 * Update user profile (username and/or avatar)
 * Body: { username?, avatarUrl?, avatarStoragePath?, avatarProvider? }
 */
router.patch('/:firebaseUid', updateUserProfile);

/**
 * DELETE /api/users/:firebaseUid
 * Soft delete user (set isActive to false)
 */
router.delete('/:firebaseUid', deleteUser);

/**
 * GET /api/users
 * Get all users (paginated)
 * Query params: page, limit, active
 */
router.get('/', getAllUsers);

/**
 * PATCH /api/users/:userId/role
 * Update user role (admin/owner only)
 * Body: { role: 'user' | 'admin' | 'owner' }
 */
router.patch('/:userId/role', updateUserRole);
export default router;
