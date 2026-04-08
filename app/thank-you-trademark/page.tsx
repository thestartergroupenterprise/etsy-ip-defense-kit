import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank You — Trademark Protection Kit | Seller Defense Kit",
  description: "Your Trademark Protection Resource Toolkit is on its way. Check your email for the download link.",
  robots: { index: false, follow: false },
};

export default function ThankYouTrademark() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="px-5 py-20">
        <div className="max-w-xl mx-auto text-center">

          <div className="text-5xl mb-6">✅</div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Your Trademark Protection Kit is on its way.
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Check your inbox for the download link — it arrives within a few minutes.
            The link is valid for 30 days.
          </p>

          <div className="bg-amber-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="font-bold text-gray-900 mb-3">What you just got:</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">01</span>
                <span>Brand Rights Documentation Log — document your common law rights starting now</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">02</span>
                <span>Trademark Search and Clearance Checklist — confirm no conflicts exist</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">03</span>
                <span>Marketplace Brand Violation Report Template — file on Etsy, Amazon, Temu, and more</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">04</span>
                <span>Trademark Monitoring Workflow — weekly and monthly scan protocol</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">05</span>
                <span>Brand Identity Infringement Evidence Log — capture everything the moment you find it</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">06</span>
                <span>Trademark Registration Readiness Checklist — USPTO filing preparation</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="font-bold text-gray-900 mb-2">What to do first:</h2>
            <ol className="space-y-2 text-gray-700 text-sm list-decimal list-inside">
              <li>Open Document 1 and fill in Section 1 today — date and evidence of first use</li>
              <li>Run the Trademark Search Checklist if you have not already</li>
              <li>Set a weekly calendar reminder to run the Monitoring Workflow</li>
            </ol>
          </div>

          <p className="text-gray-500 text-sm mb-8">
            Questions? Reply to your purchase email or contact us at{" "}
            <a
              href="mailto:thestartergroupenterprise@gmail.com"
              className="text-amber-600 hover:underline"
            >
              thestartergroupenterprise@gmail.com
            </a>
            . 30-day money-back guarantee — if the kit did not give you what you needed, we will refund you.
          </p>

          {/* Cross-sell: Product 1 — only shown if they came directly (organic P2 purchase) */}
          <div className="border border-amber-200 rounded-xl p-6 bg-amber-50 text-left">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
              You might also need this
            </p>
            <h3 className="font-bold text-gray-900 mb-2">
              IP Defense Kit — DMCA Takedown Templates
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Trademark protection covers your brand name. Copyright protection covers your creative
              work — original photos, designs, and listing content. If someone is copying your
              actual products or images, the IP Defense Kit has the DMCA takedown tools for Etsy,
              Amazon, Temu, AliExpress, and independent websites.
            </p>
            <Link
              href="/"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold px-6 py-3 rounded-lg transition-colors"
            >
              See the IP Defense Kit — $27
            </Link>
          </div>

        </div>
      </section>

      <footer className="px-5 py-8 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm">
          <Link href="/" className="hover:text-white transition-colors">
            Seller Defense Kit
          </Link>
          {" · "}
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </p>
        <p className="text-gray-600 text-xs mt-2">
          Seller Defense Kit, a product of The Starter Group · 2967 Dundas St W, Toronto, ON M6P 1Z2, Canada
        </p>
      </footer>
    </main>
  );
}
