/**
 * Cold Email Cron
 *
 * Called daily by Vercel Cron (vercel.json).
 * Reads prospect list from Vercel Blob, processes the 3-email sequence,
 * sends via Resend, and updates state.
 *
 * Sequence timing:
 *   Email 1 - sent when prospect is added (addedAt = day 0)
 *   Email 2 - sent 3 days after Email 1
 *   Email 3 - sent 7 days after Email 1
 *
 * Prospect record shape (stored at cold-email/prospects.json in Blob):
 * [
 *   {
 *     shopName: string,
 *     firstName: string,
 *     email: string,
 *     category: "digital-prints"|"art"|"jewelry"|"clothing"|"stationery",
 *     etsy_url: string,
 *     addedAt: ISO string,
 *     status: "active"|"replied"|"unsubscribed"|"bounced",
 *     sent1: boolean, sent1At?: ISO string,
 *     sent2: boolean, sent2At?: ISO string,
 *     sent3: boolean, sent3At?: ISO string,
 *   }
 * ]
 *
 * Required env vars:
 *   RESEND_API_KEY          Resend API key
 *   BLOB_READ_WRITE_TOKEN   Vercel Blob token
 *   CRON_SECRET             Shared secret for Vercel cron auth
 *   FROM_COLD_EMAIL         e.g. hello@sellerdefensekit.com
 */

import { NextRequest, NextResponse } from "next/server";

const DAYS_3 = 3 * 24 * 60 * 60 * 1000;
const DAYS_7 = 7 * 24 * 60 * 60 * 1000;
const SITE_URL  = "https://sellerdefensekit.com";
const FROM_DEFAULT = "hello@sellerdefensekit.com";
const REPLY_TO  = "hello@sellerdefensekit.com";
const SENDER_ID = "Seller Defense Kit, a product of The Starter Group";
const ADDRESS   = "2967 Dundas St W, Toronto, ON M6P 1Z2, Canada";
const PROSPECTS_BLOB = "cold-email/prospects.json";

type Category = "digital-prints" | "art" | "jewelry" | "clothing" | "stationery";

interface Prospect {
  shopName: string;
  firstName: string;
  email: string;
  category: Category;
  etsy_url: string;
  addedAt: string;
  status: "active" | "replied" | "unsubscribed" | "bounced";
  sent1: boolean; sent1At?: string;
  sent2: boolean; sent2At?: string;
  sent3: boolean; sent3At?: string;
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail   = process.env.FROM_COLD_EMAIL || FROM_DEFAULT;

  if (!resendApiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 });
  }

  const { list, put } = await import("@vercel/blob");
  const { Resend } = await import("resend");
  const resend = new Resend(resendApiKey);

  // Load prospect list
  let prospects: Prospect[] = [];
  try {
    const blobs = await list({ prefix: PROSPECTS_BLOB });
    const match = blobs.blobs.find(b => b.pathname === PROSPECTS_BLOB);
    if (match) {
      const res = await fetch(match.url);
      if (res.ok) prospects = await res.json();
    }
  } catch (err) {
    console.error("[cold-email-cron] Failed to load prospects:", err);
    return NextResponse.json({ error: "Failed to load prospect list" }, { status: 500 });
  }

  const now = Date.now();
  const results = { checked: 0, sent1: 0, sent2: 0, sent3: 0, errors: 0, skipped: 0 };
  let dirty = false;

  for (const p of prospects) {
    if (p.status !== "active") { results.skipped++; continue; }
    results.checked++;

    const age = now - new Date(p.addedAt).getTime();

    // Email 1 - send immediately on first run after being added
    if (!p.sent1) {
      const ok = await sendEmail(resend, fromEmail, p, 1);
      if (ok) { p.sent1 = true; p.sent1At = new Date().toISOString(); results.sent1++; dirty = true; }
      else results.errors++;
      continue; // only one email per prospect per day
    }

    // Email 2 - 3 days after Email 1
    if (!p.sent2 && p.sent1At && (now - new Date(p.sent1At).getTime()) >= DAYS_3) {
      const ok = await sendEmail(resend, fromEmail, p, 2);
      if (ok) { p.sent2 = true; p.sent2At = new Date().toISOString(); results.sent2++; dirty = true; }
      else results.errors++;
      continue;
    }

    // Email 3 - 7 days after Email 1
    if (!p.sent3 && p.sent1At && (now - new Date(p.sent1At).getTime()) >= DAYS_7) {
      const ok = await sendEmail(resend, fromEmail, p, 3);
      if (ok) { p.sent3 = true; p.sent3At = new Date().toISOString(); results.sent3++; dirty = true; }
      else results.errors++;
    }
  }

  // Save updated list
  if (dirty) {
    try {
      await put(PROSPECTS_BLOB, JSON.stringify(prospects, null, 2), {
        access: "public",
        addRandomSuffix: false,
      });
    } catch (err) {
      console.error("[cold-email-cron] Failed to save prospect list:", err);
    }
  }

  console.log(`[cold-email-cron] Done. ${JSON.stringify(results)}`);
  return NextResponse.json({ ok: true, ...results });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendEmail(
  resend: any,
  from: string,
  p: Prospect,
  emailNum: 1 | 2 | 3
): Promise<boolean> {
  try {
    const subject  = getSubject(p, emailNum);
    const html     = buildHtml(p, emailNum);
    const text     = buildText(p, emailNum);

    await resend.emails.send({ from, to: p.email, replyTo: REPLY_TO, subject, html, text });
    console.log(`[cold-email-cron] Email ${emailNum} sent to ${p.email} (${p.shopName})`);
    return true;
  } catch (err) {
    console.error(`[cold-email-cron] Email ${emailNum} failed for ${p.email}:`, err);
    return false;
  }
}

