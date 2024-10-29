import dbClient from '../utils/dbClient.js'

export default class Post {
  /**
   * @param { { id: int, content: string, userId: int, User: { id: int, cohortId: int, email: string, Profile: { firstName: string, lastName: string, bio: string, githubUrl: string, profileImageUrl: string } } } } post
   * @returns {Post}
   */

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

  // I've changed the name value at the bottom of this to match the open api's response with the user objects renamed as author.
  toJSON() {
    return {
      post: {
        id: this.id,
        content: this.content,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        author: {
          id: this.user.id,
          cohortId: this.user.cohortId,
          role: this.user.role,
          firstname: this.user.profile?.firstName,
          lastName: this.user.profile?.lastName,
          bio: this.user.profile?.bio,
          githubUrl: this.user.profile?.githubUrl,
          profileImageUrl: this.user.profile?.profileImageUrl
        }
      }
    }
  }

  /**
   * @returns {Post}
   *  A post instance containing an ID, representing the post data created in the database
   */

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

  static async findById(id) {
    return Post._findByUnique('id', id)
  }

  static async findAll() {
    return Post._findMany()
  }

  static async findAllByUserId(userId) {
    return Post._findMany('userId', userId)
  }

  static async _findMany(key, value) {
    const query = {
      include: {
        user: true
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
