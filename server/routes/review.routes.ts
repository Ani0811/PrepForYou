import { Router } from 'express'
import {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getDueReviews,
} from '../controllers/review.controller'

const router = Router()

router.get('/', getAllReviews)
router.get('/due', getDueReviews)
router.get('/:id', getReviewById)
router.post('/', createReview)
router.put('/:id', updateReview)
router.delete('/:id', deleteReview)

export default router
