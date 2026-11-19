import { z } from 'zod';

// Forbidden spam keywords domain rule
const FORBIDDEN_WORDS = ['spam', 'viagra', 'casino', 'free money', 'click here'];

export const CommentUserSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(1, 'Имя пользователя не может быть пустым'),
  fullName: z.string().optional().default(''),
});

// Domain rule: custom validation for spam keywords and domain constraints
export const CreateCommentSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, 'Имя пользователя должно содержать не менее 2 символов')
    .max(50, 'Имя пользователя не должно превышать 50 символов')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Имя пользователя может содержать только латиницу, цифры, точки и дефисы'),
  
  postId: z
    .number({ message: 'ID поста должен быть числом' })
    .int('ID поста должен быть целым числом')
    .positive('ID поста должен быть больше 0')
    .max(10000, 'Некорректный ID публикации'),

  body: z
    .string()
    .trim()
    .min(5, 'Текст комментария должен содержать минимум 5 символов')
    .max(500, 'Текст комментария не должен превышать 500 символов')
    .refine(
      (text) => !FORBIDDEN_WORDS.some((word) => text.toLowerCase().includes(word)),
      { message: 'Комментарий содержит недопустимые спам-слова' }
    ),

  userId: z.number().int().positive().optional().default(5),
});

export const UpdateCommentSchema = z.object({
  id: z.number().int().positive('Некорректный ID комментария'),
  body: z
    .string()
    .trim()
    .min(5, 'Текст комментария должен содержать минимум 5 символов')
    .max(500, 'Текст комментария не должен превышать 500 символов')
    .refine(
      (text) => !FORBIDDEN_WORDS.some((word) => text.toLowerCase().includes(word)),
      { message: 'Комментарий содержит недопустимые спам-слова' }
    ),
  postId: z.number().int().positive().optional(),
  username: z.string().trim().min(2).max(50).optional(),
});

// Boundary validation schema for DummyJSON responses
export const DummyJsonCommentSchema = z.object({
  id: z.number(),
  body: z.string(),
  postId: z.number(),
  likes: z.number().optional().default(0),
  user: z.object({
    id: z.number(),
    username: z.string(),
    fullName: z.string().optional().default(''),
  }),
});

export const DummyJsonCommentsResponseSchema = z.object({
  comments: z.array(DummyJsonCommentSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

// Infer TypeScript types directly from Zod schemas
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;
export type CommentUser = z.infer<typeof CommentUserSchema>;
export type ValidatedComment = z.infer<typeof DummyJsonCommentSchema>;
export type ValidatedCommentsResponse = z.infer<typeof DummyJsonCommentsResponseSchema>;
