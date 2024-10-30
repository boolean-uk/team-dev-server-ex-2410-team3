import { Router } from 'express'
import {
  create,
  getAll,
  addUserToCohort,
  getById,
  update,
  deleteCohort
} from '../controllers/cohort.js'
import {
  validateAuthentication,
  validateTeacherRole
} from '../middleware/auth.js'

const router = Router()

// GET endpoints
router.get('/', validateAuthentication, getAll)
router.get('/:cohortId', validateAuthentication, getById)

// POST endpoints
router.post('/', validateAuthentication, validateTeacherRole, create)
router.post(
  '/addUser',
  validateAuthentication,
  validateTeacherRole,
  addUserToCohort
)
router.post('/', validateAuthentication, validateTeacherRole, create)

// DELETE endpoints
router.delete(
  '/:cohortId',
  validateAuthentication,
  validateTeacherRole,
  deleteCohort
)

// PUT endpoints
router.put('/:cohortId', validateAuthentication, validateTeacherRole, update)

export default router
