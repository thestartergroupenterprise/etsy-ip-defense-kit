import { NextRequest, NextResponse } from "next/server";
import { verifyDownloadToken } from "@/lib/download-token";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // DEBUG: log token structure to diagnose validation failures
  const dotCount = (token.match(/\./g) || []).length;
  const parts = token.split(".");
  console.log("[download] token length:", token.length);
  console.log("[download] dot count:", dotCount);
  console.log("[download] payload part length:", parts[0]?.length);
  console.log("[download] sig part length:", parts[1]?.length);
  console.log("[download] DOWNLOAD_SIGNING_SECRET set:", !!process.env.DOWNLOAD_SIGNING_SECRET);
  console.log("[download] secret prefix:", process.env.DOWNLOAD_SIGNING_SECRET?.substring(0, 8));

  let decodedPayload: string | null = null;
  try {
    decodedPayload = Buffer.from(parts[0], "base64url").toString("utf8");
    console.log("[download] decoded payload:", decodedPayload.substring(0, 120));
  } catch (e) {
    console.log("[download] failed to decode payload:", e);
  }

  const payload = verifyDownloadToken(token);
  console.log("[download] verifyDownloadToken result:", payload ? "VALID" : "INVALID");

  if (!payload) {
    return NextResponse.json(
      { error: "Download link is invalid or expired. Email thestartergroupenterprise@gmail.com to get a new one.", debug: { tokenLength: token.length, dots: dotCount, secretSet: !!process.env.DOWNLOAD_SIGNING_SECRET, decoded: decodedPayload?.substring(0, 80) } },
      { status: 404 }
    );
  }

  const blobRes = await fetch(payload.url);
  if (!blobRes.ok) {
    return NextResponse.json({ error: "File temporarily unavailable." }, { status: 503 });
  }

  const bytes = await blobRes.arrayBuffer();

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="etsy-ip-defense-kit.zip"',
      "Content-Length": bytes.byteLength.toString(),
      "Cache-Control": "no-store",
    },
  });
}
