/**
 * Temporary diagnostic route for unsubscribe API testing
 * DELETE after diagnostics complete
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const lines: string[] = [];
  
  lines.push("=== VERCEL RUNTIME DIAGNOSTICS ===\n");
  
  // 1. Check env vars
  lines.push("1. ENVIRONMENT VARIABLES:");
  const resendKey = process.env.RESEND_API_KEY ? "SET" : "MISSING";
  const audienceId = process.env.RESEND_AUDIENCE_ID ? "SET" : "MISSING";
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN ? "SET" : "MISSING";
  
  lines.push(`   RESEND_API_KEY: ${resendKey}`);
  lines.push(`   RESEND_AUDIENCE_ID: ${audienceId}`);
  if (process.env.RESEND_AUDIENCE_ID) {
    lines.push(`   VALUE: ${process.env.RESEND_AUDIENCE_ID}`);
  }
  lines.push(`   BLOB_READ_WRITE_TOKEN: ${blobToken}`);
  lines.push("");
  
  // 2. Test Resend API directly
  lines.push("2. TEST RESEND API CALL:");
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const testEmail = "test@sellerdefensekit.com";
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    
    if (!audienceId) {
      lines.push("   ERROR: RESEND_AUDIENCE_ID not set");
    } else {
      lines.push(`   Calling resend.contacts.create()`);
      lines.push(`   - audienceId: ${audienceId.substring(0, 8)}...`);
      lines.push(`   - email: ${testEmail}`);
      lines.push(`   - unsubscribed: true`);
      
      try {
        const result = await resend.contacts.create({
          audienceId: audienceId,
          email: testEmail,
          unsubscribed: true,
        });
        
        lines.push(`   SUCCESS: ${JSON.stringify(result)}`);
      } catch (err: any) {
        lines.push(`   ERROR: ${err.message}`);
        if (err.response) {
          lines.push(`   Status: ${err.response.status}`);
          lines.push(`   Body: ${JSON.stringify(err.response)}`);
        }
      }
    }
  } catch (err: any) {
    lines.push(`   FATAL: ${err.message}`);
  }
  
  lines.push("");
  
  // 3. Test Blob write directly
  lines.push("3. TEST BLOB WRITE:");
  try {
    const { put } = await import("@vercel/blob");
    const testKey = `test-diagnostics-${Date.now()}.json`;
    const testData = JSON.stringify({ test: true, timestamp: new Date().toISOString() });
    
    lines.push(`   Calling put()`);
    lines.push(`   - key: ${testKey}`);
    lines.push(`   - size: ${testData.length} bytes`);
    
    try {
      const result = await put(testKey, testData, { access: "private" });
      lines.push(`   SUCCESS: ${result.url}`);
    } catch (err: any) {
      lines.push(`   ERROR: ${err.message}`);
    }
  } catch (err: any) {
    lines.push(`   FATAL: ${err.message}`);
  }
  
  const html = lines.join("\n");
  return new NextResponse(`<pre>${html}</pre>`, {
    headers: { "Content-Type": "text/html" }
  });
}
