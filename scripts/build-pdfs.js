#!/usr/bin/env node
/**
 * build-pdfs.js
 * Generates fillable PDF AcroForm documents for Product 1 and Product 2.
 * Run from repo root: node scripts/build-pdfs.js
 *
 * Outputs:
 *   dist/product-1/  -> 5 fillable PDFs
 *   dist/product-2/  -> 6 fillable PDFs
 *
 * Field naming convention: [docN]_[field_slug]
 *   e.g., d1_date, d1_sender_name, d2_brand_name
 *
 * Library: pdf-lib (AcroForm fields, no Chrome required)
 */

'use strict';

const { PDFDocument, rgb, StandardFonts, PDFName, PDFString } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// ── Output directories ──────────────────────────────────────────────────────
const DIST_P1 = path.join(__dirname, '..', 'dist', 'product-1');
const DIST_P2 = path.join(__dirname, '..', 'dist', 'product-2');
fs.mkdirSync(DIST_P1, { recursive: true });
fs.mkdirSync(DIST_P2, { recursive: true });

// ── Brand colors ────────────────────────────────────────────────────────────
const AMBER = rgb(0.855, 0.647, 0.051);   // amber-600 approx
const DARK  = rgb(0.067, 0.067, 0.067);
const GRAY  = rgb(0.45, 0.45, 0.45);
const LIGHT_GRAY = rgb(0.92, 0.92, 0.92);

// ── Layout constants ────────────────────────────────────────────────────────
const PAGE_W = 612; // US Letter pts
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FIELD_H = 22;
const FIELD_BORDER = rgb(0.75, 0.75, 0.75);

// ── Helpers ─────────────────────────────────────────────────────────────────

async function newDoc() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('Seller Defense Kit');
  pdfDoc.setAuthor('The Starter Group');
  pdfDoc.setCreator('sellerdefensekit.com');
  return pdfDoc;
}

function addPage(pdfDoc) {
  return pdfDoc.addPage([PAGE_W, PAGE_H]);
}

/**
 * Draw the header bar on a page.
 * Returns the y-cursor position after the header.
 */
function drawHeader(page, fonts, productLabel, docNum, docTitle) {
  const { bold } = fonts;

  // Amber top bar
  page.drawRectangle({ x: 0, y: PAGE_H - 48, width: PAGE_W, height: 48, color: AMBER });

  // Product label (left)
  page.drawText(productLabel, {
    x: MARGIN,
    y: PAGE_H - 31,
    size: 10,
    font: bold,
    color: rgb(1, 1, 1),
  });

  // sellerdefensekit.com (right)
  page.drawText('sellerdefensekit.com', {
    x: PAGE_W - MARGIN - 110,
    y: PAGE_H - 31,
    size: 9,
    font: bold,
    color: rgb(1, 1, 1),
  });

  // Doc number + title below bar
  const titleY = PAGE_H - 48 - 28;
  page.drawText(`Document ${docNum}`, { x: MARGIN, y: titleY + 14, size: 9, font: bold, color: GRAY });
  page.drawText(docTitle, { x: MARGIN, y: titleY, size: 15, font: bold, color: DARK });

  // Divider
  page.drawLine({ start: { x: MARGIN, y: titleY - 8 }, end: { x: PAGE_W - MARGIN, y: titleY - 8 }, thickness: 0.5, color: LIGHT_GRAY });

  return titleY - 20;
}

/**
 * Draw a labeled text field and return y after the field.
 */
function drawField(page, form, fonts, y, fieldName, label, opts = {}) {
  const { regular, bold } = fonts;
  const { multiline = false, lines = 1, hint = '' } = opts;
  const fh = multiline ? FIELD_H * lines + 4 : FIELD_H;

  if (y - fh - 28 < MARGIN) return null; // signal page overflow

  // Label
  page.drawText(label, { x: MARGIN, y: y - 12, size: 8, font: bold, color: GRAY });

  // AcroForm text field
  const fieldY = y - 16 - fh;
  const field = form.createTextField(fieldName);
  field.setText('');
  if (hint) {
    try { field.setDefaultValue(hint); } catch (_) {}
  }
  field.addToPage(page, {
    x: MARGIN + 2,
    y: fieldY + 2,
    width: CONTENT_W - 4,
    height: fh - 4,
    textColor: DARK,
    backgroundColor: rgb(1, 1, 1),
    borderColor: rgb(0.4, 0.4, 0.4),
    borderWidth: 1,
  });
  field.setFontSize(11);
  if (multiline) field.enableMultiline();

  return fieldY - 10;
}

/**
 * Draw a section heading.
 */
function drawSection(page, fonts, y, text) {
  const { bold } = fonts;
  page.drawRectangle({ x: MARGIN, y: y - 16, width: CONTENT_W, height: 18, color: rgb(0.96, 0.96, 0.96) });
  page.drawText(text, { x: MARGIN + 6, y: y - 10, size: 9, font: bold, color: DARK });
  return y - 26;
}

/**
 * Draw a paragraph of instructional text (word-wrapped).
 */
function drawText(page, fonts, y, text, opts = {}) {
  const { size = 8.5, color = GRAY, maxWidth = CONTENT_W, lineHeight = 13 } = opts;
  const { regular } = fonts;
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    const testW = regular.widthOfTextAtSize(test, size);
    if (testW > maxWidth && line) {
      page.drawText(line, { x: MARGIN, y: curY, size, font: regular, color });
      curY -= lineHeight;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) {
    page.drawText(line, { x: MARGIN, y: curY, size, font: regular, color });
    curY -= lineHeight;
  }
  return curY - 4;
}

