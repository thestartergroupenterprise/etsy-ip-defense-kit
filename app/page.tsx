import Link from "next/link";

const STRIPE_PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "#";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* ── HERO ── */}
      <section className="bg-amber-50 px-5 py-12 md:py-20">
        <div className="max-w-2xl mx-auto text-center">

          {/* Badge */}
          <p className="inline-block bg-amber-200 text-amber-900 text-sm font-semibold px-4 py-1 rounded-lg mb-6">
            For independent sellers and small creative businesses protecting original work
          </p>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-gray-900 mb-5">
            5 fill-in-the-blank templates that let independent sellers and
            small creative businesses file a DMCA takedown on any copycat in{" "}
            <span className="text-amber-600">15 minutes</span>, without a
            lawyer, without spinning your wheels.
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            For independent sellers and small creative businesses selling on
            any platform or through their own website, without the cost of
            legal fees.
          </p>

          {/* Price + CTA */}
          <div className="mb-4">
            <a
              href={STRIPE_PAYMENT_LINK}
              className="inline-block bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xl font-bold px-10 py-5 rounded-xl shadow-lg transition-colors w-full sm:w-auto"
            >
              Get the IP Defense Kit — $27
            </a>
          </div>

          <p className="text-sm text-gray-500">
            Instant download. No account needed.
          </p>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section className="px-5 py-12 md:py-16 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
            What&apos;s Inside the Kit
          </h2>
          <p className="text-center text-gray-500 mb-8">
            5 professionally written, ready-to-use templates
          </p>

          <ul className="space-y-5">
            <li className="flex items-start gap-4 bg-gray-50 rounded-xl p-5">
              <span className="text-2xl flex-shrink-0">📄</span>
              <div>
                <p className="font-bold text-gray-900 mb-1">
                  DMCA Takedown Notice
                </p>
                <p className="text-gray-600 text-sm">
                  Fill-in-the-blank legal template valid for any platform,
                  marketplace, or standalone website. Includes the six required
                  elements under US federal law. File a valid notice in minutes,
                  not hours.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4 bg-gray-50 rounded-xl p-5">
              <span className="text-2xl flex-shrink-0">✉️</span>
              <div>
                <p className="font-bold text-gray-900 mb-1">
                  Cease &amp; Desist Letter
                </p>
                <p className="text-gray-600 text-sm">
                  Send directly to the copycat seller before or alongside your
                  platform report. Direct seller contact speeds up removal and
                  creates a paper trail.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4 bg-gray-50 rounded-xl p-5">
              <span className="text-2xl flex-shrink-0">🔍</span>
              <div>
                <p className="font-bold text-gray-900 mb-1">
                  IP Theft Monitoring Checklist
                </p>
                <p className="text-gray-600 text-sm">
                  Step-by-step system to find stolen photos and copied listings
                  across Etsy, Temu, AliExpress, Pinterest, Amazon, and the
                  open web. Covers reverse image search across any website,
                  Google image search for stolen photos on standalone sites,
                  competitor website monitoring, and keyword search across all
                  platforms. Weekly sweep takes under 30 minutes.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4 bg-gray-50 rounded-xl p-5">
              <span className="text-2xl flex-shrink-0">🗺️</span>
              <div>
                <p className="font-bold text-gray-900 mb-1">
                  Multi-Platform Filing Guide
                </p>
                <p className="text-gray-600 text-sm">
                  Exact steps for filing on every platform and channel — Etsy
                  IP portal, Temu takedown form, AliExpress IP center, Amazon
                  Brand Registry, and standalone websites via hosting provider
                  DMCA agent (includes WHOIS lookup process). Every field
                  explained. No more going in circles.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4 bg-gray-50 rounded-xl p-5">
              <span className="text-2xl flex-shrink-0">🛡️</span>
              <div>
                <p className="font-bold text-gray-900 mb-1">
                  Listing Reinstatement Appeal Template
                </p>
                <p className="text-gray-600 text-sm">
                  For the scenario where{" "}
                  <em>your</em> listing gets suspended when a thief files a
                  report using your own photos. This appeal template is unique
                  to this kit, and to a problem independent sellers and small
                  creative businesses face every day.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* ── PRICE + CTA (above fold on mobile = repeated) ── */}
      <section className="bg-amber-50 px-5 py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 mb-3 text-lg">
            One-time purchase. Yours forever.
          </p>
          <p className="text-6xl font-extrabold text-gray-900 mb-2">$27</p>
          <p className="text-gray-500 mb-6 text-sm">No subscription. No upsells.</p>

          <a
            href={STRIPE_PAYMENT_LINK}
            className="inline-block bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xl font-bold px-10 py-5 rounded-xl shadow-lg transition-colors w-full sm:w-auto"
          >
            Get the IP Defense Kit — $27
          </a>

          <p className="text-sm text-gray-500 mt-4">
            Instant download. No account needed.
          </p>
        </div>
      </section>

      {/* ── GUARANTEE ── */}
      <section className="bg-white px-5 py-12 md:py-16 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-5">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">30-Day Money-Back Guarantee</h2>
          <p className="text-gray-600 text-lg max-w-lg mx-auto">
            If you can&apos;t file your first DMCA in 15 minutes, email within
            30 days for a full refund. No questions asked.
          </p>
        </div>
      </section>

      {/* ── OBJECTION HANDLER ── */}
      <section className="bg-gray-50 px-5 py-10 md:py-14 border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-8 text-gray-700">
            Common questions
          </h2>
          <div className="space-y-5">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="font-semibold text-gray-900 mb-2">
                Do I need to be a lawyer to use these?
              </p>
              <p className="text-gray-600 text-sm">
                No. The templates are written for independent sellers and small
                business owners, not attorneys. Every field is labeled with
                exactly what to put there. If you know the details of the
                infringement, you have everything you need to file.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="font-semibold text-gray-900 mb-2">
                Do these work if I sell through my own website, not a
                marketplace?
              </p>
              <p className="text-gray-600 text-sm">
                Yes. The kit covers standalone websites explicitly. The
                Multi-Platform Filing Guide includes the full process for
                filing against content on any website via the hosting
                provider&apos;s DMCA agent, including how to do a WHOIS lookup
                to identify the host. US-based hosting providers are legally
                required to respond to valid DMCA notices regardless of the
                platform.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="font-semibold text-gray-900 mb-2">
                What platforms and channels do these templates cover?
              </p>
              <p className="text-gray-600 text-sm">
                Etsy, Amazon, Temu, AliExpress, Pinterest, Shopify, Gumroad,
                standalone websites, and any other DMCA-compliant platform or
                hosting provider. The DMCA notice template uses the standard
                six-element legal format required under 17 U.S.C. Section 512,
                which applies equally across all of them. You fill in the
                platform-specific details; the legal structure is the same
                everywhere.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="font-semibold text-gray-900 mb-2">
                Does this work for a small business with staff, not just a
                solo seller?
              </p>
              <p className="text-gray-600 text-sm">
                Yes. The templates are designed for any independent seller or
                small creative business, whether you are running everything
                yourself or have a small team. The legal format and process are
                the same regardless of business size. Many small businesses
                with 2 to 10 staff members use these to handle IP enforcement
                without outsourcing to a law firm.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="font-semibold text-gray-900 mb-2">
                What if the platform doesn&apos;t respond?
              </p>
              <p className="text-gray-600 text-sm">
                Document 4 includes escalation steps for every major platform.
                For Etsy, escalate directly to legal@etsy.com with your case
                number. For Amazon, escalate through Brand Registry&apos;s
                escalation path. If the content is on a standalone website,
                contact the site&apos;s hosting provider directly using the
                same DMCA notice format. Hosts are equally required to respond
                under safe harbor rules and most act within 5 to 10 business
                days.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="font-semibold text-gray-900 mb-2">
                What types of IP theft do these templates cover?
              </p>
              <p className="text-gray-600 text-sm">
                These templates are optimized for copyright infringement:
                stolen product photos, copied listing descriptions, unauthorized
                use of original digital designs, and resale of digital products
                without permission. For trademark or design patent issues,
                consult an attorney. For copyright on any original creative
                work you made, this kit covers the full enforcement process.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="font-semibold text-gray-900 mb-2">
                How do I get the kit after purchasing?
              </p>
              <p className="text-gray-600 text-sm">
                Instantly. After your purchase, you&apos;ll receive an email
                with a download link. No account needed, no login required.
                Works on any device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-amber-500 px-5 py-14 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Stop watching copycats profit from your work.
          </h2>
          <p className="text-amber-100 mb-8">
            Get the complete kit and file your first DMCA today.
          </p>
          <a
            href={STRIPE_PAYMENT_LINK}
            className="inline-block bg-white hover:bg-gray-100 text-amber-600 text-xl font-bold px-10 py-5 rounded-xl shadow-lg transition-colors w-full sm:w-auto"
          >
            Get the IP Defense Kit — $27
          </a>
          <p className="text-amber-100 text-sm mt-4">
            Instant download · 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 text-sm px-5 py-8 text-center">
        <p className="mb-2">
          © {new Date().getFullYear()} Seller Defense Kit. All rights reserved.
        </p>
        <p className="mb-3">
          <Link href="/blog" className="text-amber-400 hover:text-amber-300 underline mr-4">
            Blog
          </Link>
          <Link href="/privacy" className="text-amber-400 hover:text-amber-300 underline mr-4">
            Privacy Policy
          </Link>
          <a
            href="mailto:hello@sellerdefensekit.com"
            className="text-amber-400 hover:text-amber-300 underline"
          >
            Support
          </a>
        </p>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Not legal advice. These templates are provided for informational
          purposes. For complex IP disputes, consult a qualified attorney.
        </p>
      </footer>

    </main>
  );
}
