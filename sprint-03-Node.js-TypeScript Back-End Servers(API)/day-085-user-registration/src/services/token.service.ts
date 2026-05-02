// Token service — all token generation and verification lives here.
//
// Three token types:
//
// 1. ACCESS TOKEN (JWT, short-lived 15m)
//    Stateless — the server never stores these. Verified by signature alone.
//    Contains: sub (user id), username, email, role.
//
// 2. REFRESH TOKEN (opaque random string, stored hashed in DB, 7d)
//    When the access token expires, the client sends the refresh token to
//    POST /auth/refresh. We look it up by its SHA-256 hash, check it is not
//    revoked, issue a new access token, and rotate the refresh token
//    (old one revoked, new one issued). This limits the damage if a refresh
//    token is stolen — it can only be used once.
//
// 3. ONE-TIME TOKENS (email verify, password reset — stored in `tokens` table)
//    Random 32-byte hex strings. Stored with an expiry and a used_at column.
//    Checking: token exists AND expires_at > now AND used_at IS NULL.

import crypto from "crypto";
import jwt from "jsonwebtoken";
import { stmts } from "../db/statements";
import { JwtPayload, Token, User } from "../types";
import { BadRequestError, UnauthorizedError } from "../middleware/errorHandler";

// ── Access token ──────────────────────────────────────────────────────────────

export function signAccessToken(user: Pick<User, "id" | "username" | "email" | "role">): string {
    const payload: JwtPayload = {
        sub:      user.id,
        username: user.username,
        email:    user.email,
        role:     user.role,
    };
    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: (process.env.JWT_EXPIRES_IN || "15m") as any,
    });
}

// ── Refresh token ─────────────────────────────────────────────────────────────

function hashToken(raw: string): string {
    return crypto.createHash("sha256").update(raw).digest("hex");
}

export function issueRefreshToken(userId: number): string {
    const raw       = crypto.randomBytes(40).toString("hex");
    const hash      = hashToken(raw);
    const expiresAt = new Date(
        Date.now() + parseDurationMs(process.env.REFRESH_TOKEN_EXPIRES_IN || "7d")
    ).toISOString();

    stmts.insertRefreshToken.run({ user_id: userId, token_hash: hash, expires_at: expiresAt });
    return raw; // return the raw token to the client — the hash stays in the DB
}

export function consumeRefreshToken(raw: string): number {
    // Returns the user_id if valid, throws otherwise
    const hash = hashToken(raw);
    const row  = stmts.getRefreshToken.get(hash) as { user_id: number; expires_at: string; revoked: number } | undefined;

    if (!row) throw new UnauthorizedError("Invalid refresh token");
    if (new Date(row.expires_at + "Z") < new Date()) throw new UnauthorizedError("Refresh token has expired — please log in again");

    // Revoke the used token (rotation: one use only)
    stmts.revokeRefreshToken.run(hash);
    return row.user_id;
}

// ── One-time tokens (verify / reset) ─────────────────────────────────────────

export function issueOneTimeToken(
    userId: number,
    type: "verify_email" | "reset_password"
): string {
    const token     = crypto.randomBytes(32).toString("hex"); // 64 hex chars
    const ttlHours  = type === "verify_email"
        ? Number(process.env.VERIFY_TOKEN_TTL_HOURS)  || 24
        : Number(process.env.RESET_TOKEN_TTL_MINUTES) || 30 / 60; // convert minutes to hours
    const ttlMs     = type === "verify_email"
        ? (Number(process.env.VERIFY_TOKEN_TTL_HOURS)  || 24) * 3600 * 1000
        : (Number(process.env.RESET_TOKEN_TTL_MINUTES) || 30) * 60 * 1000;

    const expiresAt = new Date(Date.now() + ttlMs).toISOString();

    // Invalidate any previous unused tokens of this type for this user
    stmts.invalidateTokens.run({ user_id: userId, type });
    stmts.insertToken.run({ user_id: userId, token, type, expires_at: expiresAt });

    return token;
}

export function consumeOneTimeToken(
    raw: string,
    type: "verify_email" | "reset_password"
): Token {
    const row = stmts.getToken.get({ token: raw, type }) as Token | undefined;

    if (!row)          throw new BadRequestError("Invalid token");
    if (row.used_at)   throw new BadRequestError("This token has already been used");
    if (new Date(row.expires_at + "Z") < new Date()) {
        throw new BadRequestError("Token has expired — please request a new one");
    }

    stmts.markTokenUsed.run(row.id);
    return row;
}

// ── Duration parser ───────────────────────────────────────────────────────────

function parseDurationMs(duration: string): number {
    const match = duration.match(/^(\d+)(m|h|d)$/);
    if (!match) return 7 * 24 * 3600 * 1000; // default 7 days
    const value = parseInt(match[1]);
    const unit  = match[2];
    return value * (unit === "m" ? 60 : unit === "h" ? 3600 : 86400) * 1000;
}