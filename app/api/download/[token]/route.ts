import { NextRequest, NextResponse } from "next/server";
import { verifyDownloadToken } from "@/lib/download-token";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const payload = verifyDownloadToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: "Download link is invalid or expired. Email thestartergroupenterprise@gmail.com to get a new one." },
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
