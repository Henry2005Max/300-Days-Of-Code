import { z } from "zod";

/* ── Register ── */
export const RegisterSchema = z.object({
    name: z
        .string({ required_error: "name is required" })
        .min(2, "name must be at least 2 characters")
        .max(80, "name must be at most 80 characters")
        .trim(),

    email: z
        .string({ required_error: "email is required" })
        .email("must be a valid email address")
        .toLowerCase(),

    password: z
        .string({ required_error: "password is required" })
        .min(8, "password must be at least 8 characters")
        .regex(/[A-Z]/, "password must contain at least one uppercase letter")
        .regex(/[0-9]/, "password must contain at least one number"),

    confirmPassword: z.string({ required_error: "confirmPassword is required" }),

    bio: z.string().max(300, "bio must be at most 300 characters").optional(),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path:    ["confirmPassword"],
    }
);

/* ── Login ── */
export const LoginSchema = z.object({
    email:    z.string({ required_error: "email is required" }).email().toLowerCase(),
    password: z.string({ required_error: "password is required" }),
});

/* ── Update profile (name, bio, avatarUrl only) ── */
export const UpdateProfileSchema = z.object({
    name:      z.string().min(2).max(80).trim().optional(),
    bio:       z.string().max(300).optional().nullable(),
    avatarUrl: z.string().url("avatarUrl must be a valid URL").optional().nullable(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided" }
);

/* ── Change password ─────────────────────────────────────────────────
   Must provide current password first — prevents token theft attacks.
   New password must be different from current.
────────────────────────────────────────────────────────────────────── */
export const ChangePasswordSchema = z.object({
    currentPassword: z.string({ required_error: "currentPassword is required" }),
    newPassword: z
        .string({ required_error: "newPassword is required" })
        .min(8, "new password must be at least 8 characters")
        .regex(/[A-Z]/, "new password must contain at least one uppercase letter")
        .regex(/[0-9]/, "new password must contain at least one number"),
    confirmNewPassword: z.string({ required_error: "confirmNewPassword is required" }),
}).refine(
    (data) => data.newPassword === data.confirmNewPassword,
    { message: "New passwords do not match", path: ["confirmNewPassword"] }
).refine(
    (data) => data.currentPassword !== data.newPassword,
    { message: "New password must be different from current password", path: ["newPassword"] }
);

/* ── Change email — requires password confirmation ── */
export const ChangeEmailSchema = z.object({
    newEmail:        z.string({ required_error: "newEmail is required" }).email().toLowerCase(),
    currentPassword: z.string({ required_error: "currentPassword is required" }),
});

/* ── Delete account — requires password confirmation ── */
export const DeleteAccountSchema = z.object({
    password: z.string({ required_error: "password is required" }),
    confirm:  z.literal("DELETE", { errorMap: () => ({ message: 'confirm must be the string "DELETE"' }) }),
});

export type RegisterInput      = z.infer<typeof RegisterSchema>;
export type LoginInput         = z.infer<typeof LoginSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type ChangeEmailInput   = z.infer<typeof ChangeEmailSchema>;
export type DeleteAccountInput = z.infer<typeof DeleteAccountSchema>;