function drawFooter(page, fonts, pageNum) {
  const { regular } = fonts;
  page.drawText(`sellerdefensekit.com  |  Page ${pageNum}  |  30-Day Money-Back Guarantee`, {
    x: MARGIN,
    y: 28,
    size: 7.5,
    font: regular,
    color: rgb(0.7, 0.7, 0.7),
  });
  page.drawLine({ start: { x: MARGIN, y: 38 }, end: { x: PAGE_W - MARGIN, y: 38 }, thickness: 0.4, color: LIGHT_GRAY });
}

// ════════════════════════════════════════════════════════════════════════════
// PRODUCT 1, 5 Documents
// ════════════════════════════════════════════════════════════════════════════

async function buildP1Doc1() {
  const pdfDoc = await newDoc();
  const form = pdfDoc.getForm();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonts = { bold, regular };

  // Page 1
  let page = addPage(pdfDoc);
  let y = drawHeader(page, fonts, 'DMCA ENFORCEMENT KIT, Document 1 of 5', '1', 'DMCA Takedown Notice');
  y = drawText(page, fonts, y - 4, 'Fill every field marked below. Remove all bracket text before sending. One notice per infringing listing.', { color: GRAY });
  y -= 6;

  y = drawSection(page, fonts, y, 'SENDER INFORMATION');
  y = drawField(page, form, fonts, y, 'd1_date', 'Date');
  y = drawField(page, form, fonts, y, 'd1_sender_name', 'Your Full Legal Name');
  y = drawField(page, form, fonts, y, 'd1_business_name', 'Business Name (if applicable)');
  y = drawField(page, form, fonts, y, 'd1_address', 'Mailing Address');
  y = drawField(page, form, fonts, y, 'd1_email', 'Email Address');
  y = drawField(page, form, fonts, y, 'd1_phone', 'Phone Number (optional)');

  y = drawSection(page, fonts, y - 4, 'COPYRIGHTED WORK');
  y = drawField(page, form, fonts, y, 'd1_work_type', 'Type of work (e.g., original product photography, graphic design, listing description)');
  y = drawField(page, form, fonts, y, 'd1_work_description', 'Title / Description of your specific work', { multiline: true, lines: 2 });
  y = drawField(page, form, fonts, y, 'd1_original_shop_url', 'Your shop URL');
  y = drawField(page, form, fonts, y, 'd1_original_listing_url', 'Your original listing URL');
  y = drawField(page, form, fonts, y, 'd1_creation_date', 'Date you first created this work');

  y = drawSection(page, fonts, y - 4, 'INFRINGING CONTENT');
  y = drawField(page, form, fonts, y, 'd1_infringing_url_1', 'Full URL of infringing listing');
  y = drawField(page, form, fonts, y, 'd1_infringing_url_2', 'Additional infringing URL (if applicable)');
  y = drawField(page, form, fonts, y, 'd1_infringement_description', 'Describe how it infringes your work', { multiline: true, lines: 3 });

  drawFooter(page, fonts, 1);

  // Page 2, Declarations + signature
  page = addPage(pdfDoc);
  y = PAGE_H - MARGIN - 20;

  y = drawSection(page, fonts, y, 'PLATFORM');
  y = drawField(page, form, fonts, y, 'd1_platform', 'Platform name (e.g., Etsy, Amazon, Temu, AliExpress)');
  y = drawField(page, form, fonts, y, 'd1_dmca_agent', 'DMCA Agent / recipient (see Multi-Platform Filing Guide, Document 4)');

  y = drawSection(page, fonts, y - 4, 'DECLARATIONS');
  y = drawText(page, fonts, y, 'By signing below you declare under penalty of perjury that: (1) the information in this notice is accurate; (2) you are the copyright owner or authorized to act on the owner\'s behalf; (3) you have a good-faith belief the use is not authorized by the copyright owner, its agent, or law.', { size: 8 });
  y -= 8;

  y = drawField(page, form, fonts, y, 'd1_sig_name', 'Printed Name');
  y = drawField(page, form, fonts, y, 'd1_sig_title', 'Title (Owner / Authorized Agent)');
  y = drawField(page, form, fonts, y, 'd1_sig_date', 'Date Signed');

  y = drawSection(page, fonts, y - 8, 'TRACKING LOG (for your records)');
  y = drawField(page, form, fonts, y, 'd1_log_date_filed', 'Date filed');
  y = drawField(page, form, fonts, y, 'd1_log_platform', 'Platform');
  y = drawField(page, form, fonts, y, 'd1_log_case_number', 'Case / Reference number from confirmation email');
  y = drawField(page, form, fonts, y, 'd1_log_status', 'Status');
  y = drawField(page, form, fonts, y, 'd1_log_followup_date', 'Follow-up date (date filed + 7 days)');

  drawFooter(page, fonts, 2);

  form.updateFieldAppearances(fonts.regular);
  const bytes = await pdfDoc.save();
  fs.writeFileSync(path.join(DIST_P1, '01-dmca-takedown-notice.pdf'), bytes);
  console.log('  P1 Doc 1: 01-dmca-takedown-notice.pdf');
}

