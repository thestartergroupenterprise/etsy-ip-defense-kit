/**
 * UNIFIED Stripe Webhook Handler — Products 1, 2, and 3
 *
 * Fires on payment_intent.succeeded:
 *   1. Verifies Stripe signature using STRIPE_WEBHOOK_SECRET (shared for all products on same account)
 *   2. Reads product ID from checkout session line items
 *   3. Routes to correct product config (P1, P2, or P3)
 *   4. Validates product is configured (if not found, alerts Founder)
 *   5. Extracts customer email from the PaymentIntent
 *   6. Mints a signed, time-limited download token (30 days) tied to this payment
 *   7. Sends product-specific delivery email via Resend with the unique download link
 *   8. (P1 only) Writes nurture queue entry to Vercel Blob for follow-up sequence
 *
 * Fires on refund.created:
 *   (logged for future revocation support, no action yet)
 *
 * PRODUCT CONFIGURATIONS (defined below):
 *   P1: Etsy IP Defense Kit ($27)
 *   P2: Trademark Protection Kit ($47)
 *   P3: Platform IP Enforcement Kit ($67)
 *
 * Required env vars (all products use same webhook secret):
 *   STRIPE_WEBHOOK_SECRET      Stripe webhook signing secret (shared for all products)
 *   PRODUCT_BLOB_URL           P1 Vercel Blob URL
 *   PRODUCT_2_BLOB_URL         P2 Vercel Blob URL
 *   PRODUCT_3_BLOB_URL (optional)  P3 Vercel Blob URL (hardcoded fallback below)
 *   DOWNLOAD_SIGNING_SECRET    HMAC secret for download token minting
 *   RESEND_API_KEY             Resend API key
 *   FROM_EMAIL                 e.g. hello@sellerdefensekit.com
 *   TELEGRAM_BOT_TOKEN         For Founder mismatch alerts
 *   TELEGRAM_CHAT_ID           Founder chat ID (8493404368)
 */

import { NextRequest, NextResponse } from "next/server";
import { generateDownloadToken } from "@/lib/download-token";
import { promises as fs } from "fs";
import path from "path";

