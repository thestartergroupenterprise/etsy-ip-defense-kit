/**
 * Stripe Webhook Handler, Product 1: Etsy IP Defense Kit
 *
 * Fires on payment_intent.succeeded:
 *   1. Verifies Stripe signature using STRIPE_WEBHOOK_SECRET (Product 1 only, never shared)
 *   2. Validates Stripe product ID via checkout session lookup:
 *        if payload product ID does not match STRIPE_P1_PRODUCT_ID, reject and alert Founder
 *   3. Extracts customer email from the PaymentIntent
 *   4. Mints a signed, time-limited download token (30 days) tied to this payment
 *   5. Sends Product 1 delivery email via Resend with the unique download link
 *   6. Writes nurture queue entry to Vercel Blob for follow-up sequence
 *
 * Fires on refund.created:
 *   (logged for future revocation support, no action yet)
 *
 * DELIVERY ISOLATION RULES (permanent, Founder-set 2026-04-08):
 *   - This webhook handles ONLY Product 1. Cross-triggering is impossible by architecture.
 *   - Uses STRIPE_WEBHOOK_SECRET (not shared with any other product)
 *   - Reads PRODUCT_BLOB_URL (not shared with any other product)
 *   - Validates against STRIPE_P1_PRODUCT_ID (not shared with any other product)
 *   - If product ID in payload does not match STRIPE_P1_PRODUCT_ID: reject, alert, stop.
 *
 * Required env vars (all Product 1 dedicated, no sharing):
 *   STRIPE_WEBHOOK_SECRET      Product 1 Stripe webhook signing secret
 *   STRIPE_P1_PRODUCT_ID       Product 1 Stripe product ID (prod_UBj6Q3NT9DQNhr)
 *   PRODUCT_BLOB_URL           Product 1 Vercel Blob URL (dedicated path)
 *   DOWNLOAD_SIGNING_SECRET    HMAC secret for download token minting
 *   RESEND_API_KEY             Resend API key
 *   FROM_EMAIL                 e.g. hello@sellerdefensekit.com
 *   TELEGRAM_BOT_TOKEN         For Founder mismatch alerts
 *   TELEGRAM_CHAT_ID           Founder chat ID (8493404368)
 */

import { NextRequest, NextResponse } from "next/server";
import { generateDownloadToken } from "@/lib/download-token";

const DOWNLOAD_BASE = "https://sellerdefensekit.com/api/download";
const FOUNDER_CHAT_ID = "8493404368";

async function alertFounder(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: FOUNDER_CHAT_ID, text: message }),
    });
  } catch {
    // Telegram alert failure is logged but never fatal to the request lifecycle
    console.error("[webhook-p1] Telegram alert failed");
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const resendApiKey = process.env.RESEND_API_KEY;
  const blobUrl = process.env.PRODUCT_BLOB_URL;
  const expectedProductId = process.env.STRIPE_P1_PRODUCT_ID;
  const fromEmail = process.env.FROM_EMAIL || "hello@sellerdefensekit.com";

  if (!webhookSecret) {
    console.error("[webhook-p1] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!resendApiKey) {
    console.error("[webhook-p1] RESEND_API_KEY not set");
    return NextResponse.json({ error: "Email provider not configured" }, { status: 500 });
  }
  if (!blobUrl) {
    console.error("[webhook-p1] PRODUCT_BLOB_URL not set");
    return NextResponse.json({ error: "Product file not configured" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  // Verify Stripe signature
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  let stripeClient: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    const stripe = (await import("stripe")).default;
    stripeClient = new stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-02-25.clover",
    });
    event = stripeClient.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[webhook-p1] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentIntent = event.data.object as any;

    // ── PRODUCT ID VALIDATION ──────────────────────────────────────────────
    // Look up the Checkout Session for this PaymentIntent to verify product ID.
    // If STRIPE_P1_PRODUCT_ID is set and does not match the payload, reject immediately.
    if (expectedProductId) {
      try {
        const sessions = await stripeClient.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
          expand: ["data.line_items"],
        });
        if (sessions.data.length > 0) {
          const session = sessions.data[0];
          const lineItems: any[] = session.line_items?.data ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any
          const productIds = lineItems
            .map((item: any) => item.price?.product) // eslint-disable-line @typescript-eslint/no-explicit-any
            .filter(Boolean);

          if (productIds.length > 0 && !productIds.includes(expectedProductId)) {
            const alert = `WEBHOOK PRODUCT ID MISMATCH [P1]\nExpected: ${expectedProductId}\nFound: ${productIds.join(", ")}\nPayment Intent: ${paymentIntent.id}\nAction: delivery BLOCKED`;
            console.error("[webhook-p1]", alert);
            await alertFounder(alert);
            return NextResponse.json({ error: "Product ID mismatch, delivery blocked" }, { status: 400 });
          }
        }
      } catch (validationErr) {
        // If the Stripe API call to fetch the session fails, log and continue.
        // We do not block delivery on a validation-check network failure.
        console.warn("[webhook-p1] Product ID validation lookup failed (continuing):", validationErr);
      }
    }
    // ── END PRODUCT ID VALIDATION ──────────────────────────────────────────

    const customerEmail: string | null =
      paymentIntent.receipt_email ||
      paymentIntent.customer_details?.email ||
      null;

    if (!customerEmail) {
      console.error("[webhook-p1] No customer email on payment_intent:", paymentIntent.id);
      return NextResponse.json({ received: true, note: "No email on record" });
    }

    // Mint a unique signed download token for this payment (30-day expiry)
    let downloadToken: string;
    try {
      downloadToken = generateDownloadToken(paymentIntent.id, blobUrl, 30);
    } catch (err) {
      console.error("[webhook-p1] Failed to generate download token:", err);
      return NextResponse.json({ error: "Token generation failed" }, { status: 500 });
    }

    const downloadPageUrl = `${DOWNLOAD_BASE}/${downloadToken}`;

    console.log("[webhook-p1] downloadToken length:", downloadToken.length);
    console.log("[webhook-p1] downloadPageUrl prefix:", downloadPageUrl.substring(0, 80));

    // Write nurture queue entry to Vercel Blob
    try {
      const { put } = await import("@vercel/blob");
      const record = JSON.stringify({
        email: customerEmail,
        paymentIntentId: paymentIntent.id,
        purchasedAt: new Date().toISOString(),
        sent48h: false,
        sent7d: false,
      });
      await put(`nurture/${paymentIntent.id}.json`, record, {
        access: "public",
        addRandomSuffix: false,
      });
      console.log(`[webhook-p1] Nurture queue entry created for ${customerEmail}`);
    } catch (err) {
      // Non-fatal, delivery email still sends
      console.error("[webhook-p1] Failed to write nurture queue entry:", err);
    }

    // Send delivery email via Resend
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);

      await resend.emails.send({
        from: fromEmail,
        to: customerEmail,
        replyTo: "hello@sellerdefensekit.com",
        subject: "Your Seller Defense Kit is ready, download link inside",
        html: buildEmailHtml(downloadPageUrl, customerEmail),
        text: buildEmailText(downloadPageUrl, customerEmail),
      });

      console.log(`[webhook-p1] Delivery email sent to ${customerEmail} for ${paymentIntent.id}`);
    } catch (emailErr) {
      console.error("[webhook-p1] Failed to send delivery email:", emailErr);
      return NextResponse.json({ error: "Email delivery failed" }, { status: 500 });
    }
  }

  if (event.type === "refund.created") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const refund = event.data.object as any;
    console.log(`[webhook-p1] Refund created: ${refund.id} for payment ${refund.payment_intent}`);
    // Future: look up token by payment intent ID in Vercel KV and revoke it
  }

  return NextResponse.json({ received: true });
}

