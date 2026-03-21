/**
 * Stripe Webhook Handler
 *
 * Fires on payment_intent.succeeded:
 *   1. Verifies Stripe signature
 *   2. Extracts customer email from the PaymentIntent
 *   3. Mints a signed, time-limited download token (30 days) tied to this payment
 *   4. Sends delivery email via Resend with the unique download link
 *
 * Fires on refund.created:
 *   (logged for future revocation support — no action yet)
 *
 * Architecture:
 *   - No filesystem access. ZIP is served from Vercel Blob Storage.
 *   - Each payment gets a unique signed token — can't be guessed or shared indefinitely.
 *   - Future: add Vercel KV to enforce hard download count limits.
 *
 * Required env vars:
 *   STRIPE_WEBHOOK_SECRET      Stripe webhook signing secret
 *   DOWNLOAD_SIGNING_SECRET    Secret for HMAC-signing download tokens
 *   PRODUCT_BLOB_URL           Vercel Blob URL of the product ZIP
 *   RESEND_API_KEY             Resend API key
 *   NEXT_PUBLIC_SITE_URL       e.g. https://sellerdefensekit.com
 *   FROM_EMAIL                 e.g. noreply@sellerdefensekit.com
 */

import { NextRequest, NextResponse } from "next/server";
import { generateDownloadToken } from "@/lib/download-token";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const resendApiKey = process.env.RESEND_API_KEY;
  const blobUrl = process.env.PRODUCT_BLOB_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sellerdefensekit.com";
  const fromEmail = process.env.FROM_EMAIL || "noreply@sellerdefensekit.com";

  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!resendApiKey) {
    console.error("[webhook] RESEND_API_KEY not set");
    return NextResponse.json({ error: "Email provider not configured" }, { status: 500 });
  }
  if (!blobUrl) {
    console.error("[webhook] PRODUCT_BLOB_URL not set");
    return NextResponse.json({ error: "Product file not configured" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  // Verify Stripe signature
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    const stripe = (await import("stripe")).default;
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-02-25.clover",
    });
    event = stripeClient.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentIntent = event.data.object as any;
    const customerEmail: string | null =
      paymentIntent.receipt_email ||
      paymentIntent.customer_details?.email ||
      null;

    if (!customerEmail) {
      console.error("[webhook] No customer email on payment_intent:", paymentIntent.id);
      return NextResponse.json({ received: true, note: "No email on record" });
    }

    // Mint a unique signed download token for this payment (30-day expiry)
    let downloadToken: string;
    try {
      downloadToken = generateDownloadToken(paymentIntent.id, blobUrl, 30);
    } catch (err) {
      console.error("[webhook] Failed to generate download token:", err);
      return NextResponse.json({ error: "Token generation failed" }, { status: 500 });
    }

    const downloadPageUrl = `${siteUrl}/api/download/${downloadToken}`;

    // Send delivery email via Resend
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);

      await resend.emails.send({
        from: fromEmail,
        to: customerEmail,
        replyTo: "thestartergroupenterprise@gmail.com",
        subject: "Your Etsy IP Defense Kit is ready — download link inside",
        html: buildEmailHtml(downloadPageUrl),
        text: buildEmailText(downloadPageUrl),
      });

      console.log(`[webhook] Delivery email sent to ${customerEmail} for ${paymentIntent.id}`);
    } catch (emailErr) {
      console.error("[webhook] Failed to send delivery email:", emailErr);
      return NextResponse.json({ error: "Email delivery failed" }, { status: 500 });
    }
  }

  if (event.type === "refund.created") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const refund = event.data.object as any;
    console.log(`[webhook] Refund created: ${refund.id} for payment ${refund.payment_intent}`);
    // Future: look up the token by payment intent ID in Vercel KV and revoke it
  }

  return NextResponse.json({ received: true });
}

function buildEmailHtml(downloadPageUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Etsy IP Defense Kit</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">

  <h1 style="color: #d97706; font-size: 24px; margin-bottom: 8px;">
    Your Etsy IP Defense Kit is ready.
  </h1>

  <p style="font-size: 16px; color: #555; margin-bottom: 24px;">
    Thank you for your purchase. Your 5-document PDF toolkit is ready to download.
  </p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${downloadPageUrl}"
       style="background-color: #f59e0b; color: white; padding: 16px 32px;
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
    <li>📄 DMCA Takedown Notice — for Etsy, Temu, AliExpress &amp; web</li>
    <li>✉️ Cease &amp; Desist Letter — direct seller contact template</li>
    <li>🔍 IP Theft Monitoring Checklist — find theft on 5 platforms</li>
    <li>🗺️ Multi-Platform Filing Guide — step-by-step for every portal</li>
    <li>🛡️ Listing Reinstatement Appeal — for when YOUR listing gets suspended</li>
  </ul>

  <p style="font-size: 13px; color: #999; margin-top: 32px;">
    This download link is valid for 30 days.<br>
    Questions? Reply to this email or contact us at
    <a href="mailto:thestartergroupenterprise@gmail.com" style="color: #d97706;">
      thestartergroupenterprise@gmail.com
    </a>.<br>
    30-day money-back guarantee — if you can't file your first DMCA in 15 minutes, we'll refund you.
  </p>

</body>
</html>`;
}

function buildEmailText(downloadPageUrl: string): string {
  return `Your Etsy IP Defense Kit is ready.

Thank you for your purchase. Download your 5-document PDF kit here:
${downloadPageUrl}

This link is valid for 30 days.

What's in your kit:
- DMCA Takedown Notice (for Etsy, Temu, AliExpress & web)
- Cease & Desist Letter
- IP Theft Monitoring Checklist
- Multi-Platform Filing Guide
- Listing Reinstatement Appeal

Questions? Reply to this email or contact us at thestartergroupenterprise@gmail.com.
30-day money-back guarantee.`;
}
