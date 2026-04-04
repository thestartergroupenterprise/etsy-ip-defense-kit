/**
 * Nurture Email Cron
 *
 * Called daily by Vercel Cron (see vercel.json).
 * Reads all entries from the Vercel Blob nurture queue,
 * sends Email 2 at 48 hours post-purchase and Email 3 at 7 days post-purchase,
 * then updates the blob record to mark each email as sent.
 *
 * Required env vars:
 *   RESEND_API_KEY             Resend API key
 *   BLOB_READ_WRITE_TOKEN      Vercel Blob token
 *   FROM_EMAIL                 e.g. noreply@sellerdefensekit.com
 *   CRON_SECRET                Secret header for authenticating Vercel cron calls
 */

import { NextRequest, NextResponse } from "next/server";

const HOURS_48 = 48 * 60 * 60 * 1000;
const DAYS_7   =  7 * 24 * 60 * 60 * 1000;
const FROM_EMAIL_DEFAULT = "noreply@sellerdefensekit.com";
const REPLY_TO = "thestartergroupenterprise@gmail.com";
const SITE_URL = "https://sellerdefensekit.com";

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || FROM_EMAIL_DEFAULT;

  if (!resendApiKey) {
    console.error("[nurture-cron] RESEND_API_KEY not set");
    return NextResponse.json({ error: "Email provider not configured" }, { status: 500 });
  }

  const { list, put, del } = await import("@vercel/blob");
  const { Resend } = await import("resend");
  const resend = new Resend(resendApiKey);

  const now = Date.now();
  const results = { checked: 0, sent48h: 0, sent7d: 0, errors: 0 };

  // List all nurture queue entries
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: "nurture/", cursor, limit: 100 });
    cursor = page.cursor;

    for (const blob of page.blobs) {
      results.checked++;
      try {
        const res = await fetch(blob.url);
        if (!res.ok) continue;

        const record = await res.json() as {
          email: string;
          paymentIntentId: string;
          purchasedAt: string;
          sent48h: boolean;
          sent7d: boolean;
        };

        const age = now - new Date(record.purchasedAt).getTime();
        let updated = false;

        // Email 2 — 48-hour check-in
        if (!record.sent48h && age >= HOURS_48) {
          try {
            await resend.emails.send({
              from: fromEmail,
              to: record.email,
              replyTo: REPLY_TO,
              subject: "Did it work? (quick check-in)",
              html: build48hHtml(record.email),
              text: build48hText(record.email),
            });
            record.sent48h = true;
            updated = true;
            results.sent48h++;
            console.log(`[nurture-cron] 48h email sent to ${record.email}`);
          } catch (err) {
            results.errors++;
            console.error(`[nurture-cron] 48h send failed for ${record.email}:`, err);
          }
        }

        // Email 3 — 7-day tip + Facebook group
        if (!record.sent7d && age >= DAYS_7) {
          try {
            await resend.emails.send({
              from: fromEmail,
              to: record.email,
              replyTo: REPLY_TO,
              subject: "A quick tip for your Etsy shop",
              html: build7dHtml(record.email),
              text: build7dText(record.email),
            });
            record.sent7d = true;
            updated = true;
            results.sent7d++;
            console.log(`[nurture-cron] 7d email sent to ${record.email}`);
          } catch (err) {
            results.errors++;
            console.error(`[nurture-cron] 7d send failed for ${record.email}:`, err);
          }
        }

        // Update or clean up the blob record
        if (updated) {
          if (record.sent48h && record.sent7d) {
            // Both emails sent — remove from queue
            await del(blob.url);
            console.log(`[nurture-cron] Queue entry removed for ${record.email} (sequence complete)`);
          } else {
            await put(`nurture/${record.paymentIntentId}.json`, JSON.stringify(record), {
              access: "public",
              addRandomSuffix: false,
            });
          }
        }
      } catch (err) {
        results.errors++;
        console.error(`[nurture-cron] Failed to process blob ${blob.url}:`, err);
      }
    }
  } while (cursor);

  console.log(`[nurture-cron] Done. ${JSON.stringify(results)}`);
  return NextResponse.json({ ok: true, ...results });
}

// ─── Email 2: 48-hour check-in ───────────────────────────────────────────────

function build48hHtml(customerEmail: string): string {
  const unsubUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(customerEmail)}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">

  <p style="font-size: 16px;">Hey,</p>

  <p style="font-size: 16px;">
    Just checking in. You picked up the Seller Defense Kit a couple of days ago and
    I wanted to make sure it actually worked for your situation.
  </p>

  <p style="font-size: 16px;">
    Did you get a chance to use any of the templates? Did the DMCA notice cover what you needed,
    or did something not quite fit?
  </p>

  <p style="font-size: 16px;">
    Hit reply and let me know. If anything in the kit did not work the way it should,
    I want to fix it.
  </p>

  <p style="font-size: 16px;">
    And if it did work, if you got a listing taken down or even just finally know what to do
    next time, I would genuinely love to hear about it. Takes 30 seconds to reply and it means a lot.
  </p>

  <p style="font-size: 16px; margin-top: 32px;">
    Jay<br>
    <span style="color: #888;">Seller Defense Kit, a product of The Starter Group</span>
  </p>

  <p style="font-size: 14px; color: #888; margin-top: 8px;">
    P.S. If your download link expired or you cannot find the email, just reply here and
    I will send a fresh one right away.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

  <p style="font-size: 11px; color: #bbb; line-height: 1.6;">
    This email was sent by <strong>Seller Defense Kit, a product of The Starter Group</strong><br>
    2967 Dundas St W, Toronto, ON M6P 1Z2, Canada<br>
    You received this email because you purchased the Seller Defense Kit.<br>
    <a href="${unsubUrl}" style="color: #bbb;">Unsubscribe</a>
  </p>

