import User from '../domain/user.js'
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js'

export const create = async (req, res) => {
  const userToCreate = await User.fromJson(req.body)

  try {
    const existingUser = await User.findByEmail(userToCreate.email)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Email validation

    if (existingUser) {
      return sendDataResponse(res, 400, { email: 'Email already in use' })
    }

    if (
      userToCreate.firstName.length <= 3 ||
      userToCreate.lastName.length <= 3
    ) {
      return sendDataResponse(res, 400, {
        name: 'First and last name must be at least 3 characters long'
      })
    }

    if (!emailRegex.test(userToCreate.email)) {
      return sendDataResponse(res, 400, { email: 'Invalid email address' })
    }

    if (!userToCreate.password) {
      userToCreate.password = 'fail' // this prevents the program from crashing
    }

    if (
      req.body.password.length < 8 ||
      !/[A-Z]/.test(req.body.password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(req.body.password) ||
      !/\d/.test(req.body.password)
    ) {
      return sendDataResponse(res, 401, {
        status: 'fail',
        message:
          'The password should be at least 8 characters long, contain at least one uppercase letter, one number, and one special character.'
      })
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
  // eslint-disable-next-line camelcase
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
  const { cohort_id: cohortId } = req.body

  if (!cohortId) {
    return sendDataResponse(res, 400, { cohort_id: 'Cohort ID is required' })
  }

  return sendDataResponse(res, 201, { user: { cohort_id: cohortId } })
}

export const updateLoggedInUser = async (req, res) => {
  let { firstName, lastName, email, bio, githubUrl, password } = req.body

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
            githubUrl
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
