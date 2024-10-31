import Post from '../domain/post.js'
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const create = async (req, res) => {
  const { content } = req.body
  const userId = req.user?.id // Ensure req.user is defined

  // Validate content length
  if (!content || content.length < 3) {
    return sendDataResponse(res, 401, {
      status: 'fail',
      message: 'Content has to be more than 3 characters'
    })
  }

  // Ensure userId is defined
  if (!userId) {
    return sendDataResponse(res, 401, {
      status: 'fail',
      message: 'User not authenticated'
    })
  }

  try {
    // Create a new post in the database
    const newPost = await prisma.post.create({
      data: {
        content,
        userId
      }
    })

    return sendDataResponse(res, 201, {
      status: 'success',
      data: {
        post: newPost
      }
    })
  } catch (err) {
    console.error('Error creating post:', err)
    return sendMessageResponse(res, 500, 'Internal Server Error')
  }
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

export const getById = async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    const foundPost = await Post.findById(id)

    if (!foundPost) {
      return sendDataResponse(res, 404, { id: 'Post not found' })
    }

    return sendDataResponse(res, 200, foundPost)
  } catch (error) {
    return sendDataResponse(res, 500, 'Unable to get post')
  }
}

export const updatePost = async (req, res) => {
  const id = parseInt(req.params.id)
  const { content } = req.body
  const { user } = req // Logged in user, which has been added to the request object by the middleware form JWT

  if (!id) {
    return sendDataResponse(res, 400, { content: 'Must provide id' })
  }

  if (!content) {
    return sendDataResponse(res, 400, { content: 'Must provide content' })
  }

  const checkIfPostExists = await Post.findById(id)
  if (!checkIfPostExists) {
    return sendDataResponse(res, 404, { id: 'Post not found' })
  }

  if (user.id !== checkIfPostExists.userId) {
    return sendDataResponse(res, 403, {
      message: 'You are only allowed to update your own posts'
    })
  }

  try {
    const updatedPost = await Post.updatePost(id, { content })

    return sendDataResponse(res, 201, updatedPost)
  } catch (error) {
    console.log('Error updating post: ', error)
    return sendMessageResponse(res, 500, 'Unable to update post')
  }
}
