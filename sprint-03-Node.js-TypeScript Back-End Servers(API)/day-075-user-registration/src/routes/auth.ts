import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/database";
import { UserRow, JwtPayload, toUser } from "../types";
import { RegisterSchema, LoginSchema } from "../schemas/user";
import { validate } from "../middleware/validate";

const router = Router();
const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
    });
}

function logLogin(userId: number | null, ip: string, success: boolean, reason?: string): void {
    db.prepare(`
    INSERT INTO login_log (user_id, ip, success, reason)
    VALUES (?, ?, ?, ?)
  `).run(userId, ip, success ? 1 : 0, reason ?? null);
}

/* ── POST /auth/register ── */
router.post("/register", validate(RegisterSchema), async (req: Request, res: Response) => {
    const { name, email, password, bio } = req.body;
    const ip = req.ip || "unknown";

    /* Check duplicate email */
    const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (exists) {
        res.status(409).json({ success: false, error: `Email "${email}" is already registered` });
        return;
    }

    const passwordHash = await bcrypt.hash(password, ROUNDS);

    try {
        const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, bio)
      VALUES (@name, @email, @passwordHash, @bio)
    `).run({ name, email, passwordHash, bio: bio ?? null });

        const newUser = db.prepare("SELECT * FROM users WHERE id = ?")
            .get(result.lastInsertRowid) as UserRow;

        const token = signToken({ id: newUser.id, email: newUser.email, role: newUser.role });
        logLogin(newUser.id, ip, true, "registered");

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: { user: toUser(newUser), token },
        });
    } catch (err: any) {
        if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
            res.status(409).json({ success: false, error: "Email already registered" });
            return;
        }
        throw err;
    }
});

/* ── POST /auth/login ── */
router.post("/login", validate(LoginSchema), async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const ip = req.ip || "unknown";

    const userRow = db.prepare("SELECT * FROM users WHERE email = ?")
        .get(email) as UserRow | undefined;

    /* Always compare even if user not found — prevents timing attacks */
    const passwordValid = userRow
        ? await bcrypt.compare(password, userRow.password_hash)
        : false;

    if (!userRow || !passwordValid) {
        logLogin(userRow?.id ?? null, ip, false, "invalid credentials");
        res.status(401).json({ success: false, error: "Invalid email or password" });
        return;
    }

    if (!userRow.is_active) {
        logLogin(userRow.id, ip, false, "account deactivated");
        res.status(403).json({ success: false, error: "Account has been deactivated" });
        return;
    }

    const token = signToken({ id: userRow.id, email: userRow.email, role: userRow.role });
    logLogin(userRow.id, ip, true);

    res.json({
        success: true,
        data: { user: toUser(userRow), token },
    });
});

export default router;