import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db/database";
import { UserRow, LoginLogRow, toUser } from "../types";
import {
    UpdateProfileSchema,
    ChangePasswordSchema,
    ChangeEmailSchema,
    DeleteAccountSchema,
} from "../schemas/user";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";

const router = Router();
const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

function asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: Function) =>
        Promise.resolve(fn(req, res, next)).catch(next);
}

/* All user routes require authentication */
router.use(authenticate);

/* ── GET /users/me — current user profile ── */
router.get("/me", (req: Request, res: Response) => {
    const row = db.prepare("SELECT * FROM users WHERE id = ?")
        .get(req.user!.id) as UserRow | undefined;

    if (!row) {
        res.status(404).json({ success: false, error: "User not found" });
        return;
    }
    res.json({ success: true, data: toUser(row) });
});

/* ── PATCH /users/me — update name, bio, avatarUrl ── */
router.patch("/me", validate(UpdateProfileSchema), (req: Request, res: Response) => {
    const { name, bio, avatarUrl } = req.body;
    const id = req.user!.id;

    const setClauses: string[]      = [];
    const params: Record<string, any> = { id };

    if (name      !== undefined) { setClauses.push("name = @name");           params.name      = name; }
    if (bio       !== undefined) { setClauses.push("bio = @bio");             params.bio       = bio; }
    if (avatarUrl !== undefined) { setClauses.push("avatar_url = @avatarUrl"); params.avatarUrl = avatarUrl; }

    db.prepare(`UPDATE users SET ${setClauses.join(", ")} WHERE id = @id`).run(params);

    const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow;
    res.json({ success: true, message: "Profile updated", data: toUser(updated) });
});

/* ── POST /users/me/change-password ─────────────────────────────────
   Requires current password to verify identity before changing.
   This means a stolen token alone cannot lock the real user out.
────────────────────────────────────────────────────────────────────── */
router.post("/me/change-password", validate(ChangePasswordSchema), asyncHandler(
    async (req: Request, res: Response) => {
        const { currentPassword, newPassword } = req.body;
        const id = req.user!.id;

        const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow;
        const valid = await bcrypt.compare(currentPassword, row.password_hash);

        if (!valid) {
            res.status(401).json({ success: false, error: "Current password is incorrect" });
            return;
        }

        const newHash = await bcrypt.hash(newPassword, ROUNDS);
        db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(newHash, id);

        res.json({ success: true, message: "Password changed successfully" });
    }
));

/* ── POST /users/me/change-email ─────────────────────────────────────
   Requires current password — email is a critical identity field.
   In production: send verification email to new address first.
────────────────────────────────────────────────────────────────────── */
router.post("/me/change-email", validate(ChangeEmailSchema), asyncHandler(
    async (req: Request, res: Response) => {
        const { newEmail, currentPassword } = req.body;
        const id = req.user!.id;

        const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow;
        const valid = await bcrypt.compare(currentPassword, row.password_hash);

        if (!valid) {
            res.status(401).json({ success: false, error: "Password is incorrect" });
            return;
        }

        /* Check new email not already taken */
        const taken = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?")
            .get(newEmail, id);
        if (taken) {
            res.status(409).json({ success: false, error: `Email "${newEmail}" is already in use` });
            return;
        }

        db.prepare("UPDATE users SET email = ? WHERE id = ?").run(newEmail, id);

        res.json({
            success: true,
            message: "Email updated successfully",
            note:    "In production, a verification email would be sent to the new address first",
            newEmail,
        });
    }
));

/* ── GET /users/me/login-history — last 10 login attempts ── */
router.get("/me/login-history", (req: Request, res: Response) => {
    const rows = db.prepare(`
    SELECT * FROM login_log
    WHERE user_id = ?
    ORDER BY logged_at DESC
    LIMIT 10
  `).all(req.user!.id) as LoginLogRow[];

    const history = rows.map((r) => ({
        id:       r.id,
        ip:       r.ip,
        success:  r.success === 1,
        reason:   r.reason,
        loggedAt: r.logged_at,
    }));

    res.json({ success: true, data: history, meta: { count: history.length } });
});

/* ── DELETE /users/me — hard delete account ──────────────────────────
   Requires password + typing "DELETE" to confirm.
   This two-factor confirmation prevents accidental deletion.
────────────────────────────────────────────────────────────────────── */
router.delete("/me", validate(DeleteAccountSchema), asyncHandler(
    async (req: Request, res: Response) => {
        const { password } = req.body;
        const id = req.user!.id;

        const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow;
        const valid = await bcrypt.compare(password, row.password_hash);

        if (!valid) {
            res.status(401).json({ success: false, error: "Password is incorrect" });
            return;
        }

        db.prepare("DELETE FROM users WHERE id = ?").run(id);

        res.json({
            success: true,
            message: "Account permanently deleted",
            deletedAt: new Date().toISOString(),
        });
    }
));

export default router;