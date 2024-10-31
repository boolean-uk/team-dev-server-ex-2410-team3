import Post from '../src/domain/post.js'
import dbClient from '../src/utils/dbClient.js'

// The fromDb method creates a Post instance from a database object.
describe('Post Model', () => {
  describe('fromDb', () => {
    it('should create a Post instance from a database object', () => {
      const dbPost = {
        id: 1,
        content: 'This is a test post',
        userId: 2,
        user: {
          id: 2,
          cohortId: 1,
          role: 'STUDENT',
          profile: {
            firstName: 'Jane',
            lastName: 'Doe',
            bio: 'Student',
            githubUsername: 'https://github.com/janedoe',
            profileImageUrl: 'https://example.com/profile.jpg'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const post = Post.fromDb(dbPost)

      expect(post).toBeInstanceOf(Post)
      expect(post.id).toBe(dbPost.id)
      expect(post.content).toBe(dbPost.content)
      expect(post.userId).toBe(dbPost.userId)
      expect(post.user).toEqual(dbPost.user)
      expect(post.createdAt).toEqual(dbPost.createdAt)
      expect(post.updatedAt).toEqual(dbPost.updatedAt)
    })
  })
})

// The fromJson method creates a Post instance from JSON data.
describe('fromJson', () => {
  it('should create a Post instance from JSON data', async () => {
    const jsonData = {
      content: 'This is a test post from JSON',
      userId: 2
    }

    const post = await Post.fromJson(jsonData)

    expect(post).toBeInstanceOf(Post)
    expect(post.id).toBeNull()
    expect(post.content).toBe(jsonData.content)
    expect(post.userId).toBe(jsonData.userId)
  })
})

// Test that save correctly saves a new post to the database.
describe('save', () => {
  it('should save the post to the database and return a Post instance', async () => {
    const mockPost = new Post(null, 'Test content', 2)

    const dbResponse = {
      id: 1,
      content: 'Test content',
      userId: 2,
      user: {
        id: 2,
        cohortId: 1,
        role: 'STUDENT',
        profile: {
          firstName: 'Jane',
          lastName: 'Doe',
          bio: 'Student',
          githubUsername: 'https://github.com/janedoe',
          profileImageUrl: 'https://example.com/profile.jpg'
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    spyOn(dbClient.post, 'create').and.returnValue(Promise.resolve(dbResponse))

    const savedPost = await mockPost.save()

    expect(dbClient.post.create).toHaveBeenCalledWith({
      data: {
        content: mockPost.content,
        userId: mockPost.userId
      },
      include: {
        user: true
      }
    })

    expect(savedPost).toBeInstanceOf(Post)
    expect(savedPost.id).toBe(dbResponse.id)
    expect(savedPost.content).toBe(dbResponse.content)
  })
})

// Test that findById retrieves a post by its ID.
describe('findById', () => {
  it('should return a Post instance when a post with the given ID exists', async () => {
    const dbResponse = {
      id: 1,
      content: 'Test content',
      userId: 2,
      user: {
        id: 2,
        cohortId: 1,
        role: 'STUDENT',
        profile: {
          firstName: 'Jane',
          lastName: 'Doe',
          bio: 'Student',
          githubUsername: 'https://github.com/janedoe',
          profileImageUrl: 'https://example.com/profile.jpg'
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    spyOn(dbClient.post, 'findUnique').and.returnValue(
      Promise.resolve(dbResponse)
    )

    const post = await Post.findById(1)

    expect(dbClient.post.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })

    expect(post).toBeInstanceOf(Post)
    expect(post.id).toBe(dbResponse.id)
    expect(post.content).toBe(dbResponse.content)
  })

  it('should return null when no post with the given ID exists', async () => {
    spyOn(dbClient.post, 'findUnique').and.returnValue(Promise.resolve(null))

    const post = await Post.findById(999)

    expect(dbClient.post.findUnique).toHaveBeenCalledWith({
      where: { id: 999 },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })

    expect(post).toBeNull()
  })
})

// Test that findAll retrieves all posts.
describe('findAll', () => {
  it('should return an array of Post instances', async () => {
    const dbResponse = [
      {
        id: 1,
        content: 'First post',
        userId: 2,
        user: {
          /* user data */
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        content: 'Second post',
        userId: 3,
        user: {
          /* user data */
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    spyOn(dbClient.post, 'findMany').and.returnValue(
      Promise.resolve(dbResponse)
    )

    const posts = await Post.findAll()

    expect(dbClient.post.findMany).toHaveBeenCalledWith({
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })

    expect(posts.length).toBe(2)
    expect(posts[0]).toBeInstanceOf(Post)
    expect(posts[1]).toBeInstanceOf(Post)
  })
})
