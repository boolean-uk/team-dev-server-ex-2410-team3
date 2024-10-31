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

    return sendDataResponse(res, 200, foundUser)
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

export const updateLoggedInUser = async (req, res) => {
  let { firstName, lastName, email, bio, githubUsername, password } = req.body

  if (!password) {
    password = 'fail' // this prevents the program from crashing
  }
  const userId = parseInt(req.params.id) // Get the user ID from the request parameters  // Password validation
  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[!@#$%^&*(),.?":{}|<>]/.test(password) ||
    !/\d/.test(password)
  ) {
    return sendDataResponse(res, 401, {
      status: 'fail',
      message:
        'The password should be at least 8 characters long, contain at least one uppercase letter, one number, and one special character.'
    })
  }

  const loggedInId = req.user.id //  the logged-in user's ID
  const loggedInUser = await User.findById(loggedInId)
  if (!loggedInUser) {
    return sendDataResponse(res, 404, { id: 'Logged in user not found' })
  }

  if (loggedInUser.role === 'TEACHER') {
    // do the update
  } else if (loggedInUser.role === 'STUDENT' && loggedInId === userId) {
    // do the update
  } else {
    return sendDataResponse(res, 403, {
      id: 'Invalid request, students can only update themselves.'
    })
  }

  try {
    const foundUser = await User.findById(userId)

    if (!foundUser) {
      return sendDataResponse(res, 404, { id: 'User not found' })
    }

    if (email === '') {
      email = foundUser.email
    } else if (firstName === '') {
      firstName = foundUser.firstName
    } else if (lastName === '') {
      lastName = foundUser.lastName
    }

    const updatedUser = await User.update({
      where: { id: userId },
      data: {
        email,
        password,
        profile: {
          update: {
            firstName,
            lastName,
            bio,
            githubUsername
          }
        }
      }
    })

    return sendDataResponse(res, 201, { user: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error.stack)
    return sendMessageResponse(res, 500, 'Internal Server Error')
  }
}
