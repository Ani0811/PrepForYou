import { Router } from 'express'
import {
  getAllAIOutputs,
  getAIOutputById,
  createAIOutput,
  updateAIOutput,
  deleteAIOutput,
} from '../controllers/aiOutput.controller'

const router = Router()

router.get('/', getAllAIOutputs)
router.get('/:id', getAIOutputById)
router.post('/', createAIOutput)
router.put('/:id', updateAIOutput)
router.delete('/:id', deleteAIOutput)

export default router