async function buildP1Doc2() {
  const pdfDoc = await newDoc();
  const form = pdfDoc.getForm();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonts = { bold, regular };

  let page = addPage(pdfDoc);
  let y = drawHeader(page, fonts, 'DMCA ENFORCEMENT KIT, Document 2 of 5', '2', 'Cease and Desist Letter');
  y = drawText(page, fonts, y - 4, 'Send directly to the seller before or after a DMCA notice. Fill all fields. Remove all bracket text before sending.');
  y -= 6;

  y = drawSection(page, fonts, y, 'SENDER');
  y = drawField(page, form, fonts, y, 'd2_date', 'Date');
  y = drawField(page, form, fonts, y, 'd2_sender_name', 'Your Full Name');
  y = drawField(page, form, fonts, y, 'd2_sender_address', 'Your Address');
  y = drawField(page, form, fonts, y, 'd2_sender_email', 'Your Email');

  y = drawSection(page, fonts, y - 4, 'RECIPIENT');
  y = drawField(page, form, fonts, y, 'd2_recipient_name', 'Recipient Name / Shop Name');
  y = drawField(page, form, fonts, y, 'd2_recipient_contact', 'Recipient contact method (shop URL, email if known)');

  y = drawSection(page, fonts, y - 4, 'INFRINGEMENT DETAILS');
  y = drawField(page, form, fonts, y, 'd2_work_description', 'Description of your original work');
  y = drawField(page, form, fonts, y, 'd2_original_url', 'URL of your original work');
  y = drawField(page, form, fonts, y, 'd2_infringing_url', 'URL of infringing listing');
  y = drawField(page, form, fonts, y, 'd2_infringement_description', 'How it infringes your work', { multiline: true, lines: 3 });

  y = drawSection(page, fonts, y - 4, 'DEMAND AND DEADLINE');
  y = drawField(page, form, fonts, y, 'd2_demand', 'What you are demanding (e.g., remove listing, cease use of images, pay licensing fee)');
  y = drawField(page, form, fonts, y, 'd2_deadline_date', 'Response deadline (e.g., 7 days from date of this letter)');
  y = drawField(page, form, fonts, y, 'd2_sig_name', 'Signature / Printed Name');
  y = drawField(page, form, fonts, y, 'd2_sig_date', 'Date Signed');

  drawFooter(page, fonts, 1);

  form.updateFieldAppearances(fonts.regular);
  const bytes = await pdfDoc.save();
  fs.writeFileSync(path.join(DIST_P1, '02-cease-and-desist-letter.pdf'), bytes);
  console.log('  P1 Doc 2: 02-cease-and-desist-letter.pdf');
}

async function buildP1Doc3() {
  const pdfDoc = await newDoc();
  const form = pdfDoc.getForm();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonts = { bold, regular };

  let page = addPage(pdfDoc);
  let y = drawHeader(page, fonts, 'DMCA ENFORCEMENT KIT, Document 3 of 5', '3', 'IP Theft Monitoring Checklist');
  y = drawText(page, fonts, y - 4, 'Run this checklist weekly. Check each platform. Log any suspicious findings below. Use a new copy each week.');
  y -= 6;

  y = drawSection(page, fonts, y, 'SESSION INFO');
  y = drawField(page, form, fonts, y, 'd3_check_date', 'Date of this check');
  y = drawField(page, form, fonts, y, 'd3_brand_name', 'Your brand / shop name');
  y = drawField(page, form, fonts, y, 'd3_keywords', 'Keywords you searched (your product names, titles, descriptions)');

  y = drawSection(page, fonts, y - 4, 'ETSY');
  y = drawField(page, form, fonts, y, 'd3_etsy_status', 'Clear / Suspicious (describe)');
  y = drawField(page, form, fonts, y, 'd3_etsy_urls', 'Suspicious URLs found (if any)');

  y = drawSection(page, fonts, y - 4, 'AMAZON');
  y = drawField(page, form, fonts, y, 'd3_amazon_status', 'Clear / Suspicious (describe)');
  y = drawField(page, form, fonts, y, 'd3_amazon_urls', 'Suspicious URLs found (if any)');

  y = drawSection(page, fonts, y - 4, 'TEMU / ALIEXPRESS');
  y = drawField(page, form, fonts, y, 'd3_temu_status', 'Clear / Suspicious (describe)');
  y = drawField(page, form, fonts, y, 'd3_temu_urls', 'Suspicious URLs found (if any)');

  y = drawSection(page, fonts, y - 4, 'IMAGE SEARCH (Google / TinEye)');
  y = drawField(page, form, fonts, y, 'd3_image_status', 'Clear / Suspicious (describe)');
  y = drawField(page, form, fonts, y, 'd3_image_urls', 'Infringing image locations (if any)');

  y = drawSection(page, fonts, y - 4, 'SOCIAL MEDIA / OTHER');
  y = drawField(page, form, fonts, y, 'd3_social_status', 'Clear / Suspicious (describe)');
  y = drawField(page, form, fonts, y, 'd3_social_notes', 'Notes');

  y = drawSection(page, fonts, y - 4, 'ACTION TAKEN');
  y = drawField(page, form, fonts, y, 'd3_action', 'Action taken this session (e.g., DMCA filed, C&D sent, monitored only)', { multiline: true, lines: 2 });

  drawFooter(page, fonts, 1);

  form.updateFieldAppearances(fonts.regular);
  const bytes = await pdfDoc.save();
  fs.writeFileSync(path.join(DIST_P1, '03-ip-theft-monitoring-checklist.pdf'), bytes);
  console.log('  P1 Doc 3: 03-ip-theft-monitoring-checklist.pdf');
}

