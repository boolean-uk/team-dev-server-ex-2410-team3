import User from '../domain/user.js'
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js'
import dbClient from '../utils/dbClient.js'

export const create = async (req, res) => {
  const userToCreate = await User.fromJson(req.body)

  try {
    const existingUser = await User.findByEmail(userToCreate.email)

    if (existingUser) {
      return sendDataResponse(res, 400, { email: 'Email already in use' })
    }

    const createdUser = await userToCreate.save()

    return sendDataResponse(res, 201, createdUser)
  } catch (error) {
    return sendMessageResponse(res, 500, 'Unable to create new user')
  }
}

export const getById = async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    const foundUser = await User.findById(id)

    if (!foundUser) {
      return sendDataResponse(res, 404, { id: 'User not found' })
    }

    return sendDataResponse(res, 200, foundUser);
  } catch (e) {
    return sendMessageResponse(res, 500, 'Unable to get user')
  }
}

export const getAll = async (req, res) => {
  const { first_name: firstName } = req.query

  let foundUsers

  if (firstName) {
    foundUsers = await User.findManyByFirstName(firstName)
  } else {
    foundUsers = await User.findAll()
  }

  const formattedUsers = foundUsers.map((user) => {
    return {
      ...user.toJSON().user
    }
  })

  return sendDataResponse(res, 200, { users: formattedUsers })
}

export const updateById = async (req, res) => {
  const id = parseInt(req.params.id)
  const {
    cohort_id: cohortId,
    firstName,
    lastName,
    bio,
    username,
    githubUsername,
    profilePicture,
    mobile
  } = req.body

  try {
    const foundUser = await User.findById(id)
    if (!foundUser) {
      return sendDataResponse(res, 404, { id: 'User not found' })
    }

    const updatedUser = await dbClient.user.update({
      where: { id },
      data: {
        cohortId,
        profile: {
          update: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(bio && { bio }),
            ...(username && { username }),
            ...(githubUsername && { githubUsername }),
            ...(profilePicture && { profilePicture }),
            ...(mobile && { mobile })
          }
        }
      },
      include: { profile: true }
    })

    const updatedUserResponse = User.fromDb(updatedUser)

    return sendDataResponse(res, 200, updatedUserResponse)
  } catch (error) {
    return sendMessageResponse(res, 500, 'Unable to update user')
  }
}
