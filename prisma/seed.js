import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
const prisma = new PrismaClient()

async function seed() {
  const cohort = await createCohort()

  const student = await createUser(
    'student@test.com',
    'Testpassword1!',
    cohort.id,
    'Joe',
    'Bloggs',
    'Hello, world!',
    'student1'
  )
  const teacher = await createUser(
    'teacher@test.com',
    'Testpassword1!',
    null,
    'Rick',
    'Sanchez',
    'Hello there!',
    'teacher1',
    'TEACHER'
  )

  const post = await createPost(student.id, 'My first post!')
  await createPost(teacher.id, 'Hello, students')

  await createComment(post.id, student.id, 'Great post!')

  await addUsersToCohort(cohort.id, student.id)

  process.exit(0)
}

async function createComment(postId, userId, content) {
  const comment = await prisma.comment.create({
    data: {
      postId,
      userId,
      content
    },
    include: {
      user: true
    }
  })

  console.info('Comment created', comment)

  return comment
}

async function createPost(userId, content) {
  const post = await prisma.post.create({
    data: {
      userId,
      content
    },
    include: {
      user: true
    }
  })

  console.info('Post created', post)

  return post
}

async function createCohort() {
  const cohort = await prisma.cohort.create({
    data: {
      name: 'Web Development',
      startDate: new Date('2014-06-01'),
      endDate: new Date('2014-12-01'),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  console.info('Cohort created', cohort)

  return cohort
}

async function addUsersToCohort(cohortId, userId) {
  const cohort = await prisma.cohort.update({
    where: { id: cohortId },
    data: {
      users: {
        connect: { id: userId }
      }
    }
  })

  // Adding cohort to user
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      cohorts: {
        connect: { id: cohortId }
      }
    }
  })

  console.log('-----')
  console.log('Added user: ', user)
  console.log('To cohort: ', cohort)
  console.log('-----')

  return { cohort, user }
}

async function createUser(
  email,
  password,
  cohortId,
  firstName,
  lastName,
  bio,
  githubUrl,
  role = 'STUDENT'
) {
  const user = await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 8),
      role,
      cohortId,
      profile: {
        create: {
          firstName,
          lastName,
          bio,
          githubUrl
        }
      }
    },
    include: {
      profile: true
    }
  })

  console.info(`${role} created`, user)

  return user
}

seed().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
