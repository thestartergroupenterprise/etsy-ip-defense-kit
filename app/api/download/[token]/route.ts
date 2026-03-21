/**
 * Private Download Route
 * Serves the ZIP bundle at a secret URL path.
 * URL format: /api/download/[DOWNLOAD_SECRET_PATH]
 *
 * The token in the URL is compared to the DOWNLOAD_SECRET_PATH env variable.
 * If it matches, the ZIP is served. If not, 404.
 *
 * The ZIP file must be placed at: /public/downloads/etsy-ip-defense-kit.zip
 */

import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const secretPath = process.env.DOWNLOAD_SECRET_PATH;

  if (!secretPath) {
    return NextResponse.json({ error: "Download not configured" }, { status: 500 });
  }

  if (token !== secretPath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If ?file=1 is present, serve the raw ZIP bytes
  const url = new URL(req.url);
  if (url.searchParams.get("file") === "1") {
    try {
      const filePath = path.join(process.cwd(), "public", "downloads", "etsy-ip-defense-kit.zip");
      const fileBuffer = await readFile(filePath);

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="Etsy-IP-Defense-Kit.zip"',
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      console.error("[download] ZIP file not found at expected path");
      return NextResponse.json({ error: "File not available" }, { status: 500 });
    }
  }

  // Default: serve an intermediate HTML page.
  // Auto-download uses fetch() + Blob URL — the most reliable cross-browser approach.
  // The manual button uses the same JS function so it also gets a Blob URL click,
  // with a plain href fallback for JS-disabled environments.
  const fileUrl = `/api/download/${token}?file=1`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Downloading your Etsy IP Defense Kit…</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      background: #fffbeb;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 48px 40px;
      max-width: 520px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { color: #111; font-size: 22px; margin-bottom: 12px; }
    p { color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
    .btn {
      display: inline-block;
      background: #f59e0b;
      color: white;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 16px;
      font-weight: bold;
      margin-top: 8px;
      cursor: pointer;
      border: none;
    }
    .btn:hover { background: #d97706; }
    .status { font-size: 14px; color: #16a34a; margin-top: 16px; min-height: 20px; }
    .note { font-size: 13px; color: #999; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">📦</div>
    <h1>Your download is starting…</h1>
    <p>Your <strong>Etsy IP Defense Kit</strong> (5 templates) should download automatically.<br>
    If nothing happens after a few seconds, click the button below.</p>
    <a id="dlBtn" class="btn" href="${fileUrl}">
      ⬇ Download Now
    </a>
    <div class="status" id="status"></div>
    <p class="note">
      Questions? Email us at
      <a href="mailto:thestartergroupenterprise@gmail.com" style="color:#d97706;">
        thestartergroupenterprise@gmail.com
      </a>
    </p>
  </div>
  <script>
    var FILE_URL = '${fileUrl}';
    var btn = document.getElementById('dlBtn');
    var status = document.getElementById('status');

    function triggerDownload() {
      status.textContent = 'Preparing download…';
      fetch(FILE_URL)
        .then(function(res) {
          if (!res.ok) throw new Error('Server returned ' + res.status);
          return res.blob();
        })
        .then(function(blob) {
          var objectUrl = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = objectUrl;
          a.download = 'Etsy-IP-Defense-Kit.zip';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function() { URL.revokeObjectURL(objectUrl); }, 10000);
          status.textContent = '✓ Download started! Check your Downloads folder.';
        })
        .catch(function(err) {
          console.error('Download error:', err);
          status.textContent = '';
          // Fall back to direct navigation
          window.location.href = FILE_URL;
        });
    }

    // Wire up the button to use fetch+blob instead of plain link
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      triggerDownload();
    });

    // Auto-trigger on page load
    setTimeout(triggerDownload, 600);
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
