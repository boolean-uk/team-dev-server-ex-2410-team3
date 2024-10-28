import dbClient from '../utils/dbClient.js';

export default class Comment {
  static async create({ postId, userId, content }) {
    const newComment = await dbClient.comment.create({
      data: {
        postId,
        userId,
        content,
      },
      include: {
        user: { select: { id: true, email: true } },
        post: { select: { id: true } },
      },
    });
    return newComment;
  }

  static async findByPostId(postId) {
    return dbClient.comment.findMany({
      where: { postId },
      include: {
        user: { select: { id: true, email: true, profile: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
