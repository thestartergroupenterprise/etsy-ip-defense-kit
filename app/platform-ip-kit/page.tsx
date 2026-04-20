import type { Metadata } from "next";
import { UTMCaptureClient } from "@/app/components/UTMCaptureClient";

const STRIPE_P3_PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_P3_PAYMENT_LINK || "#";

export const metadata: Metadata = {
  title: "Platform IP Enforcement Kit | File Infringement Reports Correctly | Seller Defense Kit",
  description:
    "9 fillable PDF templates for Amazon, TikTok Shop, AliExpress, Pinterest, Shopify, Gumroad, Creative Market, Redbubble, and any platform where your work is stolen. $67.",
  alternates: {
    canonical: "https://sellerdefensekit.com/platform-ip-kit",
  },
  openGraph: {
    title: "Platform IP Enforcement Kit | File Infringement Reports Correctly",
    description:
      "9 fillable PDF templates for every platform. Amazon, TikTok Shop, AliExpress, Pinterest, Shopify, Gumroad, Creative Market, Redbubble, and more. File correctly the first time.",
    url: "https://sellerdefensekit.com/platform-ip-kit",
    siteName: "Seller Defense Kit",
    type: "website",
    images: [
      {
        url: "https://sellerdefensekit.com/og-p3.png",
        width: 1200,
        height: 630,
        alt: "Platform IP Enforcement Kit",
      },
    ],
  },
};

export default function PlatformIPKit() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <UTMCaptureClient />

      {/* ── HERO ── */}
      <section className="bg-amber-50 px-5 py-12 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="inline-block bg-amber-200 text-amber-900 text-sm font-semibold px-4 py-1 rounded-lg mb-6">
            For independent sellers and small creative businesses selling on multiple platforms
          </p>

          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-gray-900 mb-5">
            File IP Infringement Reports Correctly on Every Platform{" "}
            <span className="text-amber-600">— the First Time</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            9 fillable PDF templates for Amazon, TikTok Shop, AliExpress, Pinterest, Shopify,
            Gumroad, Creative Market, Redbubble, and any other website where your work is stolen.
          </p>

          {/* Price Anchor */}
          <p className="text-base text-gray-700 mb-8 font-semibold">
            IP attorneys charge <span className="text-amber-600">$250–$500/hour</span>. A single
            enforcement consultation costs more than this entire kit.
          </p>

          {/* Primary CTA */}
          <a
            href={STRIPE_P3_PAYMENT_LINK}
            className="inline-block bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xl font-bold px-10 py-5 rounded-xl shadow-lg transition-colors w-full sm:w-auto mb-4"
          >
            Get the Platform IP Kit ($67)
          </a>

          <p className="text-sm text-gray-500">
            30-day money-back guarantee. Instant download.
          </p>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section className="px-5 py-14 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-900">
            9 Fillable Templates — One for Every Platform
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Fill-in-the-blank forms. No legal expertise required. Ready to file.
          </p>

          <div className="space-y-4">
            {[
              {
                name: "Amazon Brand Registry Report",
                desc: "For Brand Registry sellers protecting registered trademarks on Amazon.",
              },
              {
                name: "Amazon Rights and Protections Report",
                desc: "For non-Brand Registry sellers filing intellectual property complaints.",
              },
              {
                name: "TikTok Shop IPR Report",
                desc: "Template for TikTok Shop intellectual property rights infringement reports.",
              },
              {
                name: "AliExpress IPP Notice",
                desc: "AliExpress-specific intellectual property protection notice format.",
              },
              {
                name: "Pinterest IP Report",
                desc: "Fill-in report for copyright and trademark violations on Pinterest.",
              },
              {
                name: "Shopify and Standalone Website DMCA",
                desc: "DMCA takedown notice for Shopify stores and custom-built websites.",
              },
              {
                name: "Gumroad, Creative Market, and Redbubble DMCA Notice",
                desc: "Combined template for digital product platforms and print-on-demand services.",
              },
              {
                name: "Other Website and Google Deindex Notice",
                desc: "Template for infringement on unknown platforms plus Google Search Console removal request.",
              },
              {
                name: "Multi-Platform Infringement Evidence Log",
                desc: "Structured spreadsheet to track, document, and organize infringement across all platforms.",
              },
            ].map((template, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-lg text-gray-900 mb-2">{template.name}</h3>
                <p className="text-gray-600">{template.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-5 py-14 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>

          <div className="grid grid-cols-1 gap-8 md:gap-6">
            {[
              {
                step: "1",
                title: "Buy",
                desc: "Download instantly after purchase. No account, no waiting.",
              },
              {
                step: "2",
                title: "Download",
                desc: "Get all 9 templates as fillable PDFs. Choose the one for your platform.",
              },
              {
                step: "3",
                title: "File Correctly",
                desc: "Fill in your details, attach screenshots, and file with confidence.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 text-amber-700 rounded-full font-bold text-2xl mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECONDARY CTA ── */}
      <section className="bg-amber-50 px-5 py-14">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Stop IP theft before it costs you sales
          </h2>

          <a
            href={STRIPE_P3_PAYMENT_LINK}
            className="inline-block bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xl font-bold px-10 py-5 rounded-xl shadow-lg transition-colors w-full sm:w-auto"
          >
            Get the Platform IP Kit ($67)
          </a>

          <p className="text-sm text-gray-500 mt-4">
            30-day money-back guarantee. No questions asked.
          </p>
        </div>
      </section>
    </main>
  );
}
