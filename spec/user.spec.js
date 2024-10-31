import User from '../src/domain/user.js'
import dbClient from '../src/utils/dbClient.js'
import bcrypt from 'bcrypt'

describe('User Domain Model', () => {
  let mockUserData

  beforeEach(() => {
    mockUserData = {
      id: 1,
      cohortId: 1,
      email: 'test@example.com',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        bio: 'Bio',
        githubUrl: 'https://github.com/testuser',
        specialism: 'Software Developer'
      },
      password: 'hashedpassword',
      role: 'STUDENT'
    }

    spyOn(dbClient.user, 'create').and.callFake((data) =>
      Promise.resolve({ ...mockUserData, ...data.data })
    )
    spyOn(dbClient.user, 'findUnique').and.callFake(({ where }) => {
      if (where.email === 'notfound@example.com' || where.id === 999) {
        return Promise.resolve(null)
      }
      return Promise.resolve(mockUserData)
    })
    spyOn(dbClient.user, 'findMany').and.callFake((query) =>
      Promise.resolve([mockUserData])
    )
    spyOn(bcrypt, 'hash').and.callFake((password) =>
      Promise.resolve(`hashed_${password}`)
    )
  })

  describe('User.fromDb', () => {
    it('should create a User instance from database data', () => {
      const user = User.fromDb(mockUserData)
      expect(user).toBeInstanceOf(User)
      expect(user.id).toBe(1)
      expect(user.firstName).toBe('Test')
    })
  })

  describe('User.fromJson', () => {
    it('should create a User instance from JSON data', async () => {
      const json = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        biography: 'Bio',
        githubUrl: 'https://github.com/testuser',
        password: 'password123',
        specialism: 'Software Developer'
      }

      const user = await User.fromJson(json)

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 8)
      expect(user).toBeInstanceOf(User)
      expect(user.passwordHash).toBe('hashed_password123')
    })
  })

  describe('User constructor', () => {
    it('should construct a User instance with given properties', () => {
      const user = new User(
        1,
        1,
        'Test',
        'User',
        'test@example.com',
        'Bio',
        'https://github.com/testuser',
        'hashedpassword',
        'STUDENT'
      )

      expect(user.id).toBe(1)
      expect(user.cohortId).toBe(1)
      expect(user.firstName).toBe('Test')
      expect(user.role).toBe('STUDENT')
    })

    it('should default role to STUDENT if not provided', () => {
      const user = new User(
        1,
        1,
        'Test',
        'User',
        'test@example.com',
        'Bio',
        'https://github.com/testuser',
        'hashedpassword'
      )

      expect(user.role).toBe('STUDENT')
    })
  })

  describe('User.toJSON', () => {
    it('should return a JSON representation of the User', () => {
      const user = new User(
        1,
        1,
        'Test',
        'User',
        'test@example.com',
        'Bio',
        'https://github.com/testuser',
        'hashedpassword',
        'STUDENT'
      )

      const json = user.toJSON()
      expect(json).toEqual({
        user: {
          id: 1,
          cohort_id: 1,
          role: 'STUDENT',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          biography: 'Bio',
          githubUrl: 'https://github.com/testuser'
        }
      })
    })
  })

  describe('User.save', () => {
    it('should save a new user to the database', async () => {
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        bio: 'Bio',
        githubUrl: 'https://github.com/testuser',
        password: 'Password123!',
        specialism: 'Software Developer' // Add specialism field
      })

      await user.save()

      const json = user.toJSON()
      expect(json).toEqual({
        user: {
          id: 1,
          cohort_id: 1,
          role: 'STUDENT',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          biography: 'Bio',
          githubUrl: 'https://github.com/testuser',
          specialism: 'Software Developer' // Add specialism field
        }
      })
    })

    it('should handle saving without cohortId', async () => {
      const user = new User(
        null,
        null,
        'Test',
        'User',
        'test@example.com',
        'Bio',
        'https://github.com/testuser',
        'hashedpassword',
        'STUDENT'
      )

      await user.save()

      const expectedData = {
        data: {
          email: 'test@example.com',
          password: 'hashedpassword',
          role: 'STUDENT',
          profile: {
            create: {
              firstName: 'Test',
              lastName: 'User',
              bio: 'Bio',
              githubUrl: 'https://github.com/testuser'
            }
          }
        },
        include: {
          profile: true
        }
      }

      expect(dbClient.user.create).toHaveBeenCalledWith(expectedData)
    })

    it('should handle saving without firstName and lastName', async () => {
      const user = new User(
        null,
        1,
        null,
        null,
        'test@example.com',
        'Bio',
        'https://github.com/testuser',
        'hashedpassword',
        'STUDENT'
      )

      await user.save()

      const expectedData = {
        data: {
          email: 'test@example.com',
          password: 'hashedpassword',
          role: 'STUDENT',
          cohort: {
            connectOrCreate: {
              id: 1
            }
          }
        },
        include: {
          profile: true
        }
      }

      expect(dbClient.user.create).toHaveBeenCalledWith(expectedData)
    })
  })

  describe('User.findByEmail', () => {
    it('should find a user by email', async () => {
      const user = await User.findByEmail('test@example.com')

      expect(dbClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { profile: true }
      })
      expect(user).toBeInstanceOf(User)
    })

    it('should return null if user not found', async () => {
      const user = await User.findByEmail('notfound@example.com')

      expect(user).toBeNull()
    })
  })

  describe('User.findById', () => {
    it('should find a user by id', async () => {
      const user = await User.findById(1)

      expect(dbClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { profile: true }
      })
      expect(user).toBeInstanceOf(User)
    })

    it('should return null if user not found', async () => {
      const user = await User.findById(999)

      expect(user).toBeNull()
    })
  })

  describe('User.findManyByFirstName', () => {
    it('should find users by first name', async () => {
      const users = await User.findManyByFirstName('Test')

      expect(dbClient.user.findMany).toHaveBeenCalledWith({
        where: {
          profile: {
            firstName: 'Test'
          }
        },
        include: { profile: true }
      })
      expect(users.length).toBeGreaterThan(0)
      expect(users[0]).toBeInstanceOf(User)
    })
  })

  describe('User.findAll', () => {
    it('should find all users', async () => {
      const users = await User.findAll()

      expect(dbClient.user.findMany).toHaveBeenCalledWith({
        include: { profile: true }
      })
      expect(users.length).toBeGreaterThan(0)
      expect(users[0]).toBeInstanceOf(User)
    })
  })

  describe('Private Methods', () => {
    describe('User._findByUnique', () => {
      it('should find a user by unique key', async () => {
        const user = await User._findByUnique('email', 'test@example.com')

        expect(dbClient.user.findUnique).toHaveBeenCalledWith({
          where: { email: 'test@example.com' },
          include: { profile: true }
        })
        expect(user).toBeInstanceOf(User)
      })

      it('should return null if user not found', async () => {
        const user = await User._findByUnique('email', 'notfound@example.com')

        expect(user).toBeNull()
      })
    })

    describe('User._findMany', () => {
      it('should find many users with given key and value', async () => {
        const users = await User._findMany('firstName', 'Test')

        expect(dbClient.user.findMany).toHaveBeenCalledWith({
          where: {
            profile: {
              firstName: 'Test'
            }
          },
          include: { profile: true }
        })
        expect(users.length).toBeGreaterThan(0)
      })

      it('should find all users when no key and value are provided', async () => {
        const users = await User._findMany()

        expect(dbClient.user.findMany).toHaveBeenCalledWith({
          include: { profile: true }
        })
        expect(users.length).toBeGreaterThan(0)
      })
    })
  })
})
