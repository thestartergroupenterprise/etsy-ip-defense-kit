/**
 * Thank You, Trademark Protection Resource Toolkit
 *
 * Server Component. Reads ?session_id from Stripe redirect.
 * Performs a server-side Stripe purchase history check to determine
 * whether to show cross-sell Variant A (customer has P1) or Variant B (default).
 *
 * VARIANT A: customer already purchased Product 1 (DMCA kit)
 *   Show Product 3 coming-soon mention only. No live CTA.
 *
 * VARIANT B: customer has not purchased P1 OR check failed/timed out
 *   Show Product 1 cross-sell CTA. Product 3 as secondary plain-text mention.
 *
 * FAIL-SAFE: any error, timeout (>2s), missing email, or missing session_id
 * defaults to Variant B. Page never blocks or shows an error state.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Thank You, Trademark Protection Kit | Seller Defense Kit",
  description:
    "Your Trademark Protection Resource Toolkit is on its way. Check your email for the download link.",
  robots: { index: false, follow: false },
};

// ── Purchase history check ─────────────────────────────────────────────────

/** Cached Stripe session lookup, 5-minute TTL per session ID. */
const getStripeSession = unstable_cache(
  async (sessionId: string) => {
    const stripe = new (await import("stripe")).default(
      process.env.STRIPE_SECRET_KEY || "",
      { apiVersion: "2026-02-25.clover" }
    );
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer"],
    });
    return {
      customerEmail:
        session.customer_details?.email ||
        (typeof session.customer === "object" && session.customer?.email
          ? session.customer.email
          : null),
    };
  },
  ["stripe-session"],
  { revalidate: 300 } // 5 minutes
);

/** Cached P1 purchase check per email, 5-minute TTL. */
const checkP1Purchase = unstable_cache(
  async (email: string): Promise<boolean> => {
    const p1ProductId = process.env.STRIPE_P1_PRODUCT_ID;
    if (!p1ProductId) return false;

    const stripe = new (await import("stripe")).default(
      process.env.STRIPE_SECRET_KEY || "",
      { apiVersion: "2026-02-25.clover" }
    );

    // Search for paid payment intents associated with this email and P1 product
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 20,
    });

    for (const pi of paymentIntents.data) {
      if (pi.status !== "succeeded") continue;
      if (pi.receipt_email !== email) continue;

      // Check if this PI has a line item matching the P1 product
      // Payment Links use Checkout Sessions, not direct PaymentIntents with line items
      // Instead check via Checkout Sessions by customer email
      break;
    }

    // Reliable approach: search Checkout Sessions by customer email
    const sessions = await stripe.checkout.sessions.list({
      limit: 20,
    });

    for (const s of sessions.data) {
      if (s.payment_status !== "paid") continue;
      const sessionEmail =
        s.customer_details?.email ||
        (typeof s.customer === "object" ? s.customer?.email : null);
      if (sessionEmail?.toLowerCase() !== email.toLowerCase()) continue;

      // Check line items for P1 product
      const lineItems = await stripe.checkout.sessions.listLineItems(s.id, {
        limit: 10,
      });
      for (const item of lineItems.data) {
        if (item.price?.product === p1ProductId) return true;
      }
    }

    return false;
  },
  ["p1-purchase-check"],
  { revalidate: 300 }
);

/** Runs the full check with a hard 2-second timeout. Fails safe to false. */
async function hasPriorP1Purchase(sessionId: string): Promise<boolean> {
  try {
    const timeoutPromise = new Promise<false>((resolve) =>
      setTimeout(() => resolve(false), 2000)
    );
    const checkPromise = (async () => {
      const { customerEmail } = await getStripeSession(sessionId);
      if (!customerEmail) return false;
      return await checkP1Purchase(customerEmail);
    })();
    return await Promise.race([checkPromise, timeoutPromise]);
  } catch (err) {
    // Log silently, never surface to customer
    console.error("[thank-you-trademark] P1 purchase check failed:", err);
    return false;
  }
}

