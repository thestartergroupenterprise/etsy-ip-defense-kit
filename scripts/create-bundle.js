#!/usr/bin/env node
/**
 * Creates the Seller Defense Kit download bundle.
 * Packages all 5 documents as a ZIP file in public/downloads/
 * 
 * This script converts markdown to clean HTML pages that print to PDF natively
 * (buyers can File > Print > Save as PDF from any browser — no extra software needed)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUILD_DIR = path.join(__dirname, '..');
const DOCS_DIR = path.join(BUILD_DIR, 'documents');
const OUT_DIR = path.join(BUILD_DIR, 'public', 'downloads');
const BUNDLE_TMP = '/tmp/etsy-kit-bundle';

// Ensure output directory exists
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(BUNDLE_TMP, { recursive: true });

// Simple markdown to HTML converter (no deps needed for basic formatting)
function mdToHtml(content, docNumber, title) {
  let html = content
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic  
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    // Checkboxes
    .replace(/^- \[ \] (.+)$/gm, '<li class="checkbox">☐ $1</li>')
    .replace(/^- \[x\] (.+)$/gm, '<li class="checkbox checked">☑ $1</li>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Table rows (simplified)
    .replace(/^\|(.+)\|$/gm, (match, content) => {
      const cells = content.split('|').map(c => c.trim());
      const isHeader = match.includes('---');
      if (isHeader) return '';
      const tag = 'td';
      return '<tr>' + cells.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
    })
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Line breaks to paragraphs
    .split('\n\n')
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('<h') || block.startsWith('<hr') || block.startsWith('<table') || block.startsWith('<tr') || block.startsWith('<ul') || block.startsWith('<ol') || block.startsWith('<blockquote')) return block;
      if (block.startsWith('<li')) return `<ul>${block}</ul>`;
      return `<p>${block}</p>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Seller Defense Kit</title>
  <style>
    @page { margin: 2cm; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.65;
      color: #1a1a1a;
      max-width: 720px;
      margin: 0 auto;
      padding: 20px;
    }
    .kit-header {
      background: #fef3c7;
      border-left: 5px solid #d97706;
      padding: 12px 16px;
      margin-bottom: 24px;
      font-size: 10pt;
      color: #92400e;
    }
    h1 { font-size: 20pt; color: #92400e; border-bottom: 2px solid #f59e0b; padding-bottom: 8px; margin-top: 0; }
    h2 { font-size: 14pt; color: #111; margin-top: 28px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
    h3 { font-size: 12pt; color: #333; margin-top: 20px; }
    p { margin: 10px 0; }
    ul, ol { margin: 10px 0 10px 24px; }
    li { margin: 4px 0; }
    li.checkbox { list-style: none; margin-left: -16px; }
    li.checked { color: #555; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 10pt; }
    th { background: #fef3c7; border: 1px solid #d97706; padding: 8px; text-align: left; font-weight: bold; }
    td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
    tr:nth-child(even) td { background: #fafafa; }
    code { background: #f5f5f5; padding: 2px 5px; border-radius: 3px; font-family: monospace; font-size: 10pt; }
    blockquote { border-left: 4px solid #f59e0b; margin: 16px 0; padding: 8px 16px; background: #fffbeb; color: #555; }
    hr { border: none; border-top: 1px solid #ddd; margin: 24px 0; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; font-size: 9pt; color: #999; font-style: italic; }
    strong { color: #111; }
    a { color: #d97706; }
    @media print {
      body { max-width: 100%; padding: 0; }
      .kit-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

<div class="kit-header">
  <strong>ETSY IP DEFENSE KIT</strong> — Document ${docNumber} of 5 &nbsp;|&nbsp; 
  Professional IP Protection Templates for Etsy Sellers &nbsp;|&nbsp;
  <em>To save as PDF: File → Print → Save as PDF</em>
</div>

${html}

</body>
</html>`;
}

const documents = [
  { file: '01-dmca-takedown-notice.md', num: 1, title: 'DMCA Takedown Notice', outName: '01-DMCA-Takedown-Notice.html' },
  { file: '02-cease-and-desist-letter.md', num: 2, title: 'Cease & Desist Letter', outName: '02-Cease-and-Desist-Letter.html' },
  { file: '03-ip-theft-monitoring-checklist.md', num: 3, title: 'IP Theft Monitoring Checklist', outName: '03-IP-Theft-Monitoring-Checklist.html' },
  { file: '04-multi-platform-filing-guide.md', num: 4, title: 'Multi-Platform Filing Guide', outName: '04-Multi-Platform-Filing-Guide.html' },
  { file: '05-listing-reinstatement-appeal.md', num: 5, title: 'Listing Reinstatement Appeal', outName: '05-Listing-Reinstatement-Appeal.html' },
];

console.log('🔨 Building Seller Defense Kit bundle...\n');

documents.forEach(doc => {
  const mdContent = fs.readFileSync(path.join(DOCS_DIR, doc.file), 'utf8');
  const htmlContent = mdToHtml(mdContent, doc.num, doc.title);
  const outPath = path.join(BUNDLE_TMP, doc.outName);
  fs.writeFileSync(outPath, htmlContent);
  console.log(`  ✅ ${doc.outName}`);
});

// Write README
const readme = `ETSY IP DEFENSE KIT
===================
Thank you for your purchase!

HOW TO USE THESE FILES
These are HTML files that open in any web browser. To convert to PDF:
  1. Open the file in your browser (Chrome, Safari, or Firefox)
  2. Press Ctrl+P (Windows) or Cmd+P (Mac)
  3. Select "Save as PDF" as the printer
  4. Save — you now have a clean PDF

YOUR 5 DOCUMENTS:

1. 01-DMCA-Takedown-Notice.html
   File a legally valid DMCA notice on Etsy, Temu, AliExpress, or the web.
   Calibrated for Etsy's WORKING IP portal (not the broken Help Center link).

2. 02-Cease-and-Desist-Letter.html
   Send directly to the copycat seller for faster removal and a paper trail.

3. 03-IP-Theft-Monitoring-Checklist.html
   Find stolen photos and copied listings across 5 platforms.
   30-minute weekly sweep. Step-by-step.

4. 04-Multi-Platform-Filing-Guide.html
   Step-by-step filing guide for every platform — no more going in circles.
   Etsy, Temu, AliExpress, Amazon — every form field explained.

5. 05-Listing-Reinstatement-Appeal.html
   For when YOUR listing gets suspended after a thief files against you.
   Includes DMCA counter-notice language.

WHERE TO START:
  - Found theft right now? → Start with documents 1 and 4
  - Want to contact the seller? → Also use document 2
  - Your listing was suspended? → Use document 5
  - Want to find theft proactively? → Follow document 3 weekly

QUESTIONS?
Reply to your purchase receipt email — 30-day money-back guarantee, no questions asked.

Not legal advice. For complex disputes, consult a qualified attorney.
`;

fs.writeFileSync(path.join(BUNDLE_TMP, 'README.txt'), readme);
console.log('  ✅ README.txt');

// Create ZIP
const zipPath = path.join(OUT_DIR, 'etsy-ip-defense-kit.zip');
try {
  execSync(`cd ${BUNDLE_TMP} && zip -r "${zipPath}" .`);
  const stats = fs.statSync(zipPath);
  console.log(`\n📦 Bundle created: ${zipPath}`);
  console.log(`   Size: ${(stats.size / 1024).toFixed(1)} KB`);
} catch (e) {
  console.error('ZIP creation failed:', e.message);
  // Fallback: just copy files to public/downloads
  documents.forEach(doc => {
    fs.copyFileSync(
      path.join(BUNDLE_TMP, doc.outName),
      path.join(OUT_DIR, doc.outName)
    );
  });
  console.log('  Fallback: HTML files copied to public/downloads/');
}

// Also keep the HTML files in public/downloads for individual access
documents.forEach(doc => {
  fs.copyFileSync(
    path.join(BUNDLE_TMP, doc.outName),
    path.join(OUT_DIR, doc.outName)
  );
});

// Cleanup
fs.rmSync(BUNDLE_TMP, { recursive: true, force: true });

console.log('\n✅ Build complete!');
console.log('📁 Files in public/downloads/:');
fs.readdirSync(OUT_DIR).forEach(f => console.log('   -', f));
