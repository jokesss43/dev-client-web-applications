export interface User {
  id: number;
  username: string;
  fullName: string;
}

export interface Comment {
  id: number;
  body: string;
  postId: number;
  likes: number;
  user: User;
}

export interface CommentsApiResponse {
  comments: Comment[];
  total: number;
  skip: number;
  limit: number;
}

export interface CreateCommentInput {
  body: string;
  postId: number;
  username: string;
  userId?: number;
}

export interface UpdateCommentInput {
  id: number;
  body: string;
  postId?: number;
  username?: string;
}
