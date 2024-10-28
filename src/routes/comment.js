import { Router } from 'express';
import { createComment, getCommentsByPost } from '../controllers/comment.js';
import { validateAuthentication } from '../middleware/auth.js';

const router = Router();

router.post('/', validateAuthentication, createComment);
router.get('/post/:postId', validateAuthentication, getCommentsByPost);

export default router;
