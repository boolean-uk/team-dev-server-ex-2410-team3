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
app.use('/', authRouter)
app.use('/comments', commentRouter)

/*
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
**/
app.post('/users', async (req, res) => {
  const { firstName, lastName, email, bio, githubUrl, password } = req.body

  try {
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      bio,
      githubUrl,
      password,
      specialism: 'Software Developer'
    })
    res.status(201).json({
      status: 'success',
      data: { user: newUser }
    })
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    })
  }
})

export default app
