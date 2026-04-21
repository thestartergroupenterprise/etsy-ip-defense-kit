/**
 * Thank You, Escalation Framework (P4)
 *
 * Server Component. Reads ?session_id from Stripe redirect.
 * Logs attribution and shows cross-sell for P1 if customer hasn't purchased it.
 *
 * FAIL-SAFE: any error defaults to basic thank you. Never blocks or errors.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AttributionLogger } from "@/app/components/AttributionLogger";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Thank You, Escalation Framework | Seller Defense Kit",
  description:
    "Your Escalation Framework is on its way. Check your email for the download link.",
  robots: { index: false, follow: false },
};

export default async function ThankYouEscalation({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params?.session_id;

  // If no session_id, redirect to home (direct access attempt)
  if (!sessionId) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Suspense fallback={null}>
        <AttributionLogger product="p4" amount={77} />
      </Suspense>

      {/* ── CONFIRMATION ── */}
      <section className="bg-amber-50 px-5 py-16">
        <div className="max-w-xl mx-auto text-center">
          <div className="text-5xl mb-6">&#10003;</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Your Escalation Framework is on its way
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Check your email for the download link. It arrives within a few minutes.
            Check your spam folder if you don&apos;t see it.
          </p>
          <div className="bg-white rounded-xl p-6 border border-amber-200 text-left">
            <p className="font-semibold text-gray-900 mb-3">Your download includes:</p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">01</span>
                <span>Escalation Notice Letter (formal second notice with evidence attachment list)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">02</span>
                <span>Evidence Packaging Checklist (40-row file index, 4-category checklist)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">03</span>
                <span>Small Claims Court Preparation (CCB and state small claims)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">04</span>
                <span>Lawyer Handoff Documentation (attorney consultation prep)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">05</span>
                <span>Platform Re-Filing Template (Etsy, Amazon, eBay, Shopify, TikTok)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">06</span>
                <span>Escalation Decision Tree (stage assessment and action log)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">07</span>
                <span>Repeat Infringer Documentation Log (11 incidents, pattern analysis)</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── NEXT STEPS ── */}
      <section className="px-5 py-12 bg-white">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6">While you wait for your email</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-1">Step 1: Start with the Decision Tree</h3>
              <p className="text-gray-600 text-sm">
                Open Document 6 first. The Escalation Decision Tree will tell you exactly which
                of the 7 templates to prioritize for your specific situation.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-1">Step 2: Screenshot everything today</h3>
              <p className="text-gray-600 text-sm">
                Before doing anything else, take fresh screenshots of the infringing content with
                today&apos;s date visible. This proof that infringement continued after your prior
                notice is essential for any escalation path.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-1">Step 3: Complete the Evidence Checklist</h3>
              <p className="text-gray-600 text-sm">
                Document 2 ensures your evidence package is organized before you send any notices
                or file anything. Organized evidence wins. Disorganized evidence loses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CROSS-SELL: P1 ── */}
      <section className="px-5 py-12 bg-amber-50">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-sm font-semibold text-amber-800 uppercase tracking-wide mb-2">
            Complete your protection suite
          </p>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Need the first-notice templates too?
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            The Escalation Framework handles everything after an ignored notice. If you also
            need the initial DMCA takedown and cease and desist templates, the original
            Seller Defense Kit ($27) covers the first round.
          </p>
          <Link
            href="/?utm_source=thank-you-p4&utm_medium=cross-sell&utm_campaign=p1-from-p4"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-4 rounded-xl transition-colors"
          >
            See the DMCA Enforcement Kit ($27)
          </Link>
        </div>
      </section>

      {/* ── SUPPORT ── */}
      <section className="px-5 py-10 bg-white text-center">
        <p className="text-gray-600 text-sm">
          Questions? Email{" "}
          <a
            href="mailto:hello@sellerdefensekit.com"
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            hello@sellerdefensekit.com
          </a>
        </p>
      </section>
    </main>
  );
}
