/**
 * Unsubscribe Route, CASL Compliance (v2 - Fixed)
 *
 * Handles unsubscribe requests from email footer links.
 * Format: GET /unsubscribe?email=encoded@example.com
 *
 * On request:
 *   1. Validates email param
 *   2. Adds to Resend audience as unsubscribed (REQUIRED for suppression list)
 *   3. Logs the unsubscribe to Vercel Blob as audit trail (REQUIRED for compliance)
 *   4. Calls backend webhook to update prospect_verified.json do_not_mail flag (async, non-blocking)
 *   5. Returns HTML confirmation page
 *
 * Error handling:
 *   - If Resend write fails: return HTTP 500 (critical)
 *   - If Blob write fails: return HTTP 500 (critical)
 *   - If backend webhook fails: log but return 200 (non-critical, synced nightly via cron)
 *
 * Required env vars:
 *   RESEND_API_KEY           Resend API key
 *   RESEND_AUDIENCE_ID       Resend audience ID
 *   BACKEND_WEBHOOK_URL      VPS endpoint for prospect_verified.json sync (optional)
 *
 * CASL note:
 *   Unsubscribe requests must be honoured within 10 business days (CASL s.11(3)).
 *   This route processes Resend + Blob synchronously. prospect_verified.json synced nightly.
 */

import { NextRequest, NextResponse } from "next/server";

const SITE_URL = "https://sellerdefensekit.com";
const SENDER_NAME = "Seller Defense Kit, a product of The Starter Group";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawEmail = searchParams.get("email");

  if (!rawEmail) {
    return htmlResponse(buildErrorHtml("No email address provided."), 400);
  }

  const email = decodeURIComponent(rawEmail).trim().toLowerCase();

  if (!email.includes("@") || !email.includes(".")) {
    return htmlResponse(buildErrorHtml("Invalid email address."), 400);
  }

  const results: string[] = [];
  const timestamp = new Date().toISOString();

  // CRITICAL: 1. Add to Resend audience as unsubscribed
  const resendApiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!resendApiKey || !audienceId) {
    const msg = `[unsubscribe] CRITICAL: Missing RESEND_API_KEY or RESEND_AUDIENCE_ID for ${email}`;
    console.error(msg);
    return htmlResponse(buildErrorHtml("Configuration error. Please try again or email hello@sellerdefensekit.com."), 500);
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendApiKey);
    await resend.contacts.create({
      audienceId,
      email,
      unsubscribed: true,
    });
    results.push("resend:ok");
    console.log(`[unsubscribe] ✓ Resend suppression added for ${email}`);
  } catch (err) {
    const errMsg = `[unsubscribe] ✗ CRITICAL: Resend write failed for ${email}: ${err instanceof Error ? err.message : String(err)}`;
    console.error(errMsg);
    results.push("resend:error");
    return htmlResponse(buildErrorHtml("Failed to process unsubscribe. Please try again."), 500);
  }

  // CRITICAL: 2. Append to Vercel Blob audit log
  try {
    const { put } = await import("@vercel/blob");
    const record = JSON.stringify({
      email,
      unsubscribedAt: timestamp,
      source: "email-footer-link",
      ip: req.headers.get("x-forwarded-for") ?? "unknown",
    });

    const blobKey = `unsubscribes/${email.replace("@", "_at_")}.json`;
    await put(blobKey, record, {
      access: "private" as Parameters<typeof put>[2]["access"],
      addRandomSuffix: false,
    });
    results.push("blob:ok");
    console.log(`[unsubscribe] ✓ Blob audit record written for ${email}`);
  } catch (err) {
    const errMsg = `[unsubscribe] ✗ CRITICAL: Blob write failed for ${email}: ${err instanceof Error ? err.message : String(err)}`;
    console.error(errMsg);
    results.push("blob:error");
    return htmlResponse(buildErrorHtml("Failed to log unsubscribe. Please try again."), 500);
  }

  // NON-CRITICAL: 3. Call backend webhook to update prospect_verified.json (async, fire-and-forget)
  const backendWebhookUrl = process.env.BACKEND_WEBHOOK_URL;
  if (backendWebhookUrl) {
    try {
      fetch(backendWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, timestamp, source: "email-footer-link" }),
      }).catch((err) => {
        console.warn(`[unsubscribe] Backend webhook failed (non-critical): ${err.message}`);
      });
      results.push("backend:queued");
      console.log(`[unsubscribe] Backend webhook call queued for ${email}`);
    } catch (err) {
      // Non-fatal, just log
      results.push("backend:skipped");
      console.log(`[unsubscribe] Backend webhook call skipped for ${email}`);
    }
  } else {
    results.push("backend:not-configured");
  }

  console.log(`[unsubscribe] ${email} [${timestamp}] - Final results: ${results.join(", ")}`);

  return htmlResponse(buildConfirmationHtml(email), 200);
}

function htmlResponse(html: string, status: number): NextResponse {
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function buildConfirmationHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Unsubscribed | Seller Defense Kit</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 560px; margin: 80px auto; padding: 20px; color: #333; text-align: center; }
    h1 { color: #111; font-size: 24px; margin-bottom: 12px; }
    p { color: #666; font-size: 16px; line-height: 1.6; }
    a { color: #d97706; }
    .note { font-size: 13px; color: #999; margin-top: 32px; }
  </style>
</head>
<body>
  <h1>You've been unsubscribed.</h1>
  <p>
    <strong>${escapeHtml(email)}</strong> has been removed from all
    marketing emails from ${SENDER_NAME}.
  </p>
  <p>
    You will still receive transactional emails related to purchases
    you have already made (e.g. download links, receipts).
  </p>
  <p class="note">
    <a href="${SITE_URL}">Return to Seller Defense Kit</a>
  </p>
</body>
</html>`;
}

function buildErrorHtml(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Unsubscribe Error | Seller Defense Kit</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 560px; margin: 80px auto; padding: 20px; color: #333; text-align: center; }
    h1 { color: #c00; font-size: 22px; }
    p { color: #666; font-size: 15px; }
    a { color: #d97706; }
  </style>
</head>
<body>
  <h1>Unsubscribe failed</h1>
  <p>${escapeHtml(message)}</p>
  <p>
    Please email us directly at
    <a href="mailto:hello@sellerdefensekit.com">hello@sellerdefensekit.com</a>
    and we will remove you manually within 2 business days.
  </p>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
