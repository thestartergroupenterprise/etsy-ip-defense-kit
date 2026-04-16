/**
 * Unsubscribe Route, CASL Compliance
 *
 * Handles unsubscribe requests from email footer links.
 * Format: GET /unsubscribe?email=encoded@example.com
 *
 * On request:
 *   1. Validates email param
 *   2. Adds to Resend audience as unsubscribed (if RESEND_AUDIENCE_ID is set)
 *   3. Logs the unsubscribe to Vercel Blob as a JSONL audit trail
 *   4. Returns a plain HTML confirmation page
 *
 * Required env vars:
 *   RESEND_API_KEY           Resend API key (already used by webhook)
 *   RESEND_AUDIENCE_ID       Resend audience ID (optional, set when audience is created)
 *   UNSUBSCRIBE_BLOB_TOKEN   Vercel Blob token for writing the audit log (optional)
 *
 * CASL note:
 *   Unsubscribe requests must be honoured within 10 business days (CASL s.11(3)).
 *   This route processes them immediately.
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

  // 1. Add to Resend audience as unsubscribed
  const resendApiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (resendApiKey && audienceId) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);
      await resend.contacts.create({
        audienceId,
        email,
        unsubscribed: true,
      });
      results.push("resend:ok");
      console.log(`[unsubscribe] Resend suppression added for ${email}`);
    } catch (err) {
      // Non-fatal, log and continue
      results.push("resend:error");
      console.error("[unsubscribe] Resend contacts.create failed:", err);
    }
  } else {
    results.push("resend:skipped (RESEND_AUDIENCE_ID not set)");
    console.log(`[unsubscribe] RESEND_AUDIENCE_ID not set, skipping Resend suppression for ${email}`);
  }

  // 2. Append to Vercel Blob audit log
  try {
    const { put } = await import("@vercel/blob");
    const record = JSON.stringify({
      email,
      unsubscribedAt: new Date().toISOString(),
      source: "email-footer-link",
      ip: req.headers.get("x-forwarded-for") ?? "unknown",
    });

    // Store each unsubscribe as its own blob for easy lookup
    const blobKey = `unsubscribes/${email.replace("@", "_at_")}.json`;
    await put(blobKey, record, {
      access: "private" as Parameters<typeof put>[2]["access"],
      addRandomSuffix: false,
    });
    results.push("blob:ok");
    console.log(`[unsubscribe] Blob audit record written for ${email}`);
  } catch (err) {
    results.push("blob:error");
    console.error("[unsubscribe] Blob write failed:", err);
  }

  console.log(`[unsubscribe] ${email}, results: ${results.join(", ")}`);

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
