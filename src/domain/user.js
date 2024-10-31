import dbClient from '../utils/dbClient.js'
import bcrypt from 'bcrypt'

export default class User {
  static fromDb(user) {
    return new User(
      user.id,
      user.cohortId,
      user.profile?.firstName,
      user.profile?.lastName,
      user.email,
      user.profile?.bio,
      user.profile?.username,
      user.profile?.githubUsername,
      user.profile?.profilePicture,
      user.profile?.mobile,
      user.password,
      user.role,
      user.specialism
    )
  }

  static async fromJson(json) {
    const {
      firstName,
      lastName,
      email,
      biography,
      password,
      specialism,
      username,
      githubUsername,
      profilePicture,
      mobile
    } = json
    const passwordHash = await bcrypt.hash(password, 8)

    return new User(
      null,
      null,
      firstName,
      lastName,
      email,
      biography,
      username,
      githubUsername,
      profilePicture,
      mobile,
      passwordHash,
      'STUDENT',
      specialism
    )
  }

  constructor(
    id,
    cohortId,
    firstName = '',
    lastName = '',
    email,
    bio = '',
    username = '',
    githubUsername = '',
    profilePicture = '',
    mobile = '',
    passwordHash = null,
    role = 'STUDENT',
    specialism = 'Software Developer'
  ) {
    this.id = id
    this.cohortId = cohortId
    this.firstName = firstName
    this.lastName = lastName
    this.email = email
    this.bio = bio
    this.username = username
    this.githubUsername = githubUsername
    this.profilePicture = profilePicture
    this.mobile = mobile
    this.passwordHash = passwordHash
    this.role = role
    this.specialism = specialism
  }

  toJSON() {
    return {
      user: {
        id: this.id,
        cohort_id: this.cohortId,
        role: this.role,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        biography: this.bio,
        username: this.username,
        githubUsername: this.githubUsername,
        profilePicture: this.profilePicture,
        mobile: this.mobile,
        specialism: this.specialism
      }
    }
  }

  async save() {
    const data = {
      email: this.email,
      password: this.passwordHash,
      role: this.role,
      specialism: this.specialism,
      profile: {
        create: {
          firstName: this.firstName,
          lastName: this.lastName,
          bio: this.bio,
          username: this.username,
          githubUsername: this.githubUsername,
          profilePicture: this.profilePicture,
          mobile: this.mobile
        }
      }
    }

    if (this.cohortId) {
      data.cohort = {
        connectOrCreate: {
          id: this.cohortId
        }
      }
    }

    const createdUser = await dbClient.user.create({
      data
    })

    return User.fromDb(createdUser)
  }

  static async update({ where, data }) {
    // If the password is being updated, hash it
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 8)
    }

    const updatedUser = await dbClient.user.update({
      where,
      data,
      include: {
        profile: true
      }
    })

    return User.fromDb(updatedUser)
  }

  static async findByEmail(email) {
    return User._findByUnique('email', email)
  }

  static async findById(id) {
    return User._findByUnique('id', id)
  }

  static async findAll() {
    return User._findMany()
  }

  static async _findByUnique(key, value) {
    const foundUser = await dbClient.user.findUnique({
      where: {
        [key]: value
      },
      include: {
        profile: true
      }
    })

    return foundUser ? User.fromDb(foundUser) : null
  }

  static async _findMany(key, value) {
    const query = {
      include: {
        profile: true
      }
    }

    if (key !== undefined && value !== undefined) {
      query.where = {
        profile: {
          [key]: value
        }
      }
    }

    const foundUsers = await dbClient.user.findMany(query)
    return foundUsers.map((user) => User.fromDb(user))
  }

  static async findManyByFirstName(firstName) {
    try {
      const users = await dbClient.user.findMany({
        where: {
          firstName: {
            contains: firstName,
            mode: 'insensitive'
          }
        }
      })
      return users
    } catch (error) {
      throw new Error('Error fetching users by first name: ' + error.message)
    }
  }
}
