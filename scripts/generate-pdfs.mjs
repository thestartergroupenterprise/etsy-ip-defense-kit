/**
 * scripts/generate-pdfs.mjs
 * Converts all 5 HTML documents to PDF using system Chromium,
 * then packages them + README into a fresh etsy-ip-defense-kit.zip.
 *
 * Run: node scripts/generate-pdfs.mjs
 * Requires: chromium installed at /usr/bin/chromium
 */

import puppeteer from "puppeteer-core";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { createWriteStream } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "public", "downloads");
const OUT = path.join(ROOT, "_files");

const DOCS = [
  "01-DMCA-Takedown-Notice.html",
  "02-Cease-and-Desist-Letter.html",
  "03-IP-Theft-Monitoring-Checklist.html",
  "04-Multi-Platform-Filing-Guide.html",
  "05-Listing-Reinstatement-Appeal.html",
];

const README = "README.txt";
const ZIP_NAME = "etsy-ip-defense-kit.zip";

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

console.log("🚀 Launching Chromium...");
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  headless: true,
});

const page = await browser.newPage();
const pdfPaths = [];

for (const doc of DOCS) {
  const htmlPath = path.join(SRC, doc);
  const pdfName = doc.replace(".html", ".pdf");
  const pdfPath = path.join(OUT, pdfName);

  console.log(`  Converting ${doc} → ${pdfName}`);
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
  await page.pdf({
    path: pdfPath,
    format: "Letter",
    printBackground: true,
    margin: { top: "2cm", bottom: "2cm", left: "2cm", right: "2cm" },
  });
  pdfPaths.push({ name: pdfName, path: pdfPath });
}

await browser.close();
console.log("✓ All PDFs generated");

// Package into ZIP using JSZip (pure JS, no system dependency)
const require = createRequire(import.meta.url);

// Dynamic import of archiver
const archiver = (await import("archiver")).default;
const zipPath = path.join(OUT, ZIP_NAME);
const output = createWriteStream(zipPath);

await new Promise((resolve, reject) => {
  const archive = archiver("zip", { zlib: { level: 9 } });
  output.on("close", resolve);
  archive.on("error", reject);
  archive.pipe(output);

  // Add README
  const readmeSrc = path.join(SRC, README);
  archive.file(readmeSrc, { name: README });

  // Add PDFs
  for (const { name, path: p } of pdfPaths) {
    archive.file(p, { name });
  }

  archive.finalize();
});

const zipSize = Math.round(readFileSync(zipPath).length / 1024);
console.log(`✓ ZIP created: ${ZIP_NAME} (${zipSize}KB)`);
console.log(`  → ${zipPath}`);