async function buildP1Doc4() {
  const pdfDoc = await newDoc();
  const form = pdfDoc.getForm();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonts = { bold, regular };

  let page = addPage(pdfDoc);
  let y = drawHeader(page, fonts, 'DMCA ENFORCEMENT KIT, Document 4 of 5', '4', 'Multi-Platform Filing Guide');
  y = drawText(page, fonts, y - 4, 'Reference guide for filing DMCA and IP reports on each platform. Use with your completed Document 1 notice. No fillable fields required, this is a reference document. Print or save as-is.');
  y -= 8;

  const platforms = [
    ['ETSY', 'forms.etsy.com/legal/copyright (live portal). Submit via Help Center "Report IP Infringement". Response: 24-72 hours. Case number provided via email. Follow up at 7 days if no response.'],
    ['AMAZON', 'Report Infringement tool at amazon.com/report/infringement. Requires Brand Registry for fastest response. Non-registered: submit through standard IP claim form. Response: 2-5 business days.'],
    ['TEMU', 'IP Protection Portal at temu.com/ip-report. Submit with your copyright registration or proof of original creation. Response: 3-7 business days.'],
    ['ALIEXPRESS', 'Intellectual Property Protection at IPP.aliexpress.com. Create an account, submit evidence package. Response: 3-7 business days. Escalate to AliExpress IP dispute team if rejected.'],
    ['STANDALONE WEBSITES', 'File with the hosting provider. Look up host at whois.domaintools.com. Send notice to abuse@[hostingprovider].com with DMCA notice as attachment. If host ignores: escalate to domain registrar.'],
    ['SHOPIFY STORES', 'Report via legal.shopify.com/report-ip or submit to Shopify Legal via email: legal@shopify.com. Reference the Shopify Terms of Service section 14.'],
  ];

  for (const [platform, instructions] of platforms) {
    if (y < MARGIN + 80) {
      drawFooter(page, fonts, pdfDoc.getPageCount());
      page = addPage(pdfDoc);
      y = PAGE_H - MARGIN - 20;
    }
    y = drawSection(page, fonts, y, platform);
    y = drawText(page, fonts, y, instructions, { size: 8.5, color: DARK });
    y -= 6;

    // Tracking field for this platform
    y = drawField(page, form, fonts, y, `d4_${platform.toLowerCase().replace(/[^a-z]/g,'_')}_filed`, `Date filed on ${platform} / Case number`);
    y -= 4;
  }

  drawFooter(page, fonts, pdfDoc.getPageCount());

  form.updateFieldAppearances(fonts.regular);
  const bytes = await pdfDoc.save();
  fs.writeFileSync(path.join(DIST_P1, '04-multi-platform-filing-guide.pdf'), bytes);
  console.log('  P1 Doc 4: 04-multi-platform-filing-guide.pdf');
}

async function buildP1Doc5() {
  const pdfDoc = await newDoc();
  const form = pdfDoc.getForm();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonts = { bold, regular };

  let page = addPage(pdfDoc);
  let y = drawHeader(page, fonts, 'DMCA ENFORCEMENT KIT, Document 5 of 5', '5', 'Listing Reinstatement Appeal');
  y = drawText(page, fonts, y - 4, 'Use when your own listing was suspended after a false or mistaken DMCA counter-claim. Fill all fields. Remove all bracket text before submitting.');
  y -= 6;

  y = drawSection(page, fonts, y, 'YOUR INFORMATION');
  y = drawField(page, form, fonts, y, 'd5_date', 'Date');
  y = drawField(page, form, fonts, y, 'd5_name', 'Your Full Legal Name');
  y = drawField(page, form, fonts, y, 'd5_shop_name', 'Your Shop Name');
  y = drawField(page, form, fonts, y, 'd5_email', 'Email on your seller account');
  y = drawField(page, form, fonts, y, 'd5_address', 'Your Address');

  y = drawSection(page, fonts, y - 4, 'SUSPENDED LISTING');
  y = drawField(page, form, fonts, y, 'd5_listing_url', 'Suspended listing URL');
  y = drawField(page, form, fonts, y, 'd5_suspension_date', 'Date suspended');
  y = drawField(page, form, fonts, y, 'd5_suspension_reason', 'Reason given by platform (copy from their notice)');
  y = drawField(page, form, fonts, y, 'd5_case_number', 'Platform case / reference number');

  y = drawSection(page, fonts, y - 4, 'YOUR APPEAL');
  y = drawField(page, form, fonts, y, 'd5_original_work_proof', 'Proof of original creation (describe your evidence: dates, files, receipts)');
  y = drawField(page, form, fonts, y, 'd5_appeal_statement', 'Appeal statement (explain why the claim is incorrect)', { multiline: true, lines: 4 });
  y = drawField(page, form, fonts, y, 'd5_claimant_name', 'Name of claimant who filed against you (if known)');

  y = drawSection(page, fonts, y - 4, 'DECLARATION');
  y = drawText(page, fonts, y, 'I declare under penalty of perjury that I have a good-faith belief the material was removed or disabled as a result of a mistake or misidentification of the material to be removed or disabled.');
  y -= 4;
  y = drawField(page, form, fonts, y, 'd5_sig_name', 'Printed Name');
  y = drawField(page, form, fonts, y, 'd5_sig_date', 'Date Signed');

  drawFooter(page, fonts, 1);

  form.updateFieldAppearances(fonts.regular);
  const bytes = await pdfDoc.save();
  fs.writeFileSync(path.join(DIST_P1, '05-listing-reinstatement-appeal.pdf'), bytes);
  console.log('  P1 Doc 5: 05-listing-reinstatement-appeal.pdf');
}

