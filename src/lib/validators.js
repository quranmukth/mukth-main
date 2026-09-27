// ── Zod Validators — Form validation schemas ────────────────────────────────
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('أدخل بريد إلكتروني صحيح'),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
    .min(6, 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'الاسم مطلوب')
      .min(3, 'الاسم يجب أن يكون ٣ أحرف على الأقل'),
    email: z
      .string()
      .min(1, 'البريد الإلكتروني مطلوب')
      .email('أدخل بريد إلكتروني صحيح'),
    phone: z
      .string()
      .min(1, 'رقم الهاتف مطلوب'),
    password: z
      .string()
      .min(6, 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل'),
    confirmPassword: z
      .string()
      .min(1, 'تأكيد كلمة المرور مطلوب'),
    role: z.enum(['student', 'teacher', 'admin'], {
      required_error: 'اختر الدور',
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'كلمة المرور غير متطابقة',
    path: ['confirmPassword'],
  });

export const feedbackSchema = z.object({
  rating: z
    .number()
    .min(1, 'التقييم مطلوب')
    .max(5),
  notes: z
    .string()
    .min(1, 'الملاحظات مطلوبة')
    .min(10, 'الملاحظات يجب أن تكون ١٠ أحرف على الأقل'),
  markers: z.array(
    z.object({
      time: z.number(),
      type: z.string(),
      note: z.string().min(1, 'الملاحظة مطلوبة'),
    })
  ).optional().default([]),
});

export const halqaSchema = z.object({
  name: z.string().min(1, 'اسم الحلقة مطلوب'),
  teacherId: z.string().min(1, 'المعلم مطلوب'),
  curriculum: z.string().min(1, 'المنهج مطلوب'),
  capacity: z.number().min(1, 'السعة يجب أن تكون ١ على الأقل').max(20),
  schedule: z.array(
    z.object({
      day: z.string(),
      time: z.string(),
      duration: z.number(),
    })
  ).min(1, 'يجب إضافة موعد واحد على الأقل'),
});

export const profileSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون ٣ أحرف على الأقل'),
  email: z.string().email('أدخل بريد إلكتروني صحيح'),
  phone: z.string().optional(),
});

export const userCreateSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون ٣ أحرف على الأقل'),
  email: z.string().email('أدخل بريد إلكتروني صحيح'),
  phone: z.string().min(1, 'رقم الهاتف مطلوب'),
  role: z.enum(['student', 'teacher', 'admin']),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل'),
});

// Validation helper
export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data, errors: null };
  const errors = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return { success: false, data: null, errors };
}