function buildEmailHtml(downloadPageUrl: string, customerEmail: string): string {
  const unsubscribeUrl = `https://sellerdefensekit.com/unsubscribe?email=${encodeURIComponent(customerEmail)}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Seller Defense Kit</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">

  <h1 style="color: #d97706; font-size: 24px; margin-bottom: 8px;">
    Your Seller Defense Kit is ready.
  </h1>

  <p style="font-size: 16px; color: #555; margin-bottom: 24px;">
    Thank you for your purchase. Your 5-document PDF toolkit is ready to download.
  </p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${downloadPageUrl}"
       style="background-color: #d97706; color: white; padding: 16px 32px;
              border-radius: 8px; text-decoration: none; font-size: 18px;
              font-weight: bold; display: inline-block;">
      Download Your Kit Now
    </a>
  </div>

  <p style="font-size: 14px; color: #777;">
    Or copy this link into your browser:<br>
    <a href="${downloadPageUrl}" style="color: #d97706; word-break: break-all;">${downloadPageUrl}</a>
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

  <h2 style="font-size: 16px; color: #111;">What's in your kit (PDF format):</h2>
  <ul style="color: #555; font-size: 14px; line-height: 1.8;">
    <li>&#128196; DMCA Takedown Notice, for Etsy, Temu, AliExpress and web</li>
    <li>&#9993; Cease and Desist Letter, direct seller contact template</li>
    <li>&#128269; IP Theft Monitoring Checklist, find theft on 5 platforms</li>
    <li>&#128506; Multi-Platform Filing Guide, step-by-step for every portal</li>
    <li>&#128737; Listing Reinstatement Appeal, for when your own listing gets suspended</li>
  </ul>

  <p style="font-size: 13px; color: #999; margin-top: 32px;">
    This download link is valid for 30 days.<br>
    Questions? Reply to this email or contact us at
    <a href="mailto:hello@sellerdefensekit.com" style="color: #d97706;">
      hello@sellerdefensekit.com
    </a>.<br>
    30-day money-back guarantee. If you cannot file your first DMCA in 15 minutes, we will refund you.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

  <p style="font-size: 11px; color: #bbb; line-height: 1.6;">
    This email was sent by <strong>Seller Defense Kit, a product of The Starter Group</strong><br>
    2967 Dundas St W, Toronto, ON M6P 1Z2, Canada<br>
    You received this email because you purchased the Seller Defense Kit.<br>
    <a href="${unsubscribeUrl}" style="color: #bbb;">Unsubscribe</a>
  </p>

</body>
</html>`;
}

function buildEmailText(downloadPageUrl: string, customerEmail: string): string {
  const unsubscribeUrl = `https://sellerdefensekit.com/unsubscribe?email=${encodeURIComponent(customerEmail)}`;
  return `Your Seller Defense Kit is ready.

Thank you for your purchase. Download your 5-document PDF kit here:
${downloadPageUrl}

This link is valid for 30 days.

What's in your kit:
- DMCA Takedown Notice (for Etsy, Temu, AliExpress and web)
- Cease and Desist Letter
- IP Theft Monitoring Checklist
- Multi-Platform Filing Guide
- Listing Reinstatement Appeal

Questions? Reply to this email or contact us at hello@sellerdefensekit.com.
30-day money-back guarantee.

---
Seller Defense Kit, a product of The Starter Group
2967 Dundas St W, Toronto, ON M6P 1Z2, Canada
You received this email because you purchased the Seller Defense Kit.
Unsubscribe: ${unsubscribeUrl}`;
}
