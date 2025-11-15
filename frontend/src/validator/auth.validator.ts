import { z } from "zod";

// SignUp Validation
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, { message: "Full name is required." })
      .min(2, { message: "Full name must be at least 2 characters." })
      .max(100, { message: "Full name must not exceed 100 characters." })
      .regex(/^[A-Za-z\s]+$/, {
        message: "Full name must contain only letters and spaces.",
      }),
    email: z
      .string()
      .trim()
      .min(1, { message: "Email is required." })
      .email({
        message: "Please enter a valid email address (Ex: johndoe@domain.com).",
      }),
    password: z
      .string()
      .trim()
      .min(1, { message: "Password is required." })
      .min(8, { message: "Password must be at least 8 characters." })
      .max(32, { message: "Password must not exceed 32 characters." })
      .regex(/[A-Z]/, {
        message: "Password must include at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
        message: "Password must include at least one lowercase letter.",
      })
      .regex(/[0-9]/, {
        message: "Password must include at least one number.",
      })
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/, {
        message: "Password must include at least one special character.",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
    cmsId: z
      .string()
      .trim()
      .min(1, { message: "CMS ID is required." })
      .max(20, { message: "CMS ID must not exceed 20 characters." })
      .regex(/^[0-9]+$/, {
        message: "CMS ID must contain only numbers.",
      }),
    role: z
      .string()
      .min(1, { message: "Role is required." })
      .refine((val) => ["UG Student", "PG Student", "Alumni", "Faculty"].includes(val), {
        message: "Role must be UG Student, PG Student, Alumni, or Faculty",
      }),
    gender: z
      .string()
      .refine((val) => !val || ["male", "female", "other"].includes(val.toLowerCase()), {
        message: "Gender must be male, female, or other",
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

// Login Validation
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required." })
    .email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .trim()
    .min(1, { message: "Password is required." })
    .min(8, { message: "Password must be at least 8 characters." })
    .max(32, { message: "Password must not exceed 32 characters." }),
});

// Update profile validation schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  profilePictureUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  bio: z.string().optional(),
});

// Change password validation schema
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .trim()
      .min(1, { message: "Current password is required." }),
    newPassword: z
      .string()
      .trim()
      .min(1, { message: "New password is required." })
      .min(8, { message: "Password must be at least 8 characters." })
      .max(32, { message: "Password must not exceed 32 characters." })
      .regex(/[A-Z]/, {
        message: "Password must include at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
        message: "Password must include at least one lowercase letter.",
      })
      .regex(/[0-9]/, {
        message: "Password must include at least one number.",
      })
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/, {
        message: "Password must include at least one special character.",
      }),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password.",
    path: ["newPassword"],
  });

// Request password reset validation schema (Forgot Password Email)
export const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required." })
    .email({ message: "Please enter a valid email address." }),
});

// Reset password schema for forgot password page
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .trim()
      .min(1, { message: "Password is required." })
      .min(8, { message: "Password must be at least 8 characters." })
      .max(32, { message: "Password must not exceed 32 characters." })
      .regex(/[A-Z]/, {
        message: "Password must include at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
        message: "Password must include at least one lowercase letter.",
      })
      .regex(/[0-9]/, {
        message: "Password must include at least one number.",
      })
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/, {
        message: "Password must include at least one special character.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

// Type exports for TypeScript
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type RequestPasswordResetFormData = z.infer<
  typeof requestPasswordResetSchema
>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

