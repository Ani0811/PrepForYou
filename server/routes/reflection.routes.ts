import { Router } from 'express'
import {
  getAllReflections,
  getReflectionById,
  createReflection,
  updateReflection,
  deleteReflection,
} from '../controllers/reflection.controller'

const router = Router()

router.get('/', getAllReflections)
router.get('/:id', getReflectionById)
router.post('/', createReflection)
router.put('/:id', updateReflection)
router.delete('/:id', deleteReflection)

export default router
