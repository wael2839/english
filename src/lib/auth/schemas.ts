import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'الاسم قصير جدًا').max(120, 'الاسم طويل جدًا'),
  email: z.string().trim().email('البريد غير صالح').max(191),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل').max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email('البريد غير صالح'),
  password: z.string().min(1, 'أدخل كلمة المرور'),
  rememberMe: z.boolean(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('البريد غير صالح'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20, 'رابط الاستعادة غير صالح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل').max(72),
  confirmPassword: z.string().min(8, 'أكد كلمة المرور'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