const DOWNLOAD_BASE = "https://sellerdefensekit.com/api/download";
const FOUNDER_CHAT_ID = "8493404368";
const PROSPECTS_FILE = "/data/openclaw-system/data/prospect_verified.json";

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function updateProspectForPurchase(
  customerEmail: string,
  productId: string,
): Promise<void> {
  try {
    const data = JSON.parse(await fs.readFile(PROSPECTS_FILE, "utf8"));
    const contacts = data.contacts || [];
    
    // Case-insensitive email matching
    const contact = contacts.find(
      (c: any) => c.email.toLowerCase() === customerEmail.toLowerCase()
    );
    
    if (!contact) {
      console.log(
        `[webhook-unified] Contact not found in prospect_verified.json for ${customerEmail} (product: ${productId})`
      );
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    if (productId === "prod_UIWdonnmxXAE0K") {
      // P2 Purchase: Set completed_purchased + P3 eligibility
      contact.sequence_status = contact.sequence_status || {};
      contact.sequence_status.product_2 = "completed_purchased";
      contact.p3_eligible_date = addDays(today, 5);
      contact.p3_track = "track_2";
      console.log(
        `[webhook-unified] Updated ${customerEmail}: P2 marked completed_purchased, P3 Track 2 eligible on ${contact.p3_eligible_date}`
      );
    } else if (productId === "prod_UMqLUXJV0Qb1DC") {
      // P3 Purchase: Set completed_purchased + P4 eligibility
      contact.sequence_status = contact.sequence_status || {};
      contact.sequence_status.product_3 = "completed_purchased";
      contact.p4_eligible_date = addDays(today, 5);
      console.log(
        `[webhook-unified] Updated ${customerEmail}: P3 marked completed_purchased, P4 eligible on ${contact.p4_eligible_date}`
      );
    } else if (productId === "prod_UNKnXuzKPtzgaD") {
      // P4 Purchase: Set completed_purchased
      contact.sequence_status = contact.sequence_status || {};
      contact.sequence_status.product_4 = "completed_purchased";
      console.log(
        `[webhook-unified] Updated ${customerEmail}: P4 marked completed_purchased`
      );
    }

    // Write updated data back to file
    data.last_updated = today;
    await fs.writeFile(PROSPECTS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(
      `[webhook-unified] Failed to update prospect for ${customerEmail}:`,
      err
    );
    // Non-fatal: purchase delivery email already sent successfully
  }
}

// Product Configuration Map
const PRODUCT_CONFIG: {
  [key: string]: {
    name: string;
    blobUrl: string;
    emailSubject: string;
    emailTemplateType: "p1" | "p2" | "p3" | "p4";
    sendNurtureQueue: boolean;
  };
} = {
  // Product 1: Etsy IP Defense Kit
  prod_UBj6Q3NT9DQNhr: {
    name: "Etsy IP Defense Kit",
    blobUrl: process.env.PRODUCT_BLOB_URL || "",
    emailSubject: "Your Seller Defense Kit is ready, download link inside",
    emailTemplateType: "p1",
    sendNurtureQueue: true,
  },
  // Product 2: Trademark Protection Kit
  prod_UIWdonnmxXAE0K: {
    name: "Trademark Protection Kit",
    blobUrl: process.env.PRODUCT_2_BLOB_URL || "",
    emailSubject: "Your Trademark Protection Kit is ready — download inside",
    emailTemplateType: "p2",
    sendNurtureQueue: false,
  },
  // Product 3: Platform IP Enforcement Kit
  prod_UMqLUXJV0Qb1DC: {
    name: "Platform IP Enforcement Kit",
    blobUrl:
      process.env.PRODUCT_3_BLOB_URL ||
      "https://mjmzu6hzzkfzgjso.public.blob.vercel-storage.com/products/p3-platform-ip-enforcement-toolkit/p3-platform-ip-enforcement-toolkit.zip",
    emailSubject: "Your Platform IP Enforcement Kit is ready — 9 templates inside",
    emailTemplateType: "p3",
    sendNurtureQueue: false,
  },
  // Product 4: Escalation Framework
  prod_UNKnXuzKPtzgaD: {
    name: "Escalation Framework",
    blobUrl:
      process.env.PRODUCT_4_BLOB_URL ||
      "https://mjmzu6hzzkfzgjso.public.blob.vercel-storage.com/products/p4-escalation-framework.zip",
    emailSubject: "Your Escalation Framework is ready — 7 templates inside",
    emailTemplateType: "p4",
    sendNurtureQueue: false,
  },
};

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
    console.error("[webhook-unified] Telegram alert failed");
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "hello@sellerdefensekit.com";

  if (!webhookSecret) {
    console.error("[webhook-unified] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!resendApiKey) {
    console.error("[webhook-unified] RESEND_API_KEY not set");
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
    console.error("[webhook-unified] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentIntent = event.data.object as any;

    // ── PRODUCT ID DETECTION ────────────────────────────────────────────────
    // Look up the Checkout Session for this PaymentIntent to determine which product was purchased
    let detectedProductId: string | null = null;

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

        if (productIds.length > 0) {
          detectedProductId = productIds[0]; // Use first product ID
          console.log(
            `[webhook-unified] Detected product: ${detectedProductId} for payment ${paymentIntent.id}`
          );
        }
      }
    } catch (err) {
      console.warn("[webhook-unified] Product ID detection failed (continuing):", err);
    }

    if (!detectedProductId) {
      console.error("[webhook-unified] Could not detect product ID for payment:", paymentIntent.id);
      return NextResponse.json({ received: true, note: "No product ID detected" });
    }

    // ── PRODUCT CONFIG LOOKUP ───────────────────────────────────────────────
    const productConfig = PRODUCT_CONFIG[detectedProductId];

    if (!productConfig) {
      const alert = `UNKNOWN PRODUCT ID IN WEBHOOK\nProduct: ${detectedProductId}\nPayment Intent: ${paymentIntent.id}\nAction: delivery BLOCKED (product not configured)`;
      console.error("[webhook-unified]", alert);
      await alertFounder(alert);
      return NextResponse.json({ error: "Product not configured" }, { status: 400 });
    }

    if (!productConfig.blobUrl) {
      const alert = `MISSING BLOB URL FOR PRODUCT\nProduct: ${productConfig.name} (${detectedProductId})\nPayment Intent: ${paymentIntent.id}\nAction: delivery BLOCKED (no file URL)`;
      console.error("[webhook-unified]", alert);
      await alertFounder(alert);
      return NextResponse.json({ error: "Product file not configured" }, { status: 500 });
    }

    // ── END PRODUCT CONFIG LOOKUP ───────────────────────────────────────────

    const customerEmail: string | null =
      paymentIntent.receipt_email || paymentIntent.customer_details?.email || null;

    if (!customerEmail) {
      console.error("[webhook-unified] No customer email on payment_intent:", paymentIntent.id);
      return NextResponse.json({ received: true, note: "No email on record" });
    }

    // Mint a unique signed download token for this payment (30-day expiry)
    let downloadToken: string;
    try {
      downloadToken = generateDownloadToken(paymentIntent.id, productConfig.blobUrl, 30);
    } catch (err) {
      console.error("[webhook-unified] Failed to generate download token:", err);
      return NextResponse.json({ error: "Token generation failed" }, { status: 500 });
    }

    const downloadPageUrl = `${DOWNLOAD_BASE}/${downloadToken}`;

    console.log(
      `[webhook-unified] ${productConfig.name} | token length: ${downloadToken.length} | email: ${customerEmail}`
    );

    // Write nurture queue entry to Vercel Blob (P1 only)
    if (productConfig.sendNurtureQueue) {
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
        console.log(
          `[webhook-unified] Nurture queue entry created for ${customerEmail} (P1)`
        );
      } catch (err) {
        // Non-fatal, delivery email still sends
        console.error("[webhook-unified] Failed to write nurture queue entry:", err);
      }
    }

    // Send delivery email via Resend
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);

      const emailHtml = buildEmailHtml(
        downloadPageUrl,
        customerEmail,
        productConfig.emailTemplateType
      );
      const emailText = buildEmailText(downloadPageUrl, customerEmail, productConfig.emailTemplateType);

      await resend.emails.send({
        from: fromEmail,
        to: customerEmail,
        replyTo: "hello@sellerdefensekit.com",
        subject: productConfig.emailSubject,
        html: emailHtml,
        text: emailText,
      });

      console.log(
        `[webhook-unified] Delivery email sent to ${customerEmail} for ${productConfig.name} (${detectedProductId})`
      );

      // Update prospect_verified.json with purchase status and next product eligibility
      // For P2 purchases: set completed_purchased + P3 Track 2 eligibility
      // For P3 purchases: set completed_purchased + P4 eligibility (future-proofing)
      await updateProspectForPurchase(customerEmail, detectedProductId);
    } catch (emailErr) {
      console.error("[webhook-unified] Failed to send delivery email:", emailErr);
      return NextResponse.json({ error: "Email delivery failed" }, { status: 500 });
    }
  }

  if (event.type === "refund.created") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const refund = event.data.object as any;
    console.log(
      `[webhook-unified] Refund created: ${refund.id} for payment ${refund.payment_intent}`
    );
    // Future: look up token by payment intent ID and revoke it
  }

  return NextResponse.json({ received: true });
}

