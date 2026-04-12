import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/database";
import { UserRow, toUser, JwtPayload } from "../types";
import { RegisterSchema, LoginSchema, RegisterInput, LoginInput } from "../schemas/auth";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";

const router = Router();

/* ── Helper — sign a JWT ─────────────────────────────────────────────
   jwt.sign(payload, secret, options) creates a signed token.
   The payload is the data we encode — just id, email, role.
   The secret is from .env — must match what we use in jwt.verify().
   expiresIn sets the token lifetime — after this, the token is invalid.
────────────────────────────────────────────────────────────────────── */
function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
  });
}

/* ── POST /auth/register ─────────────────────────────────────────────
   1. Validate body with Zod
   2. Check if email already exists
   3. Hash the password with bcrypt
   4. Insert user into database
   5. Sign and return a JWT
────────────────────────────────────────────────────────────────────── */
router.post("/register", validate(RegisterSchema), async (req: Request, res: Response) => {
  const { name, email, password }: RegisterInput = req.body;

  /* Check duplicate email */
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    res.status(409).json({ success: false, error: `Email "${email}" is already registered` });
    return;
  }

  /* ── bcrypt.hash() ───────────────────────────────────────────────
     The second argument is the "salt rounds" — how many times to
     run the hashing algorithm. 10 is the standard value.
     More rounds = more secure but slower.
     bcrypt is intentionally slow to make brute-force attacks harder.
  ─────────────────────────────────────────────────────────────────── */
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (@name, @email, @passwordHash, 'user')
    `).run({ name, email, passwordHash });

    const newUser = db.prepare("SELECT * FROM users WHERE id = ?")
      .get(result.lastInsertRowid) as UserRow;

    const token = signToken({
      id:    newUser.id,
      email: newUser.email,
      role:  newUser.role,
    });

    res.status(201).json({
      success: true,
      data: {
        user:  toUser(newUser),
        token,
      },
    });

  } catch (err: any) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      res.status(409).json({ success: false, error: "Email already registered" });
      return;
    }
    throw err;
  }
});

/* ── POST /auth/login ────────────────────────────────────────────────
   1. Validate body with Zod
   2. Find user by email
   3. Compare submitted password to stored hash with bcrypt.compare()
   4. Sign and return a JWT

   Security note: we return the SAME error for "user not found" and
   "wrong password". This is intentional — telling attackers which
   emails are registered is an information leak.
────────────────────────────────────────────────────────────────────── */
router.post("/login", validate(LoginSchema), async (req: Request, res: Response) => {
  const { email, password }: LoginInput = req.body;

  const userRow = db.prepare("SELECT * FROM users WHERE email = ?")
    .get(email) as UserRow | undefined;

  /* ── bcrypt.compare() ────────────────────────────────────────────
     Hashes the submitted password with the same salt used originally
     and compares it to the stored hash. Returns true or false.
     You never "decrypt" a bcrypt hash — you re-hash and compare.
  ─────────────────────────────────────────────────────────────────── */
  const passwordValid = userRow
    ? await bcrypt.compare(password, userRow.password_hash)
    : false;

  /* Same error message whether email is wrong or password is wrong */
  if (!userRow || !passwordValid) {
    res.status(401).json({ success: false, error: "Invalid email or password" });
    return;
  }

  const token = signToken({
    id:    userRow.id,
    email: userRow.email,
    role:  userRow.role,
  });

  res.status(200).json({
    success: true,
    data: {
      user:  toUser(userRow),
      token,
    },
  });
});

/* ── GET /auth/me ────────────────────────────────────────────────────
   A protected route. authenticate runs first and attaches req.user.
   We use req.user.id to look up the full user record from the database.
   This lets the client check who they're currently logged in as.
────────────────────────────────────────────────────────────────────── */
router.get("/me", authenticate, (req: Request, res: Response) => {
  const userRow = db.prepare("SELECT * FROM users WHERE id = ?")
    .get(req.user!.id) as UserRow | undefined;

  if (!userRow) {
    res.status(404).json({ success: false, error: "User not found" });
    return;
  }

  res.status(200).json({ success: true, data: toUser(userRow) });
});

/* ── GET /auth/users — admin only ───────────────────────────────────
   Demonstrates role-based access control combined with authenticate.
   Only users with role === "admin" can see all registered users.
────────────────────────────────────────────────────────────────────── */
router.get("/users", authenticate, (req: Request, res: Response) => {
  if (req.user!.role !== "admin") {
    res.status(403).json({ success: false, error: "Forbidden — admin only" });
    return;
  }

  const rows = db.prepare("SELECT * FROM users ORDER BY created_at DESC").all() as UserRow[];
  res.status(200).json({
    success: true,
    data: rows.map(toUser),
    meta: { total: rows.length, count: rows.length },
  });
});

export default router;