// ─── Subject lines ────────────────────────────────────────────────────────────

function getSubject(p: Prospect, num: 1 | 2 | 3): string {
  if (num === 2) return `Re: ${getEmail1Subject(p.category)}`;
  if (num === 3) return "Last note from me";
  return getEmail1Subject(p.category);
}

function getEmail1Subject(cat: Category): string {
  const map: Record<Category, string> = {
    "digital-prints": "One thing most digital print sellers miss",
    "art":            "Something Etsy art sellers often find out the hard way",
    "jewelry":        "One IP issue most Etsy jewelry sellers do not see coming",
    "clothing":       "A heads up for Etsy sellers with original graphics",
    "stationery":     "One thing worth knowing if you sell original planner designs",
  };
  return map[cat];
}

// ─── Email bodies ─────────────────────────────────────────────────────────────

function buildHtml(p: Prospect, num: 1 | 2 | 3): string {
  const unsubUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(p.email)}`;
  const body = getBody(p, num);
  const footer = `
  <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
  <p style="font-size:11px;color:#bbb;line-height:1.6;">
    This email was sent by <strong>${SENDER_ID}</strong><br>
    ${ADDRESS}<br>
    You received this email because your business email is publicly listed and this message relates to your business.<br>
    <a href="${unsubUrl}" style="color:#bbb;">Unsubscribe</a>
  </p>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#111;">
${body}${footer}
</body></html>`;
}

function buildText(p: Prospect, num: 1 | 2 | 3): string {
  const unsubUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(p.email)}`;
  const body = getBodyText(p, num);
  return `${body}

This email was sent by ${SENDER_ID}
${ADDRESS}
You received this email because your business email is publicly listed and this message relates to your business.
Unsubscribe: ${unsubUrl}`;
}

function getBody(p: Prospect, num: 1 | 2 | 3): string {
  const n = p.firstName || "there";
  if (num === 2) return `
  <p style="font-size:16px;">Hi ${n},</p>
  <p style="font-size:16px;">One more thing: I put together a kit specifically for this, 5 fill-in templates for filing takedowns on Etsy, AliExpress, and Temu in under 15 minutes. If it is ever useful: <a href="${SITE_URL}" style="color:#d97706;">${SITE_URL}</a></p>
  <p style="font-size:16px;">Jay<br><span style="color:#888;">${SENDER_ID}</span></p>`;

  if (num === 3) return `
  <p style="font-size:16px;">Hi ${n},</p>
  <p style="font-size:16px;">Last follow-up, I promise.</p>
  <p style="font-size:16px;">If you ever need to file a DMCA and want a template that is pre-formatted for each platform, the kit is at <a href="${SITE_URL}" style="color:#d97706;">${SITE_URL}</a>. It comes with a 30-day money-back guarantee. If it does not help you file your first takedown in 15 minutes, reply for a full refund.</p>
  <p style="font-size:16px;">That is it from me.</p>
  <p style="font-size:16px;">Jay<br><span style="color:#888;">${SENDER_ID}</span></p>`;

  return getEmail1Body(p.category, n);
}