function buildEmailHtml(
  downloadPageUrl: string,
  customerEmail: string,
  templateType: "p1" | "p2" | "p3" | "p4"
): string {
  const unsubscribeUrl = `https://sellerdefensekit.com/unsubscribe?email=${encodeURIComponent(customerEmail)}`;

  if (templateType === "p1") {
    // P1: Etsy IP Defense Kit
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
    <li>📄 DMCA Takedown Notice, for Etsy, Temu, AliExpress and web</li>
    <li>✉️ Cease and Desist Letter, direct seller contact template</li>
    <li>🔍 IP Theft Monitoring Checklist, find theft on 5 platforms</li>
    <li>📝 Multi-Platform Filing Guide, step-by-step for every portal</li>
    <li>📋 Listing Reinstatement Appeal, for when your own listing gets suspended</li>
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
  } else if (templateType === "p2") {
    // P2: Trademark Protection Kit
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
    Thank you for your purchase. Your trademark protection toolkit is ready to download.
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
    <li>📄 Trademark Clearance Checklist</li>
    <li>✉️ Cease and Desist Letter Template</li>
    <li>🔍 Marketplace Monitoring Guide</li>
    <li>📝 Brand Identity Evidence Log</li>
    <li>📋 Trademark Registration Readiness Checklist</li>
    <li>📊 Multi-Platform Brand Violation Report Template</li>
  </ul>

  <p style="font-size: 13px; color: #999; margin-top: 32px;">
    This download link is valid for 30 days.<br>
    Questions? Reply to this email or contact us at
    <a href="mailto:hello@sellerdefensekit.com" style="color: #d97706;">
      hello@sellerdefensekit.com
    </a>.<br>
    30-day money-back guarantee. If you cannot protect your trademark in 20 minutes, we will refund you.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

  <p style="font-size: 11px; color: #bbb; line-height: 1.6;">
    This email was sent by <strong>Seller Defense Kit, a product of The Starter Group</strong><br>
    2967 Dundas St W, Toronto, ON M6P 1Z2, Canada<br>
    You received this email because you purchased the Trademark Protection Kit.<br>
    <a href="${unsubscribeUrl}" style="color: #bbb;">Unsubscribe</a>
  </p>

</body>
</html>`;
  } else if (templateType === "p3") {
    // P3: Platform IP Enforcement Kit
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Platform IP Enforcement Kit</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">

  <h1 style="color: #d97706; font-size: 24px; margin-bottom: 8px;">
    Your Platform IP Enforcement Kit is ready.
  </h1>

  <p style="font-size: 16px; color: #555; margin-bottom: 24px;">
    Thank you for your purchase. Your 9-template platform-specific enforcement toolkit is ready to download.
  </p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${downloadPageUrl}"
       style="background-color: #d97706; color: white; padding: 16px 32px;
              border-radius: 8px; text-decoration: none; font-size: 18px;
              font-weight: bold; display: inline-block;">
      Download Your 9 Templates Now
    </a>
  </div>

  <p style="font-size: 14px; color: #777;">
    Or copy this link into your browser:<br>
    <a href="${downloadPageUrl}" style="color: #d97706; word-break: break-all;">${downloadPageUrl}</a>
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

  <h2 style="font-size: 16px; color: #111;">What's in your kit (9 fillable PDFs):</h2>
  <ul style="color: #555; font-size: 14px; line-height: 1.8;">
    <li>📄 Amazon Brand Registry IP Report</li>
    <li>📄 Amazon Rights and Protections Report</li>
    <li>📄 TikTok Shop IPR Report</li>
    <li>📄 AliExpress IPP Notice</li>
    <li>📄 Pinterest IP Report</li>
    <li>📄 Shopify and Standalone Website DMCA Notice</li>
    <li>📄 Gumroad, Creative Market, Redbubble DMCA</li>
    <li>📄 Other Website and Google Deindex Notice</li>
    <li>📊 Multi-Platform Infringement Evidence Log</li>
  </ul>

  <p style="font-size: 13px; color: #999; margin-top: 32px;">
    This download link is valid for 30 days.<br>
    Questions? Reply to this email or contact us at
    <a href="mailto:hello@sellerdefensekit.com" style="color: #d97706;">
      hello@sellerdefensekit.com
    </a>.<br>
    30-day money-back guarantee. File correctly on the first try or get your money back.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

  <p style="font-size: 11px; color: #bbb; line-height: 1.6;">
    This email was sent by <strong>Seller Defense Kit, a product of The Starter Group</strong><br>
    2967 Dundas St W, Toronto, ON M6P 1Z2, Canada<br>
    You received this email because you purchased the Platform IP Enforcement Kit.<br>
    <a href="${unsubscribeUrl}" style="color: #bbb;">Unsubscribe</a>
  </p>

</body>
</html>`;
  } else {
    // P4: Escalation Framework
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Escalation Framework</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">

  <h1 style="color: #d97706; font-size: 24px; margin-bottom: 8px;">
    Your Escalation Framework is ready.
  </h1>

  <p style="font-size: 16px; color: #555; margin-bottom: 24px;">
    Thank you for your purchase. Your 7-template post-DMCA escalation toolkit is ready to download.
  </p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${downloadPageUrl}"
       style="background-color: #d97706; color: white; padding: 16px 32px;
              border-radius: 8px; text-decoration: none; font-size: 18px;
              font-weight: bold; display: inline-block;">
      Download Your 7 Templates Now
    </a>
  </div>

  <p style="font-size: 14px; color: #777;">
    Or copy this link into your browser:<br>
    <a href="${downloadPageUrl}" style="color: #d97706; word-break: break-all;">${downloadPageUrl}</a>
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

  <h2 style="font-size: 16px; color: #111;">What's in your kit (7 fillable PDFs):</h2>
  <ul style="color: #555; font-size: 14px; line-height: 1.8;">
    <li>01 Escalation Notice Letter (formal second notice, willful infringement)</li>
    <li>02 Evidence Packaging Checklist (40-row file index, court-ready)</li>
    <li>03 Small Claims Court Preparation (CCB and state small claims)</li>
    <li>04 Lawyer Handoff Documentation (attorney consultation prep)</li>
    <li>05 Platform Re-Filing Template (Etsy, Amazon, eBay, Shopify, TikTok)</li>
    <li>06 Escalation Decision Tree (stage assessment and action log)</li>
    <li>07 Repeat Infringer Documentation Log (11 incidents, pattern analysis)</li>
  </ul>

  <p style="font-size: 13px; color: #555; margin-top: 24px;">
    <strong>Start with Document 06 (the Decision Tree)</strong> -- it tells you which of the
    7 templates to prioritize for your specific situation.
  </p>

  <p style="font-size: 13px; color: #999; margin-top: 24px;">
    This download link is valid for 30 days.<br>
    Questions? Reply to this email or contact us at
    <a href="mailto:hello@sellerdefensekit.com" style="color: #d97706;">
      hello@sellerdefensekit.com
    </a>.<br>
    30-day money-back guarantee.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

  <p style="font-size: 11px; color: #bbb; line-height: 1.6;">
    This email was sent by <strong>Seller Defense Kit, a product of The Starter Group</strong><br>
    2967 Dundas St W, Toronto, ON M6P 1Z2, Canada<br>
    You received this email because you purchased the Escalation Framework.<br>
    <a href="${unsubscribeUrl}" style="color: #bbb;">Unsubscribe</a>
  </p>

</body>
</html>`;
  }
}

function buildEmailText(
  downloadPageUrl: string,
  customerEmail: string,
  templateType: "p1" | "p2" | "p3" | "p4"
): string {
  const unsubscribeUrl = `https://sellerdefensekit.com/unsubscribe?email=${encodeURIComponent(customerEmail)}`;

  if (templateType === "p1") {
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
  } else if (templateType === "p2") {
    return `Your Trademark Protection Kit is ready.

Thank you for your purchase. Download your toolkit here:
${downloadPageUrl}

This link is valid for 30 days.

What's in your kit:
- Trademark Clearance Checklist
- Cease and Desist Letter Template
- Marketplace Monitoring Guide
- Brand Identity Evidence Log
- Trademark Registration Readiness Checklist
- Multi-Platform Brand Violation Report Template

Questions? Reply to this email or contact us at hello@sellerdefensekit.com.
30-day money-back guarantee.

---
Seller Defense Kit, a product of The Starter Group
2967 Dundas St W, Toronto, ON M6P 1Z2, Canada
You received this email because you purchased the Trademark Protection Kit.
Unsubscribe: ${unsubscribeUrl}`;
  } else if (templateType === "p3") {
    return `Your Platform IP Enforcement Kit is ready.

Thank you for your purchase. Download your 9-template enforcement toolkit here:
${downloadPageUrl}

This link is valid for 30 days.

What's in your kit (9 fillable PDFs):
- Amazon Brand Registry IP Report
- Amazon Rights and Protections Report
- TikTok Shop IPR Report
- AliExpress IPP Notice
- Pinterest IP Report
- Shopify and Standalone Website DMCA Notice
- Gumroad, Creative Market, Redbubble DMCA
- Other Website and Google Deindex Notice
- Multi-Platform Infringement Evidence Log

Questions? Reply to this email or contact us at hello@sellerdefensekit.com.
30-day money-back guarantee.

---
Seller Defense Kit, a product of The Starter Group
2967 Dundas St W, Toronto, ON M6P 1Z2, Canada
You received this email because you purchased the Platform IP Enforcement Kit.
Unsubscribe: ${unsubscribeUrl}`;
  } else {
    return `Your Escalation Framework is ready.

Thank you for your purchase. Download your 7-template post-DMCA escalation toolkit here:
${downloadPageUrl}

This link is valid for 30 days.

What's in your kit (7 fillable PDFs):
01 - Escalation Notice Letter (formal second notice, willful infringement)
02 - Evidence Packaging Checklist (40-row file index, court-ready)
03 - Small Claims Court Preparation (CCB and state small claims)
04 - Lawyer Handoff Documentation (attorney consultation prep)
05 - Platform Re-Filing Template (Etsy, Amazon, eBay, Shopify, TikTok)
06 - Escalation Decision Tree (stage assessment and action log)
07 - Repeat Infringer Documentation Log (11 incidents, pattern analysis)

Start with Document 06 (the Decision Tree) -- it tells you which templates to prioritize.

Questions? Reply to this email or contact us at hello@sellerdefensekit.com.
30-day money-back guarantee.

---
Seller Defense Kit, a product of The Starter Group
2967 Dundas St W, Toronto, ON M6P 1Z2, Canada
You received this email because you purchased the Escalation Framework.
Unsubscribe: ${unsubscribeUrl}`;
  }
}
