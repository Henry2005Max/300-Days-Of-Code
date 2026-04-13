import crypto from "crypto";

/* ── What is HMAC signature verification? ───────────────────────────
   When a provider (GitHub, Paystack) sends a webhook to your server,
   they include a signature in the request headers.

   How they create it:
     signature = HMAC-SHA256(rawBody, sharedSecret)

   How you verify it:
     1. Take the raw request body (the exact bytes received)
     2. Compute HMAC-SHA256 using the same shared secret
     3. Compare your result to the signature in the header
     4. If they match → the request is genuine
     5. If they don't → reject it (someone tampered with the payload
        or it didn't come from the real provider)

   WHY raw body matters:
   If you parse JSON first and then re-stringify, whitespace and key
   order may differ. The HMAC must match exactly, so you need the
   original bytes Express received from the network.
   That's why webhook routes use express.raw() not express.json().

   crypto.timingSafeEqual() instead of ===:
   Regular string comparison short-circuits — it stops at the first
   mismatch. This leaks timing information that attackers can exploit.
   timingSafeEqual() always takes the same time regardless of where
   the mismatch is — it's safe against timing attacks.
────────────────────────────────────────────────────────────────────── */

export function verifyGitHubSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  secret: string
): boolean {
  if (!signatureHeader) return false;

  /* GitHub sends: "sha256=<hex_hash>" */
  const expected = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")}`;

  /* Use timing-safe comparison */
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expected)
    );
  } catch {
    return false; /* buffers different lengths → not equal */
  }
}

export function verifyPaystackSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  secret: string
): boolean {
  if (!signatureHeader) return false;

  /* Paystack sends just the hex hash, no prefix */
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}