// ════════════════════════════════════════════════════════════════════════════
// PRODUCT 2, 6 Documents
// ════════════════════════════════════════════════════════════════════════════

async function buildP2Doc1() {
  const pdfDoc = await newDoc();
  const form = pdfDoc.getForm();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonts = { bold, regular };

  let page = addPage(pdfDoc);
  let y = drawHeader(page, fonts, 'TRADEMARK PROTECTION KIT, Document 1 of 6', '1', 'Brand Rights Documentation Log');
  y = drawText(page, fonts, y - 4, 'Fill Section 1 today. Update Section 2 each time you add a platform, product, or brand element. This log establishes your common law trademark rights through documented first use.');
  y -= 6;

  y = drawSection(page, fonts, y, 'SECTION 1: BRAND IDENTITY');
  y = drawField(page, form, fonts, y, 'p2d1_brand_name', 'Your brand name (as used in commerce)');
  y = drawField(page, form, fonts, y, 'p2d1_owner_name', 'Legal owner name (person or registered business)');
  y = drawField(page, form, fonts, y, 'p2d1_first_use_date', 'Date you first used this brand name commercially');
  y = drawField(page, form, fonts, y, 'p2d1_first_use_description', 'Describe first commercial use (e.g., first Etsy sale, first order shipped)', { multiline: true, lines: 2 });
  y = drawField(page, form, fonts, y, 'p2d1_product_category', 'Products / services sold under this brand');
  y = drawField(page, form, fonts, y, 'p2d1_logo_description', 'Logo description (if applicable)');

  y = drawSection(page, fonts, y - 4, 'SECTION 2: PLATFORM PRESENCE LOG');
  y = drawText(page, fonts, y, 'Add one row per platform. Keep file backups (screenshots, receipts) labeled brand-log-[platform]-[date].');
  y -= 4;

  const platforms2 = ['Etsy', 'Amazon', 'Shopify / own website', 'TikTok Shop', 'Instagram', 'Other platform 1', 'Other platform 2'];
  for (const [i, plat] of platforms2.entries()) {
    if (y < MARGIN + 60) {
      drawFooter(page, fonts, pdfDoc.getPageCount());
      page = addPage(pdfDoc);
      y = PAGE_H - MARGIN - 20;
    }
    const slug = plat.toLowerCase().replace(/[^a-z0-9]/g, '_');
    y = drawField(page, form, fonts, y, `p2d1_platform_${slug}_date`, `${plat} : date first listed`);
    y = drawField(page, form, fonts, y, `p2d1_platform_${slug}_url`, `${plat}, shop/profile URL`);
    y -= 2;
  }

  y = drawSection(page, fonts, y - 4, 'SECTION 3: TRADEMARK SEARCH HISTORY');
  y = drawField(page, form, fonts, y, 'p2d1_search_date', 'Date of most recent USPTO TESS search');
  y = drawField(page, form, fonts, y, 'p2d1_search_result', 'Search result summary (conflicts found, or clear)');
  y = drawField(page, form, fonts, y, 'p2d1_registration_status', 'USPTO registration status (Not filed / Application pending / Registered, Registration No.)');

  drawFooter(page, fonts, pdfDoc.getPageCount());

  form.updateFieldAppearances(fonts.regular);
  const bytes = await pdfDoc.save();
  fs.writeFileSync(path.join(DIST_P2, '01-brand-rights-documentation-log.pdf'), bytes);
  console.log('  P2 Doc 1: 01-brand-rights-documentation-log.pdf');
}

async function buildP2Doc2() {
  const pdfDoc = await newDoc();
  const form = pdfDoc.getForm();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonts = { bold, regular };

  let page = addPage(pdfDoc);
  let y = drawHeader(page, fonts, 'TRADEMARK PROTECTION KIT, Document 2 of 6', '2', 'Trademark Search and Clearance Checklist');
  y = drawText(page, fonts, y - 4, 'Complete before claiming a new brand name or filing a USPTO application. One checklist per brand name you are evaluating.');
  y -= 6;

  y = drawSection(page, fonts, y, 'BRAND NAME BEING EVALUATED');
  y = drawField(page, form, fonts, y, 'p2d2_brand_name', 'Brand name (exact)');
  y = drawField(page, form, fonts, y, 'p2d2_variations', 'Common misspellings / phonetic variations to also search');
  y = drawField(page, form, fonts, y, 'p2d2_date', 'Date of this search');

  y = drawSection(page, fonts, y - 4, 'USPTO TESS SEARCH (tess.uspto.gov)');
  y = drawField(page, form, fonts, y, 'p2d2_tess_exact', 'Exact match search result');
  y = drawField(page, form, fonts, y, 'p2d2_tess_similar', 'Similar / phonetic match results');
  y = drawField(page, form, fonts, y, 'p2d2_tess_class', 'International class(es) relevant to your products');
  y = drawField(page, form, fonts, y, 'p2d2_tess_conflicts', 'Conflicts found (describe or "None found")');

  y = drawSection(page, fonts, y - 4, 'STATE TRADEMARK SEARCH');
  y = drawField(page, form, fonts, y, 'p2d2_state', 'State searched');
  y = drawField(page, form, fonts, y, 'p2d2_state_result', 'State search result');

  y = drawSection(page, fonts, y - 4, 'COMMON LAW SEARCH (web, social, marketplaces)');
  y = drawField(page, form, fonts, y, 'p2d2_google_result', 'Google search result for this brand name');
  y = drawField(page, form, fonts, y, 'p2d2_etsy_result', 'Etsy / Amazon search result');
  y = drawField(page, form, fonts, y, 'p2d2_domain_result', 'Domain availability (.com, .co)');
  y = drawField(page, form, fonts, y, 'p2d2_social_result', 'Social media handle availability');

  y = drawSection(page, fonts, y - 4, 'CLEARANCE DECISION');
  y = drawField(page, form, fonts, y, 'p2d2_conflicts_summary', 'Summary of any conflicts found');
  y = drawField(page, form, fonts, y, 'p2d2_clearance_decision', 'Decision: CLEAR TO USE / CONFLICTS FOUND / NEEDS ATTORNEY REVIEW');
  y = drawField(page, form, fonts, y, 'p2d2_rationale', 'Rationale for decision', { multiline: true, lines: 2 });

  drawFooter(page, fonts, 1);

  form.updateFieldAppearances(fonts.regular);
  const bytes = await pdfDoc.save();
  fs.writeFileSync(path.join(DIST_P2, '02-trademark-search-clearance-checklist.pdf'), bytes);
  console.log('  P2 Doc 2: 02-trademark-search-clearance-checklist.pdf');
}

