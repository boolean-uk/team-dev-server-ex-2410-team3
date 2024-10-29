import { sendDataResponse, sendMessageResponse } from '../utils/responses.js'
import Comment from '../domain/comment.js'

export const createComment = async (req, res) => {
  const { postId, content } = req.body

  if (!postId || !content) {
    return sendDataResponse(res, 400, {
      message: 'Post ID and content are required'
    })
  }

  try {
    const comment = await Comment.create({
      postId: parseInt(postId),
      userId: req.user.id,
      content
    })

    return sendDataResponse(res, 201, { comment })
  } catch (error) {
    return sendMessageResponse(res, 500, 'Unable to create comment')
  }
}

export const getCommentsByPost = async (req, res) => {
  const { postId } = req.params

  try {
    const comments = await Comment.findByPostId(parseInt(postId))
    return sendDataResponse(res, 200, { comments })
  } catch (error) {
    return sendMessageResponse(res, 500, 'Unable to retrieve comments')
  }
}
