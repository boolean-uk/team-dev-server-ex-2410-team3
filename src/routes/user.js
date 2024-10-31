import { Router } from 'express'
import { create, getById, getAll, updateById } from '../controllers/user.js'
import { validateAuthentication } from '../middleware/auth.js'

const router = Router()

router.post('/', create)
router.get('/', validateAuthentication, getAll)
router.get('/:id', validateAuthentication, getById)
router.patch('/:id', validateAuthentication, updateById)

export default router
