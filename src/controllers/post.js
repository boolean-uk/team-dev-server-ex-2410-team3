import Post from '../domain/post.js'
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js'

export const create = async (req, res) => {
  const { content } = req.body

  if (!content) {
    return sendDataResponse(res, 400, { content: 'Must provide content' })
  }

  return sendDataResponse(res, 201, { post: { id: 1, content } })
}

export const getAll = async (req, res) => {
  try {
    const posts = await Post.findAll()

    return sendDataResponse(res, 200, { posts })
  } catch (error) {
    return sendMessageResponse(
      res,
      500,
      'Internal server error when fetch all posts.'
    )
  }
}
