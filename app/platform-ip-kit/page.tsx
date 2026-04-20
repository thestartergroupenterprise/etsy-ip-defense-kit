import type { Metadata } from "next";
import { UTMCaptureClient } from "@/app/components/UTMCaptureClient";

const STRIPE_P3_PAYMENT_LINK = "https://buy.stripe.com/bJecN58Tr2Ut1ix3vi2Fa02";

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

      {/* ── WHO THIS IS FOR ── */}
      <section className="px-5 py-14 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            Who This Is For
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Independent sellers selling across multiple platforms
              </h3>
              <p className="text-gray-600">
                If your work appears on Amazon, TikTok Shop, AliExpress, Shopify, Pinterest, or any other website simultaneously, you need different filing strategies for each one. A generic DMCA letter works nowhere. Platform-specific templates work everywhere.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Sellers who've been rejected before
              </h3>
              <p className="text-gray-600">
                Amazon's #1 rejection reason in 2026 is vague descriptions. TikTok Shop requires IP registration before you can file. AliExpress requires identity verification. These templates include exactly what each platform demands, with no guessing.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Sellers who can't afford attorney fees for every incident
              </h3>
              <p className="text-gray-600">
                One IP attorney consultation costs $250–$500/hour and typically runs $500–$1,500 per infringement case. If you sell on multiple platforms, infringement happens across multiple platforms. These templates let you handle it yourself, permanently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY PLATFORM-SPECIFIC MATTERS ── */}
      <section className="px-5 py-14 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            Why Platform-Specific Matters
          </h2>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <h3 className="font-bold text-lg text-gray-900 mb-3">Amazon Brand Registry vs. Public Form</h3>
            <p className="text-gray-600 mb-3">
              Amazon's Brand Registry portal is 10x faster (1–3 days) and handles bulk submissions, but requires a registered trademark. The public form works for anyone but takes 3–10 days and doesn't have a bulk option. Using the wrong one means waiting 7 extra days or being locked out entirely.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <h3 className="font-bold text-lg text-gray-900 mb-3">TikTok Shop IPR Portal Has Its Own Rules</h3>
            <p className="text-gray-600 mb-3">
              TikTok doesn't accept DMCA notices sent via email. You must register on their separate IPPC (Intellectual Property Protection Center) portal first, upload your trademark or copyright certificates, and THEN file from there. Skipping this step guarantees rejection.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <h3 className="font-bold text-lg text-gray-900 mb-3">AliExpress IPP Requires Identity Verification</h3>
            <p className="text-gray-600 mb-3">
              AliExpress is the most complex major platform. Their IPP (Intellectual Property Protection) system requires uploading government ID, business registration, and detailed IP documentation before you can file a single complaint. Generic DMCA letters result in immediate rejection.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-bold text-lg text-gray-900 mb-3">Each Platform Is Independent</h3>
            <p className="text-gray-600">
              A successful takedown on Amazon does not affect the same listing on TikTok Shop or AliExpress. Each platform must be filed with separately, using its own process and requirements. Sellers who don't know this file once, assume they're done, and leave the infringement live on 5 other platforms.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section className="px-5 py-14 bg-white">
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
                desc: "Template for TikTok Shop intellectual property rights infringement reports via the IPPC portal.",
              },
              {
                name: "AliExpress IPP Notice",
                desc: "AliExpress-specific intellectual property protection notice format with ID verification checklist.",
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
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-lg text-gray-900 mb-2">{template.name}</h3>
                <p className="text-gray-600">{template.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT HAPPENS AFTER YOU FILE ── */}
      <section className="px-5 py-14 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            What Happens After You File
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-lg text-amber-600 mb-2">Platform Takes Action (24 hrs – 14 days)</h3>
              <p className="text-gray-600">
                Most platforms respond within 24–72 hours for TikTok Shop and AliExpress, 1–3 days for Amazon Brand Registry, 3–10 days for public Amazon forms, and 3–7 days for Pinterest. Response time depends on how detailed your submission is.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-lg text-amber-600 mb-2">Seller Gets Notified (and Can Appeal)</h3>
              <p className="text-gray-600">
                If the platform removes the listing, the seller receives a notice. They can file a counter-notice claiming the removal was in error, which gives you 10–14 days to decide whether to pursue legal action. The toolkit includes guidance for handling counter-notices.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-lg text-amber-600 mb-2">You Monitor Ongoing Infringement</h3>
              <p className="text-gray-600">
                The toolkit includes a multi-platform infringement tracking log. Copycat sellers often re-list the same infringing content under new seller accounts or URLs. Having a documented history of removal attempts strengthens any future legal action if needed.
              </p>
            </div>
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

      {/* ── FAQ ── */}
      <section className="px-5 py-14 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "Why did Amazon reject my infringement report?",
                a: "Amazon's #1 rejection reason in 2026 is vague descriptions. Saying 'they copied my design' is not enough. You must include specific ASINs, screenshots, and exactly what was copied (text, photo, layout, or design element). This template walks through Amazon's exact requirements and shows you how to describe violations in the language Amazon's system accepts.",
              },
              {
                q: "Can I use the same DMCA letter for all platforms?",
                a: "No. A DMCA notice written for a standalone website gets rejected by TikTok Shop (which has its own portal), Amazon (which requires registered trademark info), and AliExpress (which requires IP registration first). Each platform has different required fields, different evidence, and different processes. These 9 templates are specifically formatted for each platform's exact requirements.",
              },
              {
                q: "How long does it take to get a listing removed after I file?",
                a: "It depends on the platform. Amazon Brand Registry: 1–3 days. TikTok Shop IPPC: 24–72 hours. AliExpress IPP: 24–72 hours. Amazon public form: 3–10 days. Pinterest: 3–7 days. Shopify: 24–48 hours. The faster platforms require more upfront documentation, which is why these templates include exactly what each one needs.",
              },
              {
                q: "Do I need a registered trademark to file?",
                a: "It depends on the platform and the type of infringement. Amazon Brand Registry requires a registered trademark. Amazon's public form accepts copyright complaints from anyone. TikTok Shop's IPPC requires IP registration but accepts common law trademark claims. AliExpress requires government-issued ID but accepts unregistered brands if you can prove use. This toolkit includes guidance for each scenario.",
              },
              {
                q: "What happens if the seller files a counter-notice?",
                a: "If they counter-claim, the platform notifies you, and you have 10–14 days to decide next steps. Most copycat sellers don't counter-notice because they know the violation is real. If they do, the toolkit includes guidance on what to do next (legal action, continued monitoring, escalation). Having documentation of the removal helps if you ever need an attorney.",
              },
              {
                q: "Do I need to file the same infringement on every platform separately?",
                a: "Yes. Each platform is completely independent. A successful takedown on Amazon does NOT affect the same infringing listing on TikTok Shop, AliExpress, or Shopify. You must file a separate complaint on each one. The multi-platform evidence log included helps you track what you've already filed and where you still need to file.",
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group"
              >
                <summary className="px-6 py-5 cursor-pointer font-bold text-gray-900 flex justify-between items-center hover:bg-gray-50">
                  {faq.q}
                  <span className="text-amber-600 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-5 text-gray-600 border-t border-gray-100">
                  {faq.a}
                </div>
              </details>
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
