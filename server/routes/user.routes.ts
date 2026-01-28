import { Router } from 'express'
import {
  getAllUsers,
  getUserById,
  getCurrentUser,
  createUser,
  updateUser,
  updateCurrentUser,
  deleteUser,
  getUserStats,
} from '../controllers/user.controller'
import { requireAuth, attachUserId } from '../middleware/requireAuth'
import { requireAdmin } from '../middleware/requireRole'

const router = Router()

// Public routes
router.post('/', createUser)

// Protected routes - require authentication
router.get('/me', requireAuth, attachUserId, getCurrentUser)
router.put('/me', requireAuth, attachUserId, updateCurrentUser)

// Admin routes
router.get('/', requireAuth, requireAdmin, getAllUsers)
router.get('/:id', requireAuth, getUserById)
router.get('/:id/stats', requireAuth, getUserStats)
router.put('/:id', requireAuth, requireAdmin, updateUser)
router.delete('/:id', requireAuth, requireAdmin, deleteUser)

export default router
