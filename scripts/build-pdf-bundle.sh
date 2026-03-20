#!/bin/bash
# build-pdf-bundle.sh
# Converts all 5 markdown documents to PDF and bundles as a ZIP
#
# Requirements:
#   - pandoc (apt install pandoc)
#   - wkhtmltopdf OR weasyprint (for PDF conversion)
#   - zip
#
# Usage: ./scripts/build-pdf-bundle.sh
# Output: public/downloads/etsy-ip-defense-kit.zip

set -e

DOCS_DIR="./documents"
OUT_DIR="./public/downloads"
BUNDLE_DIR="/tmp/etsy-ip-defense-kit-bundle"
ZIP_NAME="etsy-ip-defense-kit.zip"

echo "🔨 Building Etsy IP Defense Kit PDF bundle..."

# Create output directories
mkdir -p "$OUT_DIR"
mkdir -p "$BUNDLE_DIR"

# CSS for PDF styling
PDF_STYLE=$(cat << 'EOF'
body {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 12pt;
  line-height: 1.6;
  max-width: 700px;
  margin: 40px auto;
  padding: 0 20px;
  color: #1a1a1a;
}
h1 { font-size: 22pt; color: #92400e; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; }
h2 { font-size: 16pt; color: #111; margin-top: 28px; }
h3 { font-size: 13pt; color: #333; }
table { border-collapse: collapse; width: 100%; font-size: 10pt; }
th { background: #fef3c7; border: 1px solid #d97706; padding: 8px; text-align: left; }
td { border: 1px solid #ddd; padding: 8px; }
code { background: #f9f9f9; padding: 2px 6px; border-radius: 3px; font-size: 10pt; }
blockquote { border-left: 4px solid #f59e0b; margin: 16px 0; padding: 8px 16px; background: #fef3c7; }
.no-print { display: none; }
EOF
)

echo "$PDF_STYLE" > /tmp/pdf-style.css

# Convert each markdown to PDF
convert_doc() {
  local md_file="$1"
  local pdf_name="$2"
  local out_file="$BUNDLE_DIR/$pdf_name"
  
  echo "  Converting: $md_file → $pdf_name"
  
  if command -v pandoc &> /dev/null; then
    pandoc "$md_file" \
      --from markdown \
      --to pdf \
      --pdf-engine=wkhtmltopdf \
      --css /tmp/pdf-style.css \
      -o "$out_file" 2>/dev/null || \
    pandoc "$md_file" \
      --from markdown \
      --to html \
      --css /tmp/pdf-style.css \
      --standalone \
      -o "${out_file%.pdf}.html" && \
    echo "    ⚠️  PDF engine not available, created HTML: ${out_file%.pdf}.html"
  else
    echo "  ⚠️  pandoc not found — copying markdown as fallback"
    cp "$md_file" "$BUNDLE_DIR/$(basename $md_file)"
  fi
}

convert_doc "$DOCS_DIR/01-dmca-takedown-notice.md"     "01-DMCA-Takedown-Notice.pdf"
convert_doc "$DOCS_DIR/02-cease-and-desist-letter.md"  "02-Cease-and-Desist-Letter.pdf"
convert_doc "$DOCS_DIR/03-ip-theft-monitoring-checklist.md" "03-IP-Theft-Monitoring-Checklist.pdf"
convert_doc "$DOCS_DIR/04-multi-platform-filing-guide.md"   "04-Multi-Platform-Filing-Guide.pdf"
convert_doc "$DOCS_DIR/05-listing-reinstatement-appeal.md"  "05-Listing-Reinstatement-Appeal.pdf"

# Copy a README into the bundle
cat > "$BUNDLE_DIR/README.txt" << 'READMEEOF'
ETSY IP DEFENSE KIT
===================
Thank you for your purchase!

Your 5-document toolkit is included in this folder:

1. 01-DMCA-Takedown-Notice.pdf
   File a legally valid DMCA notice on Etsy, Temu, AliExpress, or the web.

2. 02-Cease-and-Desist-Letter.pdf
   Send directly to the copycat seller for faster removal.

3. 03-IP-Theft-Monitoring-Checklist.pdf
   Find stolen photos and copied listings across 5 platforms in 30 minutes/week.

4. 04-Multi-Platform-Filing-Guide.pdf
   Step-by-step filing guide for every platform — no more spinning your wheels.

5. 05-Listing-Reinstatement-Appeal.pdf
   For when YOUR listing gets suspended after a thief files against you.

HOW TO START:
- If you just found theft: Start with Document 1 (DMCA) and Document 4 (Filing Guide)
- If you want to contact the seller directly: Also use Document 2 (C&D)
- If your listing was suspended: Use Document 5 (Reinstatement Appeal)
- For ongoing protection: Follow Document 3 (Monitoring Checklist) weekly

Questions? Email us — 30-day money-back guarantee, no questions asked.

Not legal advice. For complex disputes, consult a qualified attorney.
READMEEOF

# Create ZIP
echo "📦 Creating ZIP bundle..."
cd "$BUNDLE_DIR" && zip -r "$OLDPWD/$OUT_DIR/$ZIP_NAME" . 2>/dev/null || \
  (cd /tmp && zip -r "/data/openclaw-system/agents/builder/builds/etsy-ip-landing/$OUT_DIR/$ZIP_NAME" "etsy-ip-defense-kit-bundle")

echo "✅ Bundle created: $OUT_DIR/$ZIP_NAME"
echo ""
echo "📋 Bundle contents:"
unzip -l "$OLDPWD/$OUT_DIR/$ZIP_NAME" 2>/dev/null || ls -la "$BUNDLE_DIR"

# Cleanup
rm -rf "$BUNDLE_DIR"
rm -f /tmp/pdf-style.css

echo ""
echo "✅ Build complete. Upload public/downloads/ to your Vercel deployment."
