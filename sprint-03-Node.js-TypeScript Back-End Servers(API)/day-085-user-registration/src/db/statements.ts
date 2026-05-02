import db from "./database";

type Stmts = ReturnType<typeof buildStatements>;
let _stmts: Stmts | null = null;

function buildStatements() {
    return {
        // ── Users ──────────────────────────────────────────────────────────
        insertUser: db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (@username, @email, @password_hash)
    `),
        getUserById:       db.prepare("SELECT * FROM users WHERE id = ?"),
        getUserByEmail:    db.prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE"),
        getUserByUsername: db.prepare("SELECT * FROM users WHERE username = ? COLLATE NOCASE"),
        listUsers:         db.prepare("SELECT * FROM users ORDER BY created_at DESC LIMIT @limit OFFSET @offset"),
        countUsers:        db.prepare("SELECT COUNT(*) as count FROM users"),

        // Status / verification updates
        verifyEmail: db.prepare(`
      UPDATE users SET email_verified = 1, status = 'active', updated_at = datetime('now')
      WHERE id = ?
    `),
        updatePassword: db.prepare(`
      UPDATE users
      SET password_hash = @hash, failed_login_attempts = 0,
          locked_until = NULL, updated_at = datetime('now')
      WHERE id = @id
    `),
        updateLastLogin: db.prepare(`
      UPDATE users
      SET last_login_at = datetime('now'), failed_login_attempts = 0,
          locked_until = NULL, updated_at = datetime('now')
      WHERE id = ?
    `),
        incrementFailedLogins: db.prepare(`
      UPDATE users
      SET failed_login_attempts = failed_login_attempts + 1,
          updated_at = datetime('now')
      WHERE id = ?
    `),
        lockUser: db.prepare(`
      UPDATE users
      SET status = 'locked', locked_until = @locked_until,
          updated_at = datetime('now')
      WHERE id = @id
    `),
        unlockUser: db.prepare(`
      UPDATE users
      SET status = 'active', locked_until = NULL,
          failed_login_attempts = 0, updated_at = datetime('now')
      WHERE id = ?
    `),
        updateRole: db.prepare(`
      UPDATE users SET role = @role, updated_at = datetime('now') WHERE id = @id
    `),
        updateStatus: db.prepare(`
      UPDATE users SET status = @status, updated_at = datetime('now') WHERE id = @id
    `),

        // ── Login history ──────────────────────────────────────────────────
        insertLoginHistory: db.prepare(`
      INSERT INTO login_history (user_id, ip_address, user_agent, success, failure_reason)
      VALUES (@user_id, @ip_address, @user_agent, @success, @failure_reason)
    `),
        getLoginHistory: db.prepare(`
      SELECT * FROM login_history WHERE user_id = ?
      ORDER BY attempted_at DESC LIMIT 20
    `),

        // ── Tokens (verify / reset) ────────────────────────────────────────
        insertToken: db.prepare(`
      INSERT INTO tokens (user_id, token, type, expires_at)
      VALUES (@user_id, @token, @type, @expires_at)
    `),
        getToken: db.prepare(`
      SELECT * FROM tokens WHERE token = @token AND type = @type
    `),
        markTokenUsed: db.prepare(`
      UPDATE tokens SET used_at = datetime('now') WHERE id = ?
    `),
        // Invalidate all unused tokens of this type for the user (before issuing a new one)
        invalidateTokens: db.prepare(`
      UPDATE tokens SET used_at = datetime('now')
      WHERE user_id = @user_id AND type = @type AND used_at IS NULL
    `),

        // ── Refresh tokens ─────────────────────────────────────────────────
        insertRefreshToken: db.prepare(`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (@user_id, @token_hash, @expires_at)
    `),
        getRefreshToken: db.prepare(`
      SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked = 0
    `),
        revokeRefreshToken: db.prepare(`
      UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?
    `),
        revokeAllRefreshTokens: db.prepare(`
      UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?
    `),
    };
}

export function initStatements(): void {
    _stmts = buildStatements();
    console.log("[db] Prepared statements compiled");
}

export const stmts = new Proxy({} as Stmts, {
    get(_target, prop: string) {
        if (!_stmts) throw new Error("initStatements() must be called after runMigrations()");
        return (_stmts as any)[prop];
    },
});