async function buildP2Doc3() {
  const pdfDoc = await newDoc();
  const form = pdfDoc.getForm();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonts = { bold, regular };

  let page = addPage(pdfDoc);
  let y = drawHeader(page, fonts, 'TRADEMARK PROTECTION KIT, Document 3 of 6', '3', 'Marketplace Brand Violation Report Template');
  y = drawText(page, fonts, y - 4, 'Use when someone else is using your brand name on a marketplace. One report per violation. Remove all bracket text before submitting.');
  y -= 6;

  y = drawSection(page, fonts, y, 'YOUR INFORMATION');
  y = drawField(page, form, fonts, y, 'p2d3_date', 'Date');
  y = drawField(page, form, fonts, y, 'p2d3_legal_name', 'Your full legal name or registered business name');
  y = drawField(page, form, fonts, y, 'p2d3_brand_name', 'Your brand name');
  y = drawField(page, form, fonts, y, 'p2d3_first_use_date', 'Date you first used this brand name commercially');
  y = drawField(page, form, fonts, y, 'p2d3_products', 'Products / services sold under this brand');
  y = drawField(page, form, fonts, y, 'p2d3_registration', 'USPTO registration number (if registered, or "Not yet registered")');
  y = drawField(page, form, fonts, y, 'p2d3_contact_email', 'Your contact email');
  y = drawField(page, form, fonts, y, 'p2d3_address', 'Your address (City, State/Province, Country)');

  y = drawSection(page, fonts, y - 4, 'VIOLATION DETAILS');
  y = drawField(page, form, fonts, y, 'p2d3_platform', 'Platform (Etsy / Amazon / Temu / AliExpress / Other)');
  y = drawField(page, form, fonts, y, 'p2d3_infringing_url_1', 'Infringing listing / seller URL 1');
  y = drawField(page, form, fonts, y, 'p2d3_infringing_url_2', 'Additional infringing URL (if applicable)');
  y = drawField(page, form, fonts, y, 'p2d3_violation_description', 'Describe how the violation infringes your brand', { multiline: true, lines: 3 });
  y = drawField(page, form, fonts, y, 'p2d3_marketplace', 'Geographic market affected (e.g., United States, Canada, EU)');

  y = drawSection(page, fonts, y - 4, 'DEMAND');
  y = drawField(page, form, fonts, y, 'p2d3_demand', 'What you are requesting (e.g., remove listing, revoke seller account, remove brand name from listing)');
  y = drawField(page, form, fonts, y, 'p2d3_deadline', 'Response deadline');

  y = drawSection(page, fonts, y - 4, 'DECLARATION AND SIGNATURE');
  y = drawField(page, form, fonts, y, 'p2d3_sig_name', 'Printed Name');
  y = drawField(page, form, fonts, y, 'p2d3_sig_date', 'Date Signed');

  drawFooter(page, fonts, pdfDoc.getPageCount());

  form.updateFieldAppearances(fonts.regular);
  const bytes = await pdfDoc.save();
  fs.writeFileSync(path.join(DIST_P2, '03-marketplace-brand-violation-report-template.pdf'), bytes);
  console.log('  P2 Doc 3: 03-marketplace-brand-violation-report-template.pdf');
}

