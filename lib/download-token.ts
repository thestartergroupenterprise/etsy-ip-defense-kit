/**
 * lib/download-token.ts
 * Shared utility for minting and verifying signed download tokens.
 * Used by:
 *   - app/api/download/[token]/route.ts  (verify)
 *   - app/api/webhook/stripe/route.ts    (mint)
 */

import { createHmac, timingSafeEqual } from "crypto";

export interface TokenPayload {
  pi: string;   // Stripe payment intent ID
  exp: number;  // Unix timestamp expiry
  url: string;  // Vercel Blob URL of the product ZIP
}

/**
 * Mint a signed download token for a payment.
 * Token format: base64url(JSON) + "." + base64url(HMAC-SHA256)
 */
export function generateDownloadToken(
  paymentIntentId: string,
  blobUrl: string,
  expiryDays = 30
): string {
  const secret = process.env.DOWNLOAD_SIGNING_SECRET;
  if (!secret) throw new Error("DOWNLOAD_SIGNING_SECRET not set");

  const payload: TokenPayload = {
    pi: paymentIntentId,
    exp: Math.floor(Date.now() / 1000) + expiryDays * 86400,
    url: blobUrl,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(payloadB64).digest("base64url");

  return `${payloadB64}.${sig}`;
}

/**
 * Verify and decode a signed download token.
 * Returns the payload if valid and unexpired, null otherwise.
 */
export function verifyDownloadToken(token: string): TokenPayload | null {
  const secret = process.env.DOWNLOAD_SIGNING_SECRET;
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;

  // Constant-time signature comparison
  const expectedSig = createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  try {
    const expectedBuf = Buffer.from(expectedSig);
    const actualBuf = Buffer.from(sigB64);
    if (expectedBuf.length !== actualBuf.length) return null;
    if (!timingSafeEqual(expectedBuf, actualBuf)) return null;
  } catch {
    return null;
  }

  // Decode payload
  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  // Check expiry
  if (Date.now() / 1000 > payload.exp) return null;

  return payload;
}
