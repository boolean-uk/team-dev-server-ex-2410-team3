import 'dotenv/config'
import fs from 'fs'
import YAML from 'yaml'
import swaggerUi from 'swagger-ui-express'
import express from 'express'
import cors from 'cors'
import userRouter from './routes/user.js'
import postRouter from './routes/post.js'
import authRouter from './routes/auth.js'
import commentRouter from './routes/comment.js'
import cohortRouter from './routes/cohort.js'
import deliveryLogRouter from './routes/deliveryLog.js'
import User from './domain/user.js'
import Post from './domain/post.js'

const app = express()
app.disable('x-powered-by')
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// loading and hosting the docs
const docFile = fs.readFileSync('./docs/openapi.yml', 'utf8')
const swaggerDoc = YAML.parse(docFile)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

app.use('/users', userRouter)
app.use('/posts', postRouter)
app.use('/cohorts', cohortRouter)
app.use('/logs', deliveryLogRouter)
app.use('/comments', commentRouter)
app.use('/', authRouter)

app.get('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    data: {
      resource: 'Not found'
    }
  })
})

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
  if (!password || password.length <= 8) {
    return {
      isValid: false,
      message: 'Password has to be more than 8 characters'
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return { isValid: false, message: 'Email is not valid' }
  }

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
  if (!passwordRegex.test(password)) {
    return {
      isValid: false,
      message:
        'Password must contain at least one uppercase letter, one number and one special character, and be 8 characters long'
    }
  }
  return false
}

app.post('/posts', async (req, res) => {
  const { content } = req.body

  try {
    if (!content || content.length < 3) {
      return res.status(400).json({
        error: 'Content has to be more than 3 characters'
      })
    }
    const newPost = await Post.create({
      content
    })
    res.status(201).json({
      status: 'success',
      data: {
        post: newPost
      }
    })
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err.message
    })
  }
})

app.post('/users', async (req, res) => {
  const { firstName, lastName, email, bio, githubUrl, password } = req.body
  const validation = await validateData({
    firstName,
    lastName,
    email,
    password
  })
  if (!validation.isValid) {
    return res.status(400).json({
      status: 'fail',
      message: validation.message
    })
  }

  try {
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      bio,
      githubUrl,
      password
    })
    res.status(201).json({
      status: 'success',
      data: {
        user: newUser
      }
    })
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    })
  }
})

export default app
