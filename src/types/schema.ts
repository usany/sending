import zod from 'zod';

// Email request schema
export const EmailRequestSchema = zod.object({
  to: zod.string().email('Invalid email address'),
  number: zod.string().min(1, 'Number is required'),
  language: zod.enum(['ko', 'en']).default('en')
});

// Comment creation schema
export const CreateCommentSchema = zod.object({
  slug: zod.string().min(1, 'Slug is required'),
  author: zod.string().min(1, 'Author name is required').max(100, 'Author name too long'),
  content: zod.string().min(1, 'Content is required').max(1000, 'Content too long'),
  password: zod.string().min(1, 'Password is required').max(50, 'Password too long')
});

// Comment update schema
export const UpdateCommentSchema = zod.object({
  id: zod.number().min(1, 'Comment ID is required'),
  content: zod.string().min(1, 'Content is required').max(1000, 'Content too long'),
  password: zod.string().min(1, 'Password is required').max(50, 'Password too long')
});

// Password verification schema
export const VerifyPasswordSchema = zod.object({
  password: zod.string().min(1, 'Password is required').max(50, 'Password too long')
});

// Comment deletion schema
export const DeleteCommentSchema = zod.object({
  id: zod.number().min(1, 'Comment ID is required'),
  password: zod.string().min(1, 'Password is required').max(50, 'Password too long')
});

// Export types
export type EmailRequest = zod.infer<typeof EmailRequestSchema>;
export type CreateComment = zod.infer<typeof CreateCommentSchema>;
export type UpdateComment = zod.infer<typeof UpdateCommentSchema>;
export type VerifyPassword = zod.infer<typeof VerifyPasswordSchema>;
export type DeletePassword = zod.infer<typeof DeleteCommentSchema>;