async function buildP2Doc4() {
  const pdfDoc = await newDoc();
  const form = pdfDoc.getForm();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonts = { bold, regular };

  let page = addPage(pdfDoc);
  let y = drawHeader(page, fonts, 'TRADEMARK PROTECTION KIT, Document 4 of 6', '4', 'Trademark Monitoring Workflow');
  y = drawText(page, fonts, y - 4, 'Run the weekly sweep every 7 days. Run the monthly deep scan on the 1st of each month. Log findings in Document 5.');
  y -= 6;

  y = drawSection(page, fonts, y, 'YOUR BRAND');
  y = drawField(page, form, fonts, y, 'p2d4_brand_name', 'Brand name to monitor');
  y = drawField(page, form, fonts, y, 'p2d4_handle', 'Social media handle(s)');
  y = drawField(page, form, fonts, y, 'p2d4_domain', 'Primary domain');

  y = drawSection(page, fonts, y - 4, 'WEEKLY SWEEP (20 minutes, log date and findings)');
  const weeklyChecks = [
    ['Etsy seller search', 'p2d4_w_etsy'],
    ['Amazon brand search', 'p2d4_w_amazon'],
    ['Google brand + "fake" or "replica"', 'p2d4_w_google'],
    ['Instagram / TikTok handle search', 'p2d4_w_social'],
    ['Temu / AliExpress product search', 'p2d4_w_temu'],
  ];
  for (const [label, fieldName] of weeklyChecks) {
    y = drawField(page, form, fonts, y, fieldName, `${label}, date + result (Clear / Suspicious: describe)`);
  }

  y = drawSection(page, fonts, y - 4, 'MONTHLY DEEP SCAN (1st of each month, log date and findings)');
  const monthlyChecks = [
    ['USPTO TESS new filings search', 'p2d4_m_tess'],
    ['Domain registration check (similar domains)', 'p2d4_m_domains'],
    ['Google Image reverse search on hero product photos', 'p2d4_m_images'],
    ['Facebook / Pinterest brand mention search', 'p2d4_m_facebook'],
    ['New seller review search (review mentions of your brand)', 'p2d4_m_reviews'],
  ];
  for (const [label, fieldName] of monthlyChecks) {
    y = drawField(page, form, fonts, y, fieldName, `${label}, date + result`);
  }

  y = drawSection(page, fonts, y - 4, 'ACTION LOG');
  y = drawField(page, form, fonts, y, 'p2d4_action_taken', 'Action taken this cycle (Document 3 filed / Document 5 updated / No action needed)', { multiline: true, lines: 2 });

  drawFooter(page, fonts, 1);

  form.updateFieldAppearances(fonts.regular);
  const bytes = await pdfDoc.save();
  fs.writeFileSync(path.join(DIST_P2, '04-trademark-monitoring-workflow.pdf'), bytes);
  console.log('  P2 Doc 4: 04-trademark-monitoring-workflow.pdf');
}

async function buildP2Doc5() {
  const pdfDoc = await newDoc();
  const form = pdfDoc.getForm();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonts = { bold, regular };

  let page = addPage(pdfDoc);
  let y = drawHeader(page, fonts, 'TRADEMARK PROTECTION KIT, Document 5 of 6', '5', 'Brand Identity Infringement Evidence Log');
  y = drawText(page, fonts, y - 4, 'Open a new log entry the moment you find possible infringement. Complete immediately while evidence is fresh. One entry per incident.');
  y -= 6;

  y = drawSection(page, fonts, y, 'INCIDENT IDENTIFICATION');
  y = drawField(page, form, fonts, y, 'p2d5_incident_id', 'Incident ID (e.g., INC-001, INC-002)');
  y = drawField(page, form, fonts, y, 'p2d5_date_discovered', 'Date discovered (date and time)');
  y = drawField(page, form, fonts, y, 'p2d5_brand_name', 'Your brand name affected');
  y = drawField(page, form, fonts, y, 'p2d5_platform', 'Platform where found');

  y = drawSection(page, fonts, y - 4, 'INFRINGING CONTENT');
  y = drawField(page, form, fonts, y, 'p2d5_infringing_url', 'Full URL of infringing listing or profile');
  y = drawField(page, form, fonts, y, 'p2d5_listing_title', 'Listing title (copy exact text)');
  y = drawField(page, form, fonts, y, 'p2d5_seller_name', 'Infringing seller / shop name');
  y = drawField(page, form, fonts, y, 'p2d5_seller_location', 'Seller location (Country / State if visible)');
  y = drawField(page, form, fonts, y, 'p2d5_description', 'Describe the infringement in detail', { multiline: true, lines: 3 });

  y = drawSection(page, fonts, y - 4, 'EVIDENCE CAPTURED');
  y = drawField(page, form, fonts, y, 'p2d5_screenshots', 'Screenshots saved (filenames and storage location)');
  y = drawField(page, form, fonts, y, 'p2d5_screenshot_date', 'Date screenshots taken');
  y = drawField(page, form, fonts, y, 'p2d5_additional_evidence', 'Additional evidence (customer reports, review screenshots, etc.)');

  y = drawSection(page, fonts, y - 4, 'BUSINESS IMPACT');
  y = drawField(page, form, fonts, y, 'p2d5_customer_confusion', 'Customer confusion documented (if any)');
  y = drawField(page, form, fonts, y, 'p2d5_search_impact', 'Impact on search rankings (if any)');
  y = drawField(page, form, fonts, y, 'p2d5_revenue_impact', 'Estimated revenue impact (if quantifiable)');

  y = drawSection(page, fonts, y - 4, 'RESPONSE AND STATUS');
  y = drawField(page, form, fonts, y, 'p2d5_action_taken', 'Action taken (Doc 3 filed, cease and desist sent, platform report, etc.)');
  y = drawField(page, form, fonts, y, 'p2d5_action_date', 'Date action taken');
  y = drawField(page, form, fonts, y, 'p2d5_current_status', 'Current status of this incident');
  y = drawField(page, form, fonts, y, 'p2d5_resolution_date', 'Resolution date (or ongoing)');

  drawFooter(page, fonts, pdfDoc.getPageCount());

  form.updateFieldAppearances(fonts.regular);
  const bytes = await pdfDoc.save();
  fs.writeFileSync(path.join(DIST_P2, '05-brand-identity-infringement-evidence-log.pdf'), bytes);
  console.log('  P2 Doc 5: 05-brand-identity-infringement-evidence-log.pdf');
}

