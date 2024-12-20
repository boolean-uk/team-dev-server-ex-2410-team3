import { Router } from 'express'
import { create, getAll, getById, updatePost } from '../controllers/post.js'
import { validateAuthentication } from '../middleware/auth.js'

const router = Router()

router.post('/', validateAuthentication, create)
router.get('/', validateAuthentication, getAll)
router.get('/:id', validateAuthentication, getById)
router.put('/:id', validateAuthentication, updatePost)

export default router
