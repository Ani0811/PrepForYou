import { Router } from 'express'
import {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  markMaterialComplete,
} from '../controllers/material.controller'

const router = Router()

router.get('/', getAllMaterials)
router.get('/:id', getMaterialById)
router.post('/', createMaterial)
router.put('/:id', updateMaterial)
router.delete('/:id', deleteMaterial)
router.post('/:id/complete', markMaterialComplete)

export default router