async function buildP2Doc6() {
  const pdfDoc = await newDoc();
  const form = pdfDoc.getForm();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonts = { bold, regular };

  let page = addPage(pdfDoc);
  let y = drawHeader(page, fonts, 'TRADEMARK PROTECTION KIT, Document 6 of 6', '6', 'Trademark Registration Readiness Checklist');
  y = drawText(page, fonts, y - 4, 'Complete before filing a USPTO trademark application. This checklist reduces errors and attorney time if you choose to engage one. USPTO TEAS filing fee: $250-$350 per class.');
  y -= 6;

  y = drawSection(page, fonts, y, 'APPLICANT INFORMATION');
  y = drawField(page, form, fonts, y, 'p2d6_applicant_name', 'Full legal name or registered business name');
  y = drawField(page, form, fonts, y, 'p2d6_address', 'Mailing address (Street, City, State, ZIP)');
  y = drawField(page, form, fonts, y, 'p2d6_country', 'Country');
  y = drawField(page, form, fonts, y, 'p2d6_email', 'Email address for USPTO correspondence');
  y = drawField(page, form, fonts, y, 'p2d6_entity_type', 'Entity type (Individual / LLC / Corporation / Partnership)');

  y = drawSection(page, fonts, y - 4, 'MARK DETAILS');
  y = drawField(page, form, fonts, y, 'p2d6_mark', 'Exact mark as you will file it');
  y = drawField(page, form, fonts, y, 'p2d6_mark_description', 'Mark description (for design marks: describe colors, elements, stylization)');
  y = drawField(page, form, fonts, y, 'p2d6_mark_type', 'Mark type (Word mark / Design mark / Combined)');

  y = drawSection(page, fonts, y - 4, 'GOODS AND SERVICES');
  y = drawField(page, form, fonts, y, 'p2d6_class_number', 'International Class number(s)');
  y = drawField(page, form, fonts, y, 'p2d6_goods_description', 'Exact goods / services description (use USPTO ID Manual language)', { multiline: true, lines: 2 });

  y = drawSection(page, fonts, y - 4, 'USE IN COMMERCE');
  y = drawField(page, form, fonts, y, 'p2d6_first_use_date', 'Date of first use in commerce (anywhere)');
  y = drawField(page, form, fonts, y, 'p2d6_first_use_interstate', 'Date of first use in interstate commerce (crossing state lines)');
  y = drawField(page, form, fonts, y, 'p2d6_specimen_description', 'Specimen description (what you will submit as proof of use)', { multiline: true, lines: 2 });

  y = drawSection(page, fonts, y - 4, 'FILING READINESS');
  y = drawField(page, form, fonts, y, 'p2d6_tess_clear', 'USPTO TESS search completed and clear (Yes / No / Conflicts found)');
  y = drawField(page, form, fonts, y, 'p2d6_doc1_complete', 'Document 1 (Brand Rights Log) completed (Yes / No)');
  y = drawField(page, form, fonts, y, 'p2d6_doc2_complete', 'Document 2 (Search Checklist) completed and cleared (Yes / No)');
  y = drawField(page, form, fonts, y, 'p2d6_filing_method', 'Filing method (TEAS Plus / TEAS Standard / Attorney-assisted)');
  y = drawField(page, form, fonts, y, 'p2d6_fee', 'Filing fee confirmed');
  y = drawField(page, form, fonts, y, 'p2d6_filing_date', 'Target filing date');

  y = drawSection(page, fonts, y - 4, 'POST-FILING TRACKING');
  y = drawField(page, form, fonts, y, 'p2d6_serial_number', 'USPTO serial number (assigned after filing)');
  y = drawField(page, form, fonts, y, 'p2d6_filing_receipt_date', 'Filing receipt date');
  y = drawField(page, form, fonts, y, 'p2d6_office_action_due', 'Response deadline (if Office Action received)');
  y = drawField(page, form, fonts, y, 'p2d6_registration_number', 'Registration number (assigned when registered)');

  drawFooter(page, fonts, pdfDoc.getPageCount());

  form.updateFieldAppearances(fonts.regular);
  const bytes = await pdfDoc.save();
  fs.writeFileSync(path.join(DIST_P2, '06-trademark-registration-readiness-checklist.pdf'), bytes);
  console.log('  P2 Doc 6: 06-trademark-registration-readiness-checklist.pdf');
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Building fillable PDFs...');
  console.log('');
  console.log('PRODUCT 1, DMCA Enforcement Kit:');
  await buildP1Doc1();
  await buildP1Doc2();
  await buildP1Doc3();
  await buildP1Doc4();
  await buildP1Doc5();
  console.log('');
  console.log('PRODUCT 2, Trademark Protection Kit:');
  await buildP2Doc1();
  await buildP2Doc2();
  await buildP2Doc3();
  await buildP2Doc4();
  await buildP2Doc5();
  await buildP2Doc6();
  console.log('');
  console.log('All 11 PDFs generated successfully.');
  console.log('Output: dist/product-1/ and dist/product-2/');
}

main().catch(err => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
