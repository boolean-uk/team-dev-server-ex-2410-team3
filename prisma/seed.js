import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  const cohort = await createCohort();

  const student = await createUser(
    'student@test.com',
    'Testpassword1!',
    cohort.id,
    'Joe',
    'Bloggs',
    'Hello, world!',
    'student1'
  );

  const teacher = await createUser(
    'teacher@test.com',
    'Testpassword1!',
    null,
    'Rick',
    'Sanchez',
    'Hello there!',
    'teacher1',
    'TEACHER'
  );

  const post = await createPost(student.id, 'My first post!');
  await createPost(teacher.id, 'Hello, students');

  await createComment(post.id, student.id, 'Great post!');

  process.exit(0);
}

async function createComment(postId, userId, content) {
  const comment = await prisma.comment.create({
    data: {
      postId,
      userId,
      content,
    },
    include: {
      user: true,
    },
  });

  console.info('Comment created', comment);

  return comment;
}

async function createPost(userId, content) {
  const post = await prisma.post.create({
    data: {
      userId,
      content,
    },
    include: {
      user: true,
    },
  });

  console.info('Post created', post);

  return post;
}

async function createCohort() {
  const cohort = await prisma.cohort.create({
    data: {
      name: 'Web Development',
      startDate: new Date('2014-06-01'),
      endDate: new Date('2014-12-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.info('Cohort created', cohort);

  return cohort;
}

async function createUser(
  email,
  password,
  cohortId,
  firstName,
  lastName,
  bio,
  username, // Changed from githubUrl to username
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
          username, // Use username instead of githubUrl
          githubUsername: '', // Keep this as empty default as per your requirement
          profilePicture: '', // Keep this as empty default as per your requirement
          mobile: '', // Keep this as empty default as per your requirement
        },
      },
    },
    include: {
      profile: true,
    },
  });

  console.info(`${role} created`, user);

  return user;
}

seed().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