</body>
</html>`;
}

function build48hText(customerEmail: string): string {
  const unsubUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(customerEmail)}`;
  return `Hey,

Just checking in. You picked up the Seller Defense Kit a couple of days ago and I wanted to make sure it actually worked for your situation.

Did you get a chance to use any of the templates? Did the DMCA notice cover what you needed, or did something not quite fit?

Hit reply and let me know. If anything in the kit did not work the way it should, I want to fix it.

And if it did work, if you got a listing taken down or even just finally know what to do next time, I would genuinely love to hear about it. Takes 30 seconds to reply and it means a lot.

Jay
Seller Defense Kit, a product of The Starter Group

P.S. If your download link expired or you cannot find the email, just reply here and I will send a fresh one right away.

This email was sent by Seller Defense Kit, a product of The Starter Group
2967 Dundas St W, Toronto, ON M6P 1Z2, Canada
You received this email because you purchased the Seller Defense Kit.
Unsubscribe: ${unsubUrl}`;
}

// ─── Email 3: 7-day tip + Facebook group ─────────────────────────────────────

function build7dHtml(customerEmail: string): string {
  const unsubUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(customerEmail)}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">

  <p style="font-size: 16px;">Hey,</p>

  <p style="font-size: 16px;">
    It has been a week since you got the Seller Defense Kit. Hopefully you have had a chance
    to run through the IP Theft Monitoring Checklist. If not, that one is worth 30 minutes of
    your time this week. Most sellers find at least one violation they did not know existed.
  </p>

  <p style="font-size: 16px;">
    The DMCA notice handles the immediate problem. But the harder part is staying ahead of it.
    Copycats come back. New ones find you. The sellers who protect their shops long-term are the
    ones who make monitoring a habit, not a crisis response.
  </p>

  <p style="font-size: 16px;">A few things worth adding to your routine:</p>

  <ul style="font-size: 15px; color: #444; line-height: 1.8;">
    <li>Run a reverse image search on your top 3 product photos every 2 weeks</li>
    <li>Search your most distinctive product title on Etsy monthly</li>
    <li>Check your Etsy shop stats for unexplained traffic drops (often signals a copycat is diverting your search traffic)</li>
  </ul>

  <p style="font-size: 16px;">
    If you found the kit useful, our Facebook community has Etsy sellers sharing takedown
    experiences and tips daily. Come introduce yourself:
    <a href="https://facebook.com/groups/etsysellersipprotection" style="color: #d97706;">
      facebook.com/groups/etsysellersipprotection
    </a>
  </p>

  <p style="font-size: 16px; margin-top: 32px;">
    Jay<br>
    <span style="color: #888;">Seller Defense Kit, a product of The Starter Group</span>
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

  <p style="font-size: 11px; color: #bbb; line-height: 1.6;">
    This email was sent by <strong>Seller Defense Kit, a product of The Starter Group</strong><br>
    2967 Dundas St W, Toronto, ON M6P 1Z2, Canada<br>
    You received this email because you purchased the Seller Defense Kit.<br>
    <a href="${unsubUrl}" style="color: #bbb;">Unsubscribe</a>
  </p>

</body>
</html>`;
}

function build7dText(customerEmail: string): string {
  const unsubUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(customerEmail)}`;
  return `Hey,

It has been a week since you got the Seller Defense Kit. Hopefully you have had a chance to run through the IP Theft Monitoring Checklist. If not, that one is worth 30 minutes of your time this week. Most sellers find at least one violation they did not know existed.

The DMCA notice handles the immediate problem. But the harder part is staying ahead of it. Copycats come back. New ones find you. The sellers who protect their shops long-term are the ones who make monitoring a habit, not a crisis response.

A few things worth adding to your routine:
- Run a reverse image search on your top 3 product photos every 2 weeks
- Search your most distinctive product title on Etsy monthly
- Check your Etsy shop stats for unexplained traffic drops (often signals a copycat is diverting your search traffic)

If you found the kit useful, our Facebook community has Etsy sellers sharing takedown experiences and tips daily. Come introduce yourself: facebook.com/groups/etsysellersipprotection

Jay
Seller Defense Kit, a product of The Starter Group

This email was sent by Seller Defense Kit, a product of The Starter Group
2967 Dundas St W, Toronto, ON M6P 1Z2, Canada
You received this email because you purchased the Seller Defense Kit.
Unsubscribe: ${unsubUrl}`;
}
