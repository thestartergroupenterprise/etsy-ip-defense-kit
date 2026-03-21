/**
 * Stripe Webhook Handler
 * Fires on payment_intent.succeeded → sends delivery email via Resend
 *
 * Required environment variables:
 *   STRIPE_WEBHOOK_SECRET   — from Stripe Dashboard → Webhooks
 *   RESEND_API_KEY          — from resend.com (request from Orchestrator)
 *   DOWNLOAD_SECRET_PATH    — long random string for the private download URL
 *   NEXT_PUBLIC_SITE_URL    — e.g. https://etsy-ip-kit.com
 *   FROM_EMAIL              — e.g. noreply@etsy-ip-kit.com
 *
 * NOTE: This handler is CODE-COMPLETE but NOT ACTIVE.
 * It will not fire until:
 *   1. Stripe approval is granted and a live Stripe product/webhook is configured
 *   2. RESEND_API_KEY is set in Vercel environment variables
 */

import { NextRequest, NextResponse } from "next/server";

// Stripe and Resend are installed as dependencies (see package.json)
// They are imported lazily to avoid runtime errors before credentials are set

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const resendApiKey = process.env.RESEND_API_KEY;
  const downloadSecretPath = process.env.DOWNLOAD_SECRET_PATH;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sellerdefensekit.com";
  const fromEmail = process.env.FROM_EMAIL || "noreply@sellerdefensekit.com";

  // Guard: fail loudly if credentials are missing
  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!resendApiKey) {
    console.error("[webhook] RESEND_API_KEY not set");
    return NextResponse.json({ error: "Email provider not configured" }, { status: 500 });
  }
  if (!downloadSecretPath) {
    console.error("[webhook] DOWNLOAD_SECRET_PATH not set");
    return NextResponse.json({ error: "Download path not configured" }, { status: 500 });
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

  // Handle the event
  if (event.type === "payment_intent.succeeded") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentIntent = event.data.object as any;
    const customerEmail: string | null =
      paymentIntent.receipt_email ||
      paymentIntent.customer_details?.email ||
      null;

    if (!customerEmail) {
      console.error("[webhook] No customer email found on payment_intent:", paymentIntent);
      // Return 200 to prevent Stripe retries — log for manual follow-up
      return NextResponse.json({ received: true, note: "No email on record" });
    }

    const downloadUrl = `${siteUrl}/api/download/${downloadSecretPath}`;

    // Send delivery email via Resend
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);

      await resend.emails.send({
        from: fromEmail,
        to: customerEmail,
        subject: "Your Etsy IP Defense Kit is ready — download link inside",
        html: buildEmailHtml(downloadUrl),
        text: buildEmailText(downloadUrl),
      });

      console.log(`[webhook] Delivery email sent to ${customerEmail}`);
    } catch (emailErr) {
      console.error("[webhook] Failed to send delivery email:", emailErr);
      // Return 500 so Stripe retries (email failure is retriable)
      return NextResponse.json({ error: "Email delivery failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

function buildEmailHtml(downloadUrl: string): string {
  return `
<!DOCTYPE html>
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
    Thank you for your purchase. Your 5-document toolkit is ready to download.
  </p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${downloadUrl}"
       style="background-color: #f59e0b; color: white; padding: 16px 32px;
              border-radius: 8px; text-decoration: none; font-size: 18px;
              font-weight: bold; display: inline-block;">
      Download Your Kit Now
    </a>
  </div>

  <p style="font-size: 14px; color: #777;">
    Or copy this link into your browser:<br>
    <a href="${downloadUrl}" style="color: #d97706; word-break: break-all;">${downloadUrl}</a>
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

  <h2 style="font-size: 16px; color: #111;">What's in your kit:</h2>
  <ul style="color: #555; font-size: 14px; line-height: 1.8;">
    <li>📄 DMCA Takedown Notice — for Etsy, Temu, AliExpress &amp; web</li>
    <li>✉️ Cease &amp; Desist Letter — direct seller contact template</li>
    <li>🔍 IP Theft Monitoring Checklist — find theft on 5 platforms</li>
    <li>🗺️ Multi-Platform Filing Guide — step-by-step for every portal</li>
    <li>🛡️ Listing Reinstatement Appeal — for when YOUR listing gets suspended</li>
  </ul>

  <p style="font-size: 13px; color: #999; margin-top: 32px;">
    Questions? Just reply to this email.<br>
    30-day money-back guarantee — if you can't file your first DMCA in 15 minutes, we'll refund you. No questions asked.
  </p>

</body>
</html>
`;
}

function buildEmailText(downloadUrl: string): string {
  return `
Your Etsy IP Defense Kit is ready.

Thank you for your purchase. Download your kit here:
${downloadUrl}

What's in your kit:
- DMCA Takedown Notice (for Etsy, Temu, AliExpress & web)
- Cease & Desist Letter
- IP Theft Monitoring Checklist
- Multi-Platform Filing Guide
- Listing Reinstatement Appeal

Questions? Just reply to this email.
30-day money-back guarantee — email within 30 days for a full refund.
`;
}
