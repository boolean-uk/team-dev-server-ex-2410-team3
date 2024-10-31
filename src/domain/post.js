import dbClient from '../utils/dbClient.js'

export default class Post {
  static fromDb(post) {
    return new Post(
      post.id,
      post.content,
      post.userId,
      post.user,
      post.createdAt,
      post.updatedAt
    )
  }

  static async fromJson(json) {
    const { content, userId } = json

    return new Post(null, content, userId)
  }

  constructor(id, content, userId, user = null, createdAt, updatedAt) {
    this.id = id
    this.content = content
    this.userId = userId
    this.user = user
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  // I've changed the user value at the bottom of this to author in order to match the open api's response.
  toJSON() {
    return {
      id: this.id,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      author: {
        id: this.user.id,
        cohortId: this.user.cohortId,
        role: this.user.role,
        firstName: this.user.profile?.firstName,
        lastName: this.user.profile?.lastName,
        bio: this.user.profile?.bio,
        githubUsername: this.user.profile?.githubUsername,
        profileImageUrl: this.user.profile?.profileImageUrl
      }
    }
  }

  static async updatePost(id, { content }) {
    const updatedPost = await dbClient.post.update({
      where: {
        id
      },
      data: {
        content,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                bio: true,
                githubUrl: true
              }
            }
          }
        }
      }
    })
    console.log('inside domain: ' + updatedPost)
    return updatedPost
  }

  // I've made both the create method and the save method depending on what is preferred.
  async save() {
    const data = {
      content: this.content,
      userId: this.userId
    }

    const createdPost = await dbClient.post.create({
      data,
      include: {
        user: true
      }
    })

    return Post.fromDb(createdPost)
  }

  static async create({ content, userId }) {
    const newPost = await dbClient.post.create({
      data: {
        content,
        userId
      },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })
    return newPost
  }

  static async findById(id) {
    return Post._findByUnique('id', id)
  }

  static async findAll() {
    return Post._findMany()
  }

  static async findAllByUserId(userId) {
    return Post._findMany('userId', userId)
  }

  static async _findByUnique(key, value) {
    const foundPost = await dbClient.post.findUnique({
      where: {
        [key]: value
      },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })

    return foundPost ? Post.fromDb(foundPost) : null
  }

  static async _findMany(key, value) {
    const query = {
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    }

    if (key !== undefined && value !== undefined) {
      query.where = {
        [key]: value
      }
    }

    const foundPosts = await dbClient.post.findMany(query)
    return foundPosts.map((post) => Post.fromDb(post))
  }
}
