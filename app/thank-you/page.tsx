import type { Metadata } from "next";
import Link from "next/link";
import { AttributionLogger } from "@/app/components/AttributionLogger";

export const metadata: Metadata = {
  title: "Thank You, DMCA Enforcement Kit | Seller Defense Kit",
  description: "Your DMCA Enforcement Kit is on its way. Check your email for the download link.",
  robots: { index: false, follow: false },
};

const STRIPE_P2_PAYMENT_LINK =
  "https://buy.stripe.com/5kQ14n6Lj9iRaT71na2Fa01?utm_source=thank-you&utm_medium=cross-sell&utm_campaign=product-upsell";

export default function ThankYou() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <AttributionLogger product="p1" amount={27} />
      <section className="px-5 py-20">
        <div className="max-w-xl mx-auto text-center">

          <div className="text-5xl mb-6">✅</div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Your DMCA Enforcement Kit is on its way.
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Check your inbox for the download link. It arrives within a few minutes.
            The link is valid for 30 days.
          </p>

          {/* What is in the kit */}
          <div className="bg-amber-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="font-bold text-gray-900 mb-3">What you just got:</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">01</span>
                <span>DMCA Takedown Notice Template, complete the statutory language in 15 minutes</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">02</span>
                <span>Counter-Notification Response Template, if the copycat fights back</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">03</span>
                <span>Evidence Collection Checklist, document infringement before it disappears</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">04</span>
                <span>Follow-Up Escalation Letter, when the first notice gets ignored</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">05</span>
                <span>Platform Comparison Guide, Etsy, Amazon, Temu, AliExpress, and standalone websites</span>
              </li>
            </ul>
          </div>

          {/* What to do first */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="font-bold text-gray-900 mb-2">What to do first:</h2>
            <ol className="space-y-2 text-gray-700 text-sm list-decimal list-inside">
              <li>Screenshot and save the infringing listing before filing</li>
              <li>Open Template 01 and fill in your information</li>
              <li>Use the Platform Comparison Guide to find the correct submission portal</li>
            </ol>
          </div>

          <p className="text-gray-500 text-sm mb-10">
            Questions? Reply to your purchase email or contact us at{" "}
            <a
              href="mailto:thestartergroupenterprise@gmail.com"
              className="text-amber-600 hover:underline"
            >
              thestartergroupenterprise@gmail.com
            </a>
            . 30-day money-back guarantee.
          </p>

          {/* ── CROSS-SELL: Product 2 ── placed after download CTA, never above ── */}
          <div className="border-t border-gray-100 pt-10">
            <div className="bg-white border border-amber-200 rounded-xl p-6 text-left">
              <h2 className="text-xl font-extrabold text-gray-900 mb-3">
                One more threat most sellers don&apos;t see coming
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-5">
                You&apos;ve just handled the hardest part, filing a takedown that actually works.
                But here&apos;s what happens next for most sellers: someone files a trademark on
                their brand name before they do. Once that happens, the platform sides with the
                trademark holder, not you. The Trademark Protection Kit gives you everything you
                need to document your brand rights, monitor for trademark theft, and respond
                formally before it becomes a legal emergency.
              </p>
              <a
                href={STRIPE_P2_PAYMENT_LINK}
                className="block w-full text-center bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-lg font-bold px-8 py-4 rounded-xl transition-colors"
              >
                Protect Your Brand Name, $47
              </a>
              <p className="text-xs text-gray-500 mt-3 text-center">
                30-day money-back guarantee. Same promise as your DMCA kit.
              </p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
