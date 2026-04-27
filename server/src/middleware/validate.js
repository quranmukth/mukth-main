/**
 * @middleware validate
 * @description Zod request validation factory.
 * Usage: router.post('/login', validate(loginSchema), handler)
 */
import { z } from 'zod';
import { AppError } from './errorHandler.js';

/**
 * Creates a middleware that validates req.body against a Zod schema.
 * @param {z.ZodSchema} schema
 * @param {'body'|'query'|'params'} [source='body']
 */
export const validate = (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const messages = result.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('; ');
      return next(new AppError(`Validation error — ${messages}`, 400, 'VALIDATION_ERROR'));
    }
    req[source] = result.data; // replace with coerced/parsed data
    next();
  };

// ─── Shared Zod Schemas ───────────────────────────────────────────────────────

export const z_objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  nameEn: z.string().max(80).optional(),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['student', 'teacher']).default('student'),
  curriculum: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const feedbackSchema = z.object({
  recordingId: z_objectId,
  rating: z.number().int().min(1).max(5),
  notes: z.string().max(2000).optional(),
  markers: z
    .array(
      z.object({
        time: z.number().nonnegative(),
        type: z.enum(['tajweed', 'makhraj', 'fluency', 'praise', 'note']),
        note: z.string().min(1).max(500),
      })
    )
    .default([]),
});

export const recordingMetaSchema = z.object({
  surahId: z.coerce.number().int().min(1).max(114),
  surahName: z.string().min(1),
  ayahRange: z.string().min(1),
  duration: z.coerce.number().int().positive(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'needsRedo']),
});

export const halaqaSchema = z.object({
  name: z.string().min(2).max(100),
  nameEn: z.string().max(100).optional(),
  teacherId: z_objectId,
  curriculum: z.string().optional(),
  capacity: z.coerce.number().int().min(1).max(50).default(8),
  schedule: z
    .array(
      z.object({
        day: z.string(),
        dayEn: z.string().optional(),
        time: z.string(),
        duration: z.coerce.number().default(60),
      })
    )
    .default([]),
  meetingUrl: z.string().url().optional().or(z.literal('')),
});
