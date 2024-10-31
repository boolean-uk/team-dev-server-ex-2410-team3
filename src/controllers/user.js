import User from '../domain/user.js'
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js'

function validatePassword(password) {
  const passwordPattern =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return passwordPattern.test(password)
}

async function validateData({ firstName, lastName, email, password }) {
  if (!firstName || firstName.length <= 3) {
    return {
      isValid: false,
      message: 'Firstname has to be more than 3 characters'
    }
  }
  if (!lastName || lastName.length <= 3) {
    return {
      isValid: false,
      message: 'Lastname has to be more than 3 characters'
    }
  }
  if (!validatePassword(password)) {
    return {
      isValid: false,
      message:
        'Password must contain at least one uppercase letter, one number, one special character, and be 8 characters long'
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return { isValid: false, message: 'Email is not valid' }
  }

  return { isValid: true }
}

export const create = async (req, res) => {
  const { firstName, lastName, email, password, bio, githubUrl } = req.body

  // Validate input data
  const validation = await validateData({
    firstName,
    lastName,
    email,
    password
  })
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message })
  }

  try {
    const existingUser = await User.findByEmail(email)
    console.log('existingUser:', existingUser)
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      bio,
      githubUrl,
      specialism: 'Software Developer'
    })

    return res.status(201).json({ status: 'success', data: { user: newUser } })
  } catch (error) {
    console.error('Error creating new user:', error)
    return res.status(500).json({ message: 'Unable to create new user' })
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