// ── Page component ──────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function ThankYouTrademark({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = params.session_id ?? null;

  // Variant A if session_id present and P1 purchase confirmed; Variant B otherwise
  const variantA =
    sessionId != null ? await hasPriorP1Purchase(sessionId) : false;

  // P1 payment link from env, never hardcoded
  const p1PaymentLink =
    (process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "#") +
    "?utm_source=thank-you&utm_medium=cross-sell&utm_campaign=product-upsell";

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="px-5 py-20">
        <div className="max-w-xl mx-auto text-center">

          <div className="text-5xl mb-6">✅</div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Your Trademark Protection Kit is on its way.
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
                <span>Brand Rights Documentation Log, document your common law rights starting today</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">02</span>
                <span>Trademark Search and Clearance Checklist, confirm no conflicts before claiming a name</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">03</span>
                <span>Marketplace Brand Violation Report Template, file on Etsy, Amazon, Temu, AliExpress</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">04</span>
                <span>Trademark Monitoring Workflow, weekly and monthly brand scan protocol</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">05</span>
                <span>Brand Identity Infringement Evidence Log, capture everything the moment you find it</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">06</span>
                <span>Trademark Registration Readiness Checklist, USPTO filing preparation</span>
              </li>
            </ul>
          </div>

          {/* What to do first */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="font-bold text-gray-900 mb-2">What to do first:</h2>
            <ol className="space-y-2 text-gray-700 text-sm list-decimal list-inside">
              <li>Open Document 1 and fill in Section 1 today</li>
              <li>Run the Trademark Search Checklist if you have not already</li>
              <li>Set a weekly calendar reminder to run the Monitoring Workflow</li>
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

          {/* ── CROSS-SELL: placed after download CTA only ── */}
          <div className="border-t border-gray-100 pt-10">
            {variantA ? (
              // ── VARIANT A: customer already has Product 1 ──
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-left">
                <h2 className="text-xl font-extrabold text-gray-900 mb-3">
                  Your brand is protected. Now make sure every platform knows it.
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  Your DMCA kit handles copyright. Your trademark kit handles brand identity.
                  The next gap is platform-specific filing, because Etsy, Amazon, TikTok Shop,
                  and AliExpress each have completely different enforcement requirements.
                  A notice that works on one platform gets rejected on another.
                </p>
                <p className="text-gray-500 text-sm">
                  Coming soon: Platform-Specific Filing Toolkit, $67. You will be the first
                  to know when it is available.
                  {/* TODO (Product 3 PAGE_LIVE): Replace this plain text with a live CTA button
                      linking to Product 3 payment link with UTM params:
                      utm_source=thank-you&utm_medium=cross-sell&utm_campaign=product-upsell */}
                </p>
              </div>
            ) : (
              // ── VARIANT B: customer does not have Product 1 (or check defaulted) ──
              <div className="bg-white border border-amber-200 rounded-xl p-6 text-left">
                <h2 className="text-xl font-extrabold text-gray-900 mb-3">
                  You are protected on trademark. Are you covered on copyright?
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">
                  Most sellers who protect their brand name discover they also need a DMCA
                  takedown process, because copycats don&apos;t stop at one type of theft.
                  The DMCA Enforcement Kit gives you five fill-in-the-blank templates to
                  remove infringing listings from any platform in 15 minutes. It is the most
                  common next step for sellers who have just set up their trademark protection.
                </p>
                <a
                  href={p1PaymentLink}
                  className="block w-full text-center bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-lg font-bold px-8 py-4 rounded-xl transition-colors"
                >
                  Get the DMCA Enforcement Kit, $27
                </a>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  30-day money-back guarantee.
                </p>
                {/* Product 3 secondary mention */}
                <p className="text-xs text-gray-400 mt-4">
                  Also coming soon: Platform-Specific Filing Toolkit, exact enforcement
                  guidance for Etsy, Amazon, TikTok Shop, and AliExpress. $67.
                  {/* TODO (Product 3 PAGE_LIVE): Replace plain text with a live link to Product 3. */}
                </p>
              </div>
            )}
          </div>

        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