function getBodyText(p: Prospect, num: 1 | 2 | 3): string {
  const n = p.firstName || "there";
  if (num === 2) return `Hi ${n},

One more thing: I put together a kit specifically for this, 5 fill-in templates for filing takedowns on Etsy, AliExpress, and Temu in under 15 minutes. If it is ever useful: ${SITE_URL}

Jay
${SENDER_ID}`;

  if (num === 3) return `Hi ${n},

Last follow-up, I promise.

If you ever need to file a DMCA and want a template that is pre-formatted for each platform, the kit is at ${SITE_URL}. It comes with a 30-day money-back guarantee. If it does not help you file your first takedown in 15 minutes, reply for a full refund.

That is it from me.

Jay
${SENDER_ID}`;

  return getEmail1BodyText(p.category, n);
}

function getEmail1Body(cat: Category, n: string): string {
  const bodies: Record<Category, string> = {
    "digital-prints": `
  <p style="font-size:16px;">Hi ${n},</p>
  <p style="font-size:16px;">I noticed your shop on Etsy and wanted to share something that catches a lot of digital print sellers off guard.</p>
  <p style="font-size:16px;">Digital files are copied differently than physical products. When someone steals a physical design, they have to reproduce it. When they steal a digital print, they just re-upload the exact file. Reverse image search catches it faster than most sellers expect, but only if you know where to look.</p>
  <p style="font-size:16px;">Etsy search results, Pinterest, and Redbubble are the three places your artwork is most likely to appear without your permission. A 10-minute sweep of all three once a month catches the majority of violations before they cost you significant sales.</p>
  <p style="font-size:16px;">Hope that is useful.</p>
  <p style="font-size:16px;">Jay<br><span style="color:#888;">Seller Defense Kit, a product of The Starter Group</span></p>`,

    "art": `
  <p style="font-size:16px;">Hi ${n},</p>
  <p style="font-size:16px;">I came across your shop and wanted to share one thing that tends to catch original art sellers off guard.</p>
  <p style="font-size:16px;">When a copycat steals a physical painting photo, they sometimes submit a DMCA notice claiming the photo is theirs. The platforms see two identical images and do not always know who filed first. The sellers who win those disputes are the ones with dated proof of authorship, whether that is a time-stamped raw file, a work-in-progress photo, or a social post from before the theft.</p>
  <p style="font-size:16px;">If you do not already have a habit of documenting your work as you create it, it is worth starting. Takes seconds and has saved a lot of sellers their listings.</p>
  <p style="font-size:16px;">Hope that helps.</p>
  <p style="font-size:16px;">Jay<br><span style="color:#888;">Seller Defense Kit, a product of The Starter Group</span></p>`,

    "jewelry": `
  <p style="font-size:16px;">Hi ${n},</p>
  <p style="font-size:16px;">I found your shop on Etsy and wanted to flag something that affects a lot of jewelry sellers with original designs.</p>
  <p style="font-size:16px;">AliExpress and Temu are the most common source of jewelry copying right now, and they operate differently from Etsy copycats. The copies usually appear 60 to 90 days after a design picks up traction, and they undercut on price significantly. The filing process on both platforms is different from Etsy's and most sellers do not realize they can file directly until after they have already lost market share.</p>
  <p style="font-size:16px;">Worth knowing before it happens rather than after.</p>
  <p style="font-size:16px;">Jay<br><span style="color:#888;">Seller Defense Kit, a product of The Starter Group</span></p>`,

    "clothing": `
  <p style="font-size:16px;">Hi ${n},</p>
  <p style="font-size:16px;">I found your shop on Etsy and wanted to share something that comes up often for sellers with original graphic designs.</p>
  <p style="font-size:16px;">Print-on-demand platforms are the most common place clothing graphics get copied, and the copies are usually live within days of a design gaining traction. Redbubble and Merch by Amazon are the two highest-volume offenders. Both have DMCA portals, but they each have a specific intake format that generic takedown templates do not match, which is why a lot of valid reports get rejected the first time.</p>
  <p style="font-size:16px;">Knowing the exact format before you need it saves a lot of time when it matters.</p>
  <p style="font-size:16px;">Jay<br><span style="color:#888;">Seller Defense Kit, a product of The Starter Group</span></p>`,

    "stationery": `
  <p style="font-size:16px;">Hi ${n},</p>
  <p style="font-size:16px;">I came across your shop and wanted to share something that catches a lot of stationery and planner sellers off guard.</p>
  <p style="font-size:16px;">PDF templates and digital planner files get redistributed on file-sharing sites more often than most sellers realize. Payhip leaks, Etsy buyers re-uploading to Gumroad, and Pinterest pins linking to unauthorized copies are the three most common patterns. Most sellers only discover them when sales drop unexpectedly.</p>
  <p style="font-size:16px;">A quick Google search for your shop name plus "free download" once a month will catch the majority of cases early.</p>
  <p style="font-size:16px;">Hope that is useful.</p>
  <p style="font-size:16px;">Jay<br><span style="color:#888;">Seller Defense Kit, a product of The Starter Group</span></p>`,
  };
  return bodies[cat];
}

