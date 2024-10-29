import dbClient from '../utils/dbClient.js'

export default class Post {
  /**
   * This is JSDoc - a way for us to tell other developers what types functions/methods
   * take as inputs, what types they return, and other useful information that JS doesn't have built in
   * @tutorial https://www.valentinog.com/blog/jsdoc
   *
   * @param { { id: int, userId: int, content: string, createdAt: Date, updatedAt: Date } } post
   * @returns {Post}
   */
  static fromDb(post) {
    return new Post(
      post.id,
      post.userId,
      post.content,
      post.createdAt,
      post.updatedAt
    )
  }

  constructor(id, userId, content, createdAt, updatedAt) {
    this.id = id
    this.userId = userId
    this.content = content
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  /**
   * Save the post to the database
   * @returns {Promise<Post>}
   */
  async save() {
    const savedPost = await dbClient.post.create({
      data: {
        userId: this.userId,
        content: this.content,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    })
    return Post.fromDb(savedPost)
  }

  /**
   * Find a post by ID
   * @param {int} id
   * @returns {Promise<Post>}
   */
  static async findById(id) {
    const post = await dbClient.post.findUnique({
      where: { id }
    })
    return post ? Post.fromDb(post) : null
  }
}
