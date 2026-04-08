/**
 * Stripe Webhook Handler — Product 2: Trademark Protection Resource Toolkit
 *
 * Fires on payment_intent.succeeded:
 *   1. Verifies Stripe signature (using STRIPE_P2_WEBHOOK_SECRET — separate from Product 1)
 *   2. Extracts customer email from the PaymentIntent
 *   3. Mints a signed, time-limited download token (30 days) using the same lib/download-token utility
 *   4. Sends Product 2 delivery email via Resend with the unique download link
 *
 * Fires on refund.created:
 *   (logged for future revocation support — no action yet)
 *
 * Required env vars:
 *   STRIPE_P2_WEBHOOK_SECRET    Stripe webhook signing secret for this endpoint
 *   DOWNLOAD_SIGNING_SECRET     Shared HMAC secret (same as Product 1)
 *   PRODUCT_2_BLOB_URL          Vercel Blob URL of the Product 2 ZIP
 *   RESEND_API_KEY              Resend API key (shared)
 *   FROM_EMAIL                  e.g. noreply@sellerdefensekit.com
 *
 * NOTE: This is a completely separate route from /api/webhook/stripe.
 * Register this at: https://sellerdefensekit.com/api/webhook/stripe-trademark
 * in Stripe Dashboard as a separate webhook endpoint for the Product 2 payment link.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateDownloadToken } from "@/lib/download-token";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_P2_WEBHOOK_SECRET;
  const resendApiKey = process.env.RESEND_API_KEY;
  const blobUrl = process.env.PRODUCT_2_BLOB_URL;
  const fromEmail = process.env.FROM_EMAIL || "noreply@sellerdefensekit.com";
  const DOWNLOAD_BASE = "https://sellerdefensekit.com/api/download";

  if (!webhookSecret) {
    console.error("[webhook-trademark] STRIPE_P2_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!resendApiKey) {
    console.error("[webhook-trademark] RESEND_API_KEY not set");
    return NextResponse.json({ error: "Email provider not configured" }, { status: 500 });
  }
  if (!blobUrl) {
    console.error("[webhook-trademark] PRODUCT_2_BLOB_URL not set");
    return NextResponse.json({ error: "Product file not configured" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    const stripe = (await import("stripe")).default;
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-02-25.clover",
    });
    event = stripeClient.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[webhook-trademark] Signature verification failed:", err);
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
      console.error("[webhook-trademark] No customer email found in PaymentIntent", paymentIntent.id);
      return NextResponse.json({ received: true, warning: "No customer email" });
    }

    let downloadToken: string;
    try {
      downloadToken = generateDownloadToken(paymentIntent.id, blobUrl, 30);
    } catch (err) {
      console.error("[webhook-trademark] Failed to generate download token:", err);
      return NextResponse.json({ error: "Token generation failed" }, { status: 500 });
    }

    const downloadUrl = `${DOWNLOAD_BASE}/${downloadToken}`;
    const thankYouUrl = `https://sellerdefensekit.com/thank-you-trademark`;

    // Send delivery email via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [customerEmail],
        reply_to: "thestartergroupenterprise@gmail.com",
        subject: "Your Trademark Protection Kit is ready",
        html: buildEmailHtml(downloadUrl, thankYouUrl, customerEmail),
        text: buildEmailText(downloadUrl, customerEmail),
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("[webhook-trademark] Resend failed:", errText);
      return NextResponse.json({ error: "Email delivery failed" }, { status: 500 });
    }

    console.log(`[webhook-trademark] Delivered to ${customerEmail}, PI: ${paymentIntent.id}`);
  }

  if (event.type === "refund.created") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const refund = event.data.object as any;
    console.log(`[webhook-trademark] Refund created: ${refund.id} for payment ${refund.payment_intent}`);
  }

  return NextResponse.json({ received: true });
}

function buildEmailHtml(downloadUrl: string, thankYouUrl: string, customerEmail: string): string {
  const unsubscribeUrl = `https://sellerdefensekit.com/unsubscribe?email=${encodeURIComponent(customerEmail)}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Trademark Protection Kit</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">

  <h1 style="color: #d97706; font-size: 24px; margin-bottom: 8px;">
    Your Trademark Protection Kit is ready.
  </h1>

  <p style="font-size: 16px; color: #555; margin-bottom: 24px;">
    Thank you for your purchase. Your 6-document toolkit is ready to download.
  </p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${downloadUrl}"
       style="background-color: #d97706; color: white; padding: 16px 32px;
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
    <li>&#128221; Brand Rights Documentation Log — document your common law rights starting today</li>
    <li>&#9989; Trademark Search and Clearance Checklist — confirm no conflicts before claiming a name</li>
    <li>&#128196; Marketplace Brand Violation Report Template — file on Etsy, Amazon, Temu, AliExpress</li>
    <li>&#128269; Trademark Monitoring Workflow — weekly and monthly brand scan protocol</li>
    <li>&#128247; Brand Identity Infringement Evidence Log — capture everything when infringement is found</li>
    <li>&#127959; Trademark Registration Readiness Checklist — USPTO filing preparation</li>
  </ul>

  <p style="font-size: 14px; color: #555; margin-top: 16px;">
    Start with Document 1. Fill in Section 1 today. Then run the Monitoring Workflow once
    per week. The kit is designed to take 30 minutes the first time you use it.
  </p>

  <p style="font-size: 13px; color: #999; margin-top: 32px;">
    This download link is valid for 30 days.<br>
    Questions? Reply to this email or contact us at
    <a href="mailto:thestartergroupenterprise@gmail.com" style="color: #d97706;">
      thestartergroupenterprise@gmail.com
    </a>.<br>
    30-day money-back guarantee.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

  <p style="font-size: 11px; color: #bbb; line-height: 1.6;">
    This email was sent by <strong>Seller Defense Kit, a product of The Starter Group</strong><br>
    2967 Dundas St W, Toronto, ON M6P 1Z2, Canada<br>
    You received this email because you purchased the Trademark Protection Resource Toolkit.<br>
    <a href="${unsubscribeUrl}" style="color: #bbb;">Unsubscribe</a>
  </p>

</body>
</html>`;
}

function buildEmailText(downloadUrl: string, customerEmail: string): string {
  const unsubscribeUrl = `https://sellerdefensekit.com/unsubscribe?email=${encodeURIComponent(customerEmail)}`;
  return `Your Trademark Protection Kit is ready.

Thank you for your purchase. Download your 6-document toolkit here:
${downloadUrl}

This link is valid for 30 days.

What's in your kit:
1. Brand Rights Documentation Log
2. Trademark Search and Clearance Checklist
3. Marketplace Brand Violation Report Template
4. Trademark Monitoring Workflow
5. Brand Identity Infringement Evidence Log
6. Trademark Registration Readiness Checklist

Start with Document 1. Fill in Section 1 today. Then run the Monitoring Workflow once per week.

Questions? Reply to this email or contact us at thestartergroupenterprise@gmail.com.
30-day money-back guarantee.

---
This email was sent by Seller Defense Kit, a product of The Starter Group
2967 Dundas St W, Toronto, ON M6P 1Z2, Canada
You received this email because you purchased the Trademark Protection Resource Toolkit.
Unsubscribe: ${unsubscribeUrl}`;
}