function getEmail1BodyText(cat: Category, n: string): string {
  const bodies: Record<Category, string> = {
    "digital-prints": `Hi ${n},

I noticed your shop on Etsy and wanted to share something that catches a lot of digital print sellers off guard.

Digital files are copied differently than physical products. When someone steals a physical design, they have to reproduce it. When they steal a digital print, they just re-upload the exact file. Reverse image search catches it faster than most sellers expect, but only if you know where to look.

Etsy search results, Pinterest, and Redbubble are the three places your artwork is most likely to appear without your permission. A 10-minute sweep of all three once a month catches the majority of violations before they cost you significant sales.

Hope that is useful.

Jay
Seller Defense Kit, a product of The Starter Group`,

    "art": `Hi ${n},

I came across your shop and wanted to share one thing that tends to catch original art sellers off guard.

When a copycat steals a physical painting photo, they sometimes submit a DMCA notice claiming the photo is theirs. The platforms see two identical images and do not always know who filed first. The sellers who win those disputes are the ones with dated proof of authorship, whether that is a time-stamped raw file, a work-in-progress photo, or a social post from before the theft.

If you do not already have a habit of documenting your work as you create it, it is worth starting. Takes seconds and has saved a lot of sellers their listings.

Hope that helps.

Jay
Seller Defense Kit, a product of The Starter Group`,

    "jewelry": `Hi ${n},

I found your shop on Etsy and wanted to flag something that affects a lot of jewelry sellers with original designs.

AliExpress and Temu are the most common source of jewelry copying right now, and they operate differently from Etsy copycats. The copies usually appear 60 to 90 days after a design picks up traction, and they undercut on price significantly. The filing process on both platforms is different from Etsy's and most sellers do not realize they can file directly until after they have already lost market share.

Worth knowing before it happens rather than after.

Jay
Seller Defense Kit, a product of The Starter Group`,

    "clothing": `Hi ${n},

I found your shop on Etsy and wanted to share something that comes up often for sellers with original graphic designs.

Print-on-demand platforms are the most common place clothing graphics get copied, and the copies are usually live within days of a design gaining traction. Redbubble and Merch by Amazon are the two highest-volume offenders. Both have DMCA portals, but they each have a specific intake format that generic takedown templates do not match, which is why a lot of valid reports get rejected the first time.

Knowing the exact format before you need it saves a lot of time when it matters.

Jay
Seller Defense Kit, a product of The Starter Group`,

    "stationery": `Hi ${n},

I came across your shop and wanted to share something that catches a lot of stationery and planner sellers off guard.

PDF templates and digital planner files get redistributed on file-sharing sites more often than most sellers realize. Payhip leaks, Etsy buyers re-uploading to Gumroad, and Pinterest pins linking to unauthorized copies are the three most common patterns. Most sellers only discover them when sales drop unexpectedly.

A quick Google search for your shop name plus "free download" once a month will catch the majority of cases early.

Hope that is useful.

Jay
Seller Defense Kit, a product of The Starter Group`,
  };
  return bodies[cat];
}
