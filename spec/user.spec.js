// This test suite will test functionality in /src/domain/user.js
// This test suite will test functionality in the user.js files
import User from '../src/domain/user.js'
import dbClient from '../src/utils/dbClient.js'

describe('User Model', () => {
  describe('fromDb', () => {
    it('should create a User instance from a database object', () => {
      const dbUser = {
        id: 1,
        cohortId: 2,
        email: 'test@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Software Engineer',
          githubUrl: 'https://github.com/johndoe'
        },
        password: 'hashedpassword',
        role: 'STUDENT'
      }

      const user = User.fromDb(dbUser)

      expect(user).toBeInstanceOf(User)
      expect(user.id).toBe(dbUser.id)
      expect(user.email).toBe(dbUser.email)
      expect(user.firstName).toBe(dbUser.profile.firstName)
    })
  })
})

describe('findByEmail', () => {
  it('should find a user by email and return a User instance', async () => {
    const email = 'test@example.com'
    const dbResponse = {
      id: 1,
      cohortId: 1,
      email: 'test@example.com',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Software Engineer',
        githubUrl: 'https://github.com/johndoe'
      },
      role: 'STUDENT'
    }
    spyOn(dbClient.user, 'findUnique').and.returnValue(
      Promise.resolve(dbResponse)
    )

    const user = await User.findByEmail(email)
    expect(user).toBeInstanceOf(User)
    expect(user.email).toBe(email)
  })
})
