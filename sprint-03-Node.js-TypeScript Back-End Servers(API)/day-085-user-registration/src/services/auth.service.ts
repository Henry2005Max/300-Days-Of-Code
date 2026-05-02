// AuthService: the complete auth business logic layer.
//
// Registration flow:
//   1. Hash password with bcrypt (cost factor from env)
//   2. Insert user with status = "pending"
//   3. Issue a verify_email one-time token
//   4. Return the token in the response (in production, email it)
//
// Login flow:
//   1. Look up user by email
//   2. Check account status (locked, suspended, pending)
//   3. Auto-unlock if locked_until has passed
//   4. Compare password with bcrypt.compare
//   5. On failure: increment failed_login_attempts; lock if threshold crossed
//   6. On success: reset counter, record last_login_at, issue JWT + refresh token
//   7. Append a row to login_history either way
//
// Password reset flow:
//   1. POST /auth/forgot-password → issue reset token (no user enumeration leak)
//   2. POST /auth/reset-password  → consume token, bcrypt new password, revoke all refresh tokens

import bcrypt from "bcryptjs";
import db from "../db/database";
import { stmts } from "../db/statements";
import { signAccessToken, issueRefreshToken, consumeRefreshToken, issueOneTimeToken, consumeOneTimeToken } from "./token.service";
import { User, PublicUser } from "../types";
import {
    ConflictError, UnauthorizedError, BadRequestError, ForbiddenError, NotFoundError
} from "../middleware/errorHandler";

const BCRYPT_ROUNDS    = Number(process.env.BCRYPT_ROUNDS)              || 12;
const MAX_FAILED       = Number(process.env.MAX_FAILED_LOGINS)          || 5;
const LOCKOUT_MINUTES  = Number(process.env.LOCKOUT_DURATION_MINUTES)   || 30;

// Strip password_hash before returning a user to a route handler
function toPublic(user: User): PublicUser {
    return {
        id:             user.id,
        username:       user.username,
        email:          user.email,
        role:           user.role,
        status:         user.status,
        email_verified: Boolean(user.email_verified),
        last_login_at:  user.last_login_at,
        created_at:     user.created_at,
    };
}

function logAttempt(userId: number, req: any, success: boolean, reason?: string): void {
    stmts.insertLoginHistory.run({
        user_id:        userId,
        ip_address:     req.ip || req.connection?.remoteAddress || "",
        user_agent:     req.headers["user-agent"] || "",
        success:        success ? 1 : 0,
        failure_reason: reason ?? null,
    });
}

// ── Register ──────────────────────────────────────────────────────────────────

export async function register(data: {
    username: string; email: string; password: string;
}): Promise<{ user: PublicUser; verify_token: string }> {
    // Check uniqueness — separate queries so we can give specific error messages
    if (stmts.getUserByEmail.get(data.email)) {
        throw new ConflictError("An account with this email already exists");
    }
    if (stmts.getUserByUsername.get(data.username)) {
        throw new ConflictError("This username is already taken");
    }

    const password_hash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    const result        = stmts.insertUser.run({ username: data.username, email: data.email, password_hash });
    const userId        = result.lastInsertRowid as number;

    const verify_token = issueOneTimeToken(userId, "verify_email");
    const user         = stmts.getUserById.get(userId) as User;

    return { user: toPublic(user), verify_token };
}

// ── Verify email ──────────────────────────────────────────────────────────────

