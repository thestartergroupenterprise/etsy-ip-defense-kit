import type { Metadata } from "next";

// NOTE: Keywords pending DataForSEO validation when funded.
// Primary keyword: "trademark protection for online sellers" (working estimate)
// Supporting: "trademark my shop name", "how to protect your brand online sellers",
//             "trademark monitoring guide ecommerce", "brand protection kit small business"
const STRIPE_P2_PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_P2_PAYMENT_LINK || "#";

export const metadata: Metadata = {
  title: "Trademark Protection Kit for Online Sellers | Seller Defense Kit",
  description:
    "6 fill-in-the-blank tools to document your brand rights, monitor for trademark violations, and file platform reports, before someone else claims your brand name. $47.",
  alternates: {
    canonical: "https://sellerdefensekit.com/trademark-protection-kit",
  },
  openGraph: {
    title: "Trademark Protection Kit for Online Sellers | Seller Defense Kit",
    description:
      "Someone could file a trademark on your brand name before you do. 6 tools to document, monitor, and protect your brand on Etsy, Amazon, Shopify, and beyond.",
    url: "https://sellerdefensekit.com/trademark-protection-kit",
    siteName: "Seller Defense Kit",
    type: "website",
  },
};

export default function TrademarkProtectionKit() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* ── HERO ── */}
      <section className="bg-amber-50 px-5 py-12 md:py-20">
        <div className="max-w-2xl mx-auto text-center">

          <p className="inline-block bg-amber-200 text-amber-900 text-sm font-semibold px-4 py-1 rounded-lg mb-6">
            For independent sellers and small creative businesses selling original work
          </p>

          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-gray-900 mb-5">
            Protect Your Brand Before Someone Else Files a Trademark on It
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto">
            You built the brand. You own the name. But until it is documented and monitored,
            anyone, including a trademark troll, can file a claim on it first.
            Once that happens, you may lose the right to use your own brand name on{" "}
            <span className="font-semibold text-gray-900">every platform you sell on.</span>
          </p>

          <a
            href={STRIPE_P2_PAYMENT_LINK}
            className="inline-block bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xl font-bold px-10 py-5 rounded-xl shadow-lg transition-colors w-full sm:w-auto"
          >
            Get the Trademark Protection Kit ($47)
          </a>

          <p className="text-sm text-gray-500 mt-4">
            30-day money-back guarantee. Instant download.
          </p>
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="px-5 py-14 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            This is happening to sellers right now
          </h2>
          <div className="space-y-5 text-gray-700 text-base md:text-lg leading-relaxed">
            <p>
              A seller builds a shop name that becomes recognizable. Customers start
              searching for it by name. Sales grow. Then someone else, sometimes a
              competitor, sometimes a patent or trademark troll with no legitimate
              claim, files a trademark on that name with the USPTO.
            </p>
            <p>
              Once the trademark is registered to someone else, the original seller gets
              cease and desist letters. Their listings get reported. Their accounts on
              Etsy, Amazon, and Shopify get flagged for trademark infringement, using
              a name they created.
            </p>
            <p>
              The defense is expensive. The disruption is immediate. The brand they spent
              years building is at risk.
            </p>
            <p className="font-semibold text-gray-900">
              The sellers who avoid this outcome are not lucky. They documented their
              rights early, monitored their brand consistently, and had the tools to
              respond when a violation appeared.
            </p>
          </div>
        </div>
      </section>

      {/* ── THE KIT ── */}
      <section className="px-5 py-14 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center">
            Six tools. Everything you need to protect your brand.
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Fill-in-the-blank documents. Plain language. No legal expertise required.
          </p>

          <div className="space-y-5">
            {[
              {
                number: "01",
                title: "Brand Rights Documentation Log",
                description:
                  "A structured log to record dates, evidence, and history of your brand use. Establishes common law trademark rights before formal USPTO registration. Use it to act immediately if someone challenges your name.",
              },
              {
                number: "02",
                title: "Trademark Search and Clearance Checklist",
                description:
                  "Step-by-step process to search USPTO, Google, Etsy, Amazon, and social media before claiming a brand name. Prevents accidental infringement and documents your due diligence. A trademark attorney charges $300–$600/hour for this work.",
              },
              {
                number: "03",
                title: "Marketplace Brand Violation Report Template",
                description:
                  "Fill-in templates for reporting trademark violations on Etsy, Amazon, Temu, AliExpress, and standalone websites. Includes exact field guidance and escalation paths for each platform.",
              },
              {
                number: "04",
                title: "Trademark Monitoring Workflow",
                description:
                  "A weekly 20-minute sweep and monthly deep scan protocol covering all major platforms, USPTO new filings, domain registrations, and image search. Catches infringement early, before a copycat builds sales history under your brand name.",
              },
              {
                number: "05",
                title: "Brand Identity Infringement Evidence Log",
                description:
                  "Structured capture sheet for screenshots, URLs, timestamps, and seller details when infringement is discovered. Required for any enforcement action. The sellers who recover fastest are the ones who documented everything the moment they found it.",
              },
              {
                number: "06",
                title: "Trademark Registration Readiness Checklist",
                description:
                  "Everything you need to gather before filing with the USPTO: specimen photos, dates of first use, goods and services description, filing class selection guidance. Reduces billable attorney hours if you choose to use one.",
              },
            ].map((doc) => (
              <div
                key={doc.number}
                className="flex gap-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100"
              >
                <span className="text-2xl font-extrabold text-amber-400 min-w-[2.5rem]">
                  {doc.number}
                </span>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{doc.title}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{doc.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE ANCHOR ── */}
      <section className="px-5 py-14 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            A trademark attorney charges $300–$600 per hour.
          </h2>
          <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6">
            A full trademark clearance search and filing preparation costs $800 to $1,500
            in professional fees before you even submit the application. The kit gives you
            the documentation tools, the monitoring workflow, and the platform enforcement
            templates for $47, so you can protect what you have built before you need to
            pay a lawyer to defend it.
          </p>
          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            Works for sellers on Etsy, Amazon, Shopify, Temu, AliExpress, and
            independent websites. Platform-agnostic where possible, with platform-specific
            guidance built in for each major marketplace.
          </p>
        </div>
      </section>

      {/* ── CTA BLOCK ── */}
      <section className="px-5 py-10 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <a
            href={STRIPE_P2_PAYMENT_LINK}
            className="inline-block bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xl font-bold px-10 py-5 rounded-xl shadow-lg transition-colors w-full sm:w-auto"
          >
            Get the Trademark Protection Kit ($47)
          </a>
          <p className="text-sm text-gray-500 mt-4">
            Instant download. 30-day money-back guarantee. No subscription.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-5 py-14 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Common questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Do I need a registered trademark to use these tools?",
                a: "No. Most of the tools in the kit work regardless of whether you have a registered trademark. The Brand Rights Documentation Log and Monitoring Workflow are designed specifically for sellers who have not yet registered, documenting common law rights that exist the moment you start using a brand name commercially. The Marketplace Violation Report Template has versions for both registered and unregistered trademark holders.",
              },
              {
                q: "I sell on Etsy. Is this kit for me?",
                a: "Yes, but the kit is not Etsy-specific. It covers Etsy, Amazon, Shopify, Temu, AliExpress, and independent websites with platform-specific guidance for each. If you sell on multiple platforms (or plan to), the monitoring workflow and violation report templates cover all of them.",
              },
              {
                q: "How is this different from the IP Defense Kit?",
                a: "The IP Defense Kit (Product 1) is built around copyright enforcement, specifically DMCA takedown notices for copied listings, photos, and original creative work. The Trademark Protection Kit addresses brand identity: your shop name, logo, and brand recognition. Many sellers need both: copyright protection for their creative work and trademark protection for their brand. They are complementary, not overlapping.",
              },
              {
                q: "Can I use this to file a trademark application myself?",
                a: "Document 6 (Trademark Registration Readiness Checklist) prepares you to file through the USPTO TEAS portal yourself if you choose. The USPTO filing fee is $250 to $350 per class. The kit gives you the preparation tools, not the filing service itself. For complex situations, the checklist also reduces billable attorney time by getting your documentation in order before the first consultation.",
              },
              {
                q: "What if someone already filed a trademark on my brand name?",
                a: "Document 1 (Brand Rights Documentation Log) is your starting point. It helps you build the evidence record of prior use that matters in a dispute. Document 3 (Marketplace Brand Violation Report Template) covers platform-specific enforcement steps. For disputes involving active USPTO applications or registrations, consult a trademark attorney. The kit gives you the documentation foundation; a trademark attorney handles the legal strategy for active disputes.",
              },
              {
                q: "What is the refund policy?",
                a: "30-day money-back guarantee, no questions asked. If the kit does not give you what you needed, email us at thestartergroupenterprise@gmail.com within 30 days of purchase.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF PLACEHOLDER ── */}
      <section className="px-5 py-14 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Used by independent sellers and small creative businesses
          </h2>
          <p className="text-gray-500 text-sm">
            Purchase includes 30-day money-back guarantee.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-amber-700 px-5 py-14 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Someone could file on your brand name tomorrow.
          </h2>
          <p className="text-amber-100 text-lg mb-8">
            Document your rights today. The tools are ready.
          </p>
          <a
            href={STRIPE_P2_PAYMENT_LINK}
            className="inline-block bg-white hover:bg-gray-100 text-amber-600 text-xl font-bold px-10 py-5 rounded-xl shadow-lg transition-colors w-full sm:w-auto"
          >
            Get the Trademark Protection Kit ($47)
          </a>
          <p className="text-amber-200 text-sm mt-4">
            Instant download. 30-day money-back guarantee. No subscription.
          </p>
        </div>
      </section>

    </main>
  );
}
