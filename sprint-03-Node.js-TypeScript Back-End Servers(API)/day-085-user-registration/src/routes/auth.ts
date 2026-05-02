import { Router, Request, Response } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate, requireAdmin } from "../middleware/authenticate";
import {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    refreshTokenSchema,
    changePasswordSchema,
} from "../schemas/auth.schema";
import {
    register,
    verifyEmail,
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    getProfile,
    getLoginHistory,
    listUsers,
    updateUserStatus,
} from "../services/auth.service";

const router = Router();

// ── Public auth routes ────────────────────────────────────────────────────────

// POST /auth/register
router.post("/auth/register", validate(registerSchema), asyncHandler(async (req: Request, res: Response) => {
    const result = await register(req.body);
    // In production the verify_token would be emailed — we return it here for testing
    res.status(201).json({
        success: true,
        data: result,
        // Hint for the developer testing this
        _dev_note: "In production, verify_token would be sent by email. Use it at POST /auth/verify-email.",
    });
}));

// POST /auth/verify-email
router.post("/auth/verify-email", validate(verifyEmailSchema), asyncHandler(async (req: Request, res: Response) => {
    const user = verifyEmail(req.body.token);
    res.json({ success: true, data: { message: "Email verified successfully", user } });
}));

// POST /auth/login
router.post("/auth/login", validate(loginSchema), asyncHandler(async (req: Request, res: Response) => {
    const result = await login(req.body, req);
    res.json({ success: true, data: result });
}));

// POST /auth/refresh
router.post("/auth/refresh", validate(refreshTokenSchema), asyncHandler(async (req: Request, res: Response) => {
    const result = await refresh(req.body.refresh_token);
    res.json({ success: true, data: result });
}));

// POST /auth/forgot-password
router.post("/auth/forgot-password", validate(forgotPasswordSchema), asyncHandler(async (req: Request, res: Response) => {
    const result = forgotPassword(req.body.email);
    res.json({
        success: true,
        data: result,
        _dev_note: "In production, reset_token would be sent by email. Use it at POST /auth/reset-password.",
    });
}));

// POST /auth/reset-password
router.post("/auth/reset-password", validate(resetPasswordSchema), asyncHandler(async (req: Request, res: Response) => {
    const user = await resetPassword(req.body.token, req.body.password);
    res.json({ success: true, data: { message: "Password reset successfully. Please log in.", user } });
}));

// ── Authenticated routes ──────────────────────────────────────────────────────

// POST /auth/logout — revokes all refresh tokens for this user
router.post("/auth/logout", authenticate, asyncHandler(async (req: Request, res: Response) => {
    logout(req.user!.sub);
    res.json({ success: true, data: { message: "Logged out successfully" } });
}));

// GET /auth/me — current user profile
router.get("/auth/me", authenticate, asyncHandler(async (req: Request, res: Response) => {
    const user = getProfile(req.user!.sub);
    res.json({ success: true, data: user });
}));

// GET /auth/me/login-history
router.get("/auth/me/login-history", authenticate, asyncHandler(async (req: Request, res: Response) => {
    const history = getLoginHistory(req.user!.sub);
    res.json({ success: true, data: history, meta: { count: (history as any[]).length, total: (history as any[]).length } });
}));

// POST /auth/me/change-password
router.post("/auth/me/change-password", authenticate, validate(changePasswordSchema), asyncHandler(async (req: Request, res: Response) => {
    const user = await changePassword(req.user!.sub, req.body.current_password, req.body.new_password);
    res.json({ success: true, data: { message: "Password changed. All sessions have been revoked.", user } });
}));

// ── Admin routes ──────────────────────────────────────────────────────────────

// GET /admin/users
router.get("/admin/users", authenticate, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const limit  = Math.min(Number(req.query.limit)  || 20, 100);
    const offset = Number(req.query.offset) || 0;
    const { rows, total } = listUsers(limit, offset);
    res.json({ success: true, data: rows, meta: { total, count: rows.length } });
}));

// PATCH /admin/users/:id/status — suspend or reactivate a user
router.patch("/admin/users/:id/status", authenticate, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const targetId = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!["active", "suspended", "locked"].includes(status)) {
        return res.status(400).json({ success: false, error: "Status must be active, suspended, or locked" });
    }
    const user = updateUserStatus(targetId, status, req.user!.sub);
    res.json({ success: true, data: user });
}));

export default router;