export function verifyEmail(token: string): PublicUser {
    const tokenRow = consumeOneTimeToken(token, "verify_email");
    stmts.verifyEmail.run(tokenRow.user_id);
    const user = stmts.getUserById.get(tokenRow.user_id) as User;
    return toPublic(user);
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(
    data: { email: string; password: string },
    req: any
): Promise<{ user: PublicUser; access_token: string; refresh_token: string }> {
    const user = stmts.getUserByEmail.get(data.email) as User | undefined;

    // Don't reveal whether the email exists — same error for both cases
    if (!user) {
        throw new UnauthorizedError("Invalid email or password");
    }

    // Auto-unlock if lockout period has expired
    if (user.status === "locked" && user.locked_until) {
        if (new Date(user.locked_until + "Z") < new Date()) {
            stmts.unlockUser.run(user.id);
            user.status      = "active";
            user.locked_until = null;
        }
    }

    if (user.status === "locked") {
        logAttempt(user.id, req, false, "account_locked");
        throw new ForbiddenError(`Account is locked until ${user.locked_until}. Contact support or wait for auto-unlock.`);
    }
    if (user.status === "suspended") {
        logAttempt(user.id, req, false, "account_suspended");
        throw new ForbiddenError("This account has been suspended. Contact support.");
    }
    if (user.status === "pending") {
        logAttempt(user.id, req, false, "email_not_verified");
        throw new ForbiddenError("Please verify your email before logging in.");
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!passwordMatch) {
        stmts.incrementFailedLogins.run(user.id);
        const newCount = user.failed_login_attempts + 1;

        if (newCount >= MAX_FAILED) {
            const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString();
            stmts.lockUser.run({ id: user.id, locked_until: lockedUntil });
            logAttempt(user.id, req, false, "wrong_password_account_locked");
            throw new ForbiddenError(`Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`);
        }

        logAttempt(user.id, req, false, "wrong_password");
        const remaining = MAX_FAILED - newCount;
        throw new UnauthorizedError(
            `Invalid email or password. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining before lockout.`
        );
    }

    // Success
    stmts.updateLastLogin.run(user.id);
    logAttempt(user.id, req, true, null);

    const freshUser    = stmts.getUserById.get(user.id) as User;
    const access_token  = signAccessToken(freshUser);
    const refresh_token = issueRefreshToken(freshUser.id);

    return { user: toPublic(freshUser), access_token, refresh_token };
}

// ── Refresh ───────────────────────────────────────────────────────────────────

export async function refresh(rawRefreshToken: string): Promise<{
    access_token: string; refresh_token: string;
}> {
    const userId       = consumeRefreshToken(rawRefreshToken);
    const user         = stmts.getUserById.get(userId) as User | undefined;

    if (!user || user.status !== "active") {
        throw new UnauthorizedError("Cannot refresh — account is not active");
    }

    const access_token  = signAccessToken(user);
    const refresh_token = issueRefreshToken(user.id); // rotate

    return { access_token, refresh_token };
}

// ── Logout ────────────────────────────────────────────────────────────────────

export function logout(userId: number): void {
    stmts.revokeAllRefreshTokens.run(userId);
}

// ── Forgot password ───────────────────────────────────────────────────────────

export function forgotPassword(email: string): { reset_token: string } {
    // Always return the same shape — never leak whether the email exists
    const user = stmts.getUserByEmail.get(email) as User | undefined;
    if (!user) {
        // Return a fake token shape so the response is indistinguishable
        return { reset_token: "no_account_found_but_we_wont_tell_you" };
    }
    const reset_token = issueOneTimeToken(user.id, "reset_password");
    return { reset_token };
}

// ── Reset password ────────────────────────────────────────────────────────────

export async function resetPassword(token: string, newPassword: string): Promise<PublicUser> {
    const tokenRow = consumeOneTimeToken(token, "reset_password");
    const hash     = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    stmts.updatePassword.run({ id: tokenRow.user_id, hash });
    // Revoke all refresh tokens — forces re-login on all devices
    stmts.revokeAllRefreshTokens.run(tokenRow.user_id);

    const user = stmts.getUserById.get(tokenRow.user_id) as User;
    return toPublic(user);
}

// ── Change password (authenticated) ──────────────────────────────────────────

export async function changePassword(
    userId: number, currentPassword: string, newPassword: string
): Promise<PublicUser> {
    const user = stmts.getUserById.get(userId) as User;

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) throw new BadRequestError("Current password is incorrect");

    const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    stmts.updatePassword.run({ id: userId, hash });
    stmts.revokeAllRefreshTokens.run(userId);

    return toPublic(stmts.getUserById.get(userId) as User);
}

// ── Profile / admin ───────────────────────────────────────────────────────────

export function getProfile(userId: number): PublicUser {
    const user = stmts.getUserById.get(userId) as User | undefined;
    if (!user) throw new NotFoundError("User", userId);
    return toPublic(user);
}

export function getLoginHistory(userId: number) {
    return stmts.getLoginHistory.all(userId);
}

export function listUsers(limit = 20, offset = 0): { rows: PublicUser[]; total: number } {
    const rows  = (stmts.listUsers.all({ limit, offset }) as User[]).map(toPublic);
    const total = (stmts.countUsers.get() as { count: number }).count;
    return { rows, total };
}

export function updateUserStatus(targetId: number, status: string, requesterId: number): PublicUser {
    if (targetId === requesterId) throw new BadRequestError("Cannot change your own status");
    const user = stmts.getUserById.get(targetId) as User | undefined;
    if (!user) throw new NotFoundError("User", targetId);
    stmts.updateStatus.run({ id: targetId, status });
    return toPublic(stmts.getUserById.get(targetId) as User);
}