/**
 * scripts/upload-blob.mjs
 * Uploads etsy-ip-defense-kit.zip to Vercel Blob Storage.
 * Run: BLOB_READ_WRITE_TOKEN=vercel_blob_rw_... node scripts/upload-blob.mjs
 */

import { put } from "@vercel/blob";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ZIP_PATH = path.join(__dirname, "..", "_files", "etsy-ip-defense-kit.zip");

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error("Missing BLOB_READ_WRITE_TOKEN");
  process.exit(1);
}

console.log("📤 Uploading etsy-ip-defense-kit.zip to Vercel Blob...");
const zip = readFileSync(ZIP_PATH);

const result = await put("products/etsy-ip-defense-kit/etsy-ip-defense-kit.zip", zip, {
  access: "public",
  token,
  contentType: "application/zip",
  addRandomSuffix: false,
});

console.log("✓ Uploaded!");
console.log("  URL:", result.url);
console.log("  Size:", Math.round(zip.length / 1024) + "KB");
