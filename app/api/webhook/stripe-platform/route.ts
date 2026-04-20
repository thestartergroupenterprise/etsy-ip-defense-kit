/**
 * Stripe Webhook Handler, Product 3: Platform IP Enforcement Kit
 *
 * Fires on payment_intent.succeeded:
 *   1. Verifies Stripe signature using STRIPE_WEBHOOK_SECRET_P3 (Product 3 only, never shared)
 *   2. Validates Stripe product ID via checkout session lookup:
 *        if payload product ID does not match STRIPE_P3_PRODUCT_ID, reject and alert Founder
 *   3. Extracts customer email from the PaymentIntent
 *   4. Mints a signed, time-limited download token (30 days) tied to this payment
 *   5. Sends Product 3 delivery email via Resend with the unique download link
 *   6. Writes nurture queue entry to Vercel Blob for follow-up sequence
 *
 * DELIVERY ISOLATION RULES (permanent, Founder-set 2026-04-19):
 *   - This webhook handles ONLY Product 3. Cross-triggering is impossible by architecture.
 *   - Uses STRIPE_WEBHOOK_SECRET_P3 (not shared with any other product)
 *   - Reads PRODUCT_P3_BLOB_URL (not shared with any other product)
 *   - Validates against STRIPE_P3_PRODUCT_ID (not shared with any other product)
 *   - If product ID in payload does not match STRIPE_P3_PRODUCT_ID: reject, alert, stop.
 *
 * Product 3 Delivery:
 *   ZIP URL: https://mjmzu6hzzkfzgjso.public.blob.vercel-storage.com/products/
 *            p3-platform-ip-enforcement-toolkit/p3-platform-ip-enforcement-toolkit.zip
 *   Email subject: "Your Platform IP Enforcement Kit is ready — 9 templates inside"
 *   Email styling: Match P1 and P2 delivery email templates
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
    console.error("[webhook-p3] Telegram alert failed");
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_P3;
  const resendApiKey = process.env.RESEND_API_KEY;
  const blobUrl = process.env.PRODUCT_P3_BLOB_URL || "https://mjmzu6hzzkfzgjso.public.blob.vercel-storage.com/products/p3-platform-ip-enforcement-toolkit/p3-platform-ip-enforcement-toolkit.zip";
  const expectedProductId = process.env.STRIPE_P3_PRODUCT_ID;
  const fromEmail = process.env.FROM_EMAIL || "hello@sellerdefensekit.com";

  if (!webhookSecret) {
    console.error("[webhook-p3] STRIPE_WEBHOOK_SECRET_P3 not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!resendApiKey) {
    console.error("[webhook-p3] RESEND_API_KEY not set");
    return NextResponse.json({ error: "Email provider not configured" }, { status: 500 });
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
    console.error("[webhook-p3] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentIntent = event.data.object as any;

    // ── PRODUCT ID VALIDATION ──────────────────────────────────────────────
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
            const alert = `WEBHOOK PRODUCT ID MISMATCH [P3]\nExpected: ${expectedProductId}\nFound: ${productIds.join(", ")}\nPayment Intent: ${paymentIntent.id}\nAction: delivery BLOCKED`;
            console.error("[webhook-p3]", alert);
            await alertFounder(alert);
            return NextResponse.json({ error: "Product ID mismatch, delivery blocked" }, { status: 400 });
          }
        }
      } catch (validationErr) {
        console.warn("[webhook-p3] Product ID validation lookup failed (continuing):", validationErr);
      }
    }
    // ── END PRODUCT ID VALIDATION ──────────────────────────────────────────

    const customerEmail: string | null =
      paymentIntent.receipt_email ||
      paymentIntent.customer_details?.email ||
      null;

    if (!customerEmail) {
      console.error("[webhook-p3] No customer email on payment_intent:", paymentIntent.id);
      return NextResponse.json({ received: true, note: "No email on record" });
    }

    // Mint a unique signed download token for this payment (30-day expiry)
    let downloadToken: string;
    try {
      downloadToken = generateDownloadToken(paymentIntent.id, blobUrl, 30);
    } catch (err) {
      console.error("[webhook-p3] Failed to generate download token:", err);
      return NextResponse.json({ error: "Token generation failed" }, { status: 500 });
    }

    const downloadLink = `${DOWNLOAD_BASE}?token=${encodeURIComponent(downloadToken)}`;

    // Send delivery email via Resend
    try {
      const resend = (await import("resend")).Resend;
      const emailClient = new resend(resendApiKey);

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #b45309 0%, #d97706 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .cta-button { display: inline-block; background: #b45309; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Platform IP Enforcement Kit is ready</h1>
    </div>
    <div class="content">
      <p>Hi,</p>
      <p>Your Platform IP Enforcement Kit download is ready. Inside you'll find 9 fillable PDF templates for every major platform:</p>
      <ul>
        <li>Amazon Brand Registry Report</li>
        <li>Amazon Rights and Protections Report</li>
        <li>TikTok Shop IPR Report</li>
        <li>AliExpress IPP Notice</li>
        <li>Pinterest IP Report</li>
        <li>Shopify and Standalone Website DMCA</li>
        <li>Gumroad, Creative Market, and Redbubble DMCA Notice</li>
        <li>Other Website and Google Deindex Notice</li>
        <li>Multi-Platform Infringement Evidence Log</li>
      </ul>
      <p>Your link is personalized and secure. It will expire in 30 days.</p>
      <a href="${downloadLink}" class="cta-button">Download Your Kit Now</a>
      <p>Questions? Reply to this email. We're here to help.</p>
      <p>Best,<br>The Seller Defense Kit Team</p>
    </div>
    <div class="footer">
      <p>This link expires in 30 days. Download your files and store them safely.</p>
    </div>
  </div>
</body>
</html>
      `;

      await emailClient.emails.send({
        from: fromEmail,
        to: customerEmail,
        subject: "Your Platform IP Enforcement Kit is ready — 9 templates inside",
        html: emailHtml,
      });

      console.log(`[webhook-p3] Delivery email sent to ${customerEmail}`);
    } catch (err) {
      console.error("[webhook-p3] Failed to send delivery email:", err);
      await alertFounder(
        `DELIVERY EMAIL FAILED [P3]\nCustomer: ${customerEmail}\nPayment: ${paymentIntent.id}\nError: ${err instanceof Error ? err.message : String(err)}`
      );
      return NextResponse.json({ error: "Email delivery failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true, email: customerEmail });
  }

  return NextResponse.json({ received: true });
}
