import type { Metadata } from "next";
import { UTMCaptureClient } from "@/app/components/UTMCaptureClient";

const STRIPE_P4_PAYMENT_LINK = "https://buy.stripe.com/5kQ3cv7PnbqZbXbaXK2Fa03";

export const metadata: Metadata = {
  title: "Escalation Framework | When Your DMCA Gets Ignored | Seller Defense Kit",
  description:
    "7 fillable PDF templates for everything that happens after a DMCA or C&D is ignored. Multi-round escalation, evidence packaging, small claims prep, lawyer handoff, and repeat infringer documentation. $77.",
  alternates: {
    canonical: "https://sellerdefensekit.com/escalation-framework",
  },
  openGraph: {
    title: "Escalation Framework | When Your DMCA Gets Ignored",
    description:
      "7 fillable PDF templates for what comes after an ignored cease and desist. Escalation notices, CCB small claims prep, lawyer handoff documentation, platform re-filing, and repeat infringer logs.",
    url: "https://sellerdefensekit.com/escalation-framework",
    siteName: "Seller Defense Kit",
    type: "website",
    images: [
      {
        url: "https://sellerdefensekit.com/og-p4.png",
        width: 1200,
        height: 630,
        alt: "Escalation Framework",
      },
    ],
  },
};

export default function EscalationFramework() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <UTMCaptureClient />

      {/* ── HERO ── */}
      <section className="bg-amber-50 px-5 py-12 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="inline-block bg-amber-200 text-amber-900 text-sm font-semibold px-4 py-1 rounded-lg mb-6">
            For sellers whose DMCA or cease and desist was ignored
          </p>

          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-gray-900 mb-5">
            They Ignored Your DMCA.{" "}
            <span className="text-amber-600">Here&apos;s What You Do Next.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            7 fillable PDF templates for everything that happens after the first notice fails.
            Escalation letters, evidence packaging, CCB small claims prep, lawyer handoff
            documentation, platform re-filing, and repeat infringer logs.
          </p>

          {/* Price Anchor */}
          <p className="text-base text-gray-700 mb-8 font-semibold">
            A single attorney-drafted escalation letter costs{" "}
            <span className="text-amber-600">$300&ndash;$800</span>. This entire kit is $77.
          </p>

          {/* Primary CTA */}
          <a
            href={STRIPE_P4_PAYMENT_LINK}
            className="inline-block bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xl font-bold px-10 py-5 rounded-xl shadow-lg transition-colors w-full sm:w-auto mb-4"
          >
            Get the Escalation Framework ($77)
          </a>

          <p className="text-sm text-gray-500">
            30-day money-back guarantee. Instant download.
          </p>
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="px-5 py-14 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            Sending the First Notice Is the Easy Part
          </h2>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
            <h3 className="font-bold text-lg text-gray-900 mb-2">
              Most copycats ignore the first DMCA
            </h3>
            <p className="text-gray-600">
              Overseas sellers, anonymous shops, and determined infringers routinely ignore DMCA
              takedowns and cease and desist letters, especially when they&apos;re operating on
              foreign hosting or behind anonymous storefronts. The first notice puts them on notice.
              The escalation is what actually forces action.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
            <h3 className="font-bold text-lg text-gray-900 mb-2">
              Platforms don&apos;t always act on the first report
            </h3>
            <p className="text-gray-600">
              Etsy, Amazon, and other platforms receive thousands of IP complaints per day.
              First-time reports often get generic responses or no action at all. A second filing
              that cites the original complaint ticket, references repeat infringement policy,
              and invokes DMCA safe harbor loss gets treated differently than a first report.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="font-bold text-lg text-gray-900 mb-2">
              Without a documented escalation path, you lose momentum
            </h3>
            <p className="text-gray-600">
              Sellers who&apos;ve had their DMCA ignored often don&apos;t know what comes next.
              They either give up, or spend $400+ on an attorney consultation just to learn the
              steps. This kit maps out every escalation option, with the documents to execute each one.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section className="px-5 py-14 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-900">
            7 Fillable Templates for Every Escalation Stage
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Fill-in-the-blank forms. No legal expertise required. 720 interactive fields total.
          </p>

          <div className="space-y-4">
            {[
              {
                number: "01",
                name: "Escalation Notice Letter",
                description:
                  "Your formal second notice. Cites the ignored first notice, invokes willful infringement liability, and sets a hard deadline with documented consequences. Includes evidence attachment list and delivery tracking section.",
                fields: "79 fillable fields",
              },
              {
                number: "02",
                name: "Evidence Packaging Checklist",
                description:
                  "40-row file index and four-category evidence checklist (original work proof, infringement documentation, prior notice proof, financial impact). Ensures your evidence package is court-ready before you file anywhere.",
                fields: "188 fillable fields",
              },
              {
                number: "03",
                name: "Small Claims Court Preparation",
                description:
                  "Complete CCB (Copyright Claims Board) and state small claims preparation. Includes claimant and respondent info, claims selection, damage calculation, 20-item pre-filing checklist, and a 12-event chronological timeline.",
                fields: "91 fillable fields",
              },
              {
                number: "04",
                name: "Lawyer Handoff Documentation",
                description:
                  "Everything an IP attorney needs in one document: your contact info, what services you need, the infringed work, the infringement details, prior actions taken, evidence summary, budget, and a pre-filled list of questions to ask.",
                fields: "71 fillable fields",
              },
              {
                number: "05",
                name: "Platform Re-Filing Template",
                description:
                  "Second complaint to any platform citing the original ticket number, repeat infringement policy, and DMCA safe harbor risk. Includes platform-specific re-filing notes for Etsy, Amazon, eBay, Shopify, and TikTok Shop.",
                fields: "52 fillable fields",
              },
              {
                number: "06",
                name: "Escalation Decision Tree",
                description:
                  "A structured assessment that determines the right next action for your specific situation: stage, infringer profile, damage level, platform responsiveness. Includes a 14-entry action log for tracking your escalation history.",
                fields: "87 fillable fields",
              },
              {
                number: "07",
                name: "Repeat Infringer Documentation Log",
                description:
                  "Track up to 11 incidents from the same infringer. Includes pattern analysis, legal implications checklist, quantitative summary, and pattern description language ready to paste into a CCB filing or court document.",
                fields: "152 fillable fields",
              },
            ].map((template) => (
              <div
                key={template.number}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-extrabold text-amber-600 flex-shrink-0 w-10">
                    {template.number}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{template.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{template.description}</p>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      {template.fields}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                Sellers whose first DMCA or C&amp;D produced no action
              </h3>
              <p className="text-gray-600">
                If you sent a takedown notice and the infringer is still selling your work, this kit
                is your next step. The second notice is legally different from the first: it
                establishes willfulness, which increases potential damages from $750 to $150,000 per
                work under federal copyright law.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Sellers dealing with overseas or anonymous infringers
              </h3>
              <p className="text-gray-600">
                China-based and anonymous sellers rarely respond to the first notice. But platforms
                have repeat infringer policies, payment processors have fraud mechanisms, and the
                Copyright Claims Board can handle cases even against anonymous sellers. This kit
                maps all of it.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Sellers preparing to involve an attorney
              </h3>
              <p className="text-gray-600">
                Even if you&apos;re not going to court yourself, the Lawyer Handoff Documentation
                template lets you walk into any IP attorney consultation fully prepared. Attorneys
                charge $400&ndash;$800/hour. A prepared client gets better advice in less time.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Sellers facing a repeat infringer: same design stolen multiple times
              </h3>
              <p className="text-gray-600">
                Pattern evidence is legally significant. A single infringement is an incident.
                Three infringements from the same seller is a pattern. The Repeat Infringer
                Documentation Log tracks up to 11 incidents and generates the pattern summary
                language used in CCB filings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-5 py-14 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center">
            Questions Sellers Ask After Their DMCA Gets Ignored
          </h2>

          <div className="space-y-6">
            {/* All 6 questions sourced from r/Etsy, r/EtsySellers, r/smallbusiness Reddit threads */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">
                My DMCA was filed 2 weeks ago and the listing is still up. What do I do?
              </h3>
              <p className="text-gray-600 text-sm">
                First, screenshot everything again today. You need dated proof the infringement
                is ongoing after notice. Then send an escalation notice (Document 1 in this kit)
                and re-file with the platform using Document 5, which cites your original ticket
                number and invokes the platform&apos;s repeat infringer policy. Platforms treat
                second filings with case numbers differently than first reports.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">
                The infringer is in China. Is there any point escalating?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, through the platform, not through the infringer. Platforms have repeat
                infringer policies that can result in account suspension regardless of where the
                seller is located. Payment processor complaints (PayPal, Stripe, Etsy Payments)
                are also effective for overseas sellers. Legal action against the individual is
                usually not worth pursuing, but platform-level escalation often produces results.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">
                The infringer filed a counter-notice. Now what?
              </h3>
              <p className="text-gray-600 text-sm">
                A counter-notice means the infringer is claiming they have a right to use your
                work. The platform will typically reinstate the content in 10&ndash;14 business days
                unless you file a lawsuit to keep it down. At this stage, escalating to an attorney
                (Document 4) is the appropriate step. The Lawyer Handoff template prepares
                everything your attorney needs to move quickly.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">
                Do I need a copyright registration to file with the Copyright Claims Board?
              </h3>
              <p className="text-gray-600 text-sm">
                No, unregistered works can be filed with the CCB. However, registered works
                have access to statutory damages of up to $30,000 per work (vs. only actual damages
                for unregistered works). The CCB is free to start ($100 filing fee) and handles
                claims up to $30,000 without requiring a lawyer. Document 3 in this kit walks you
                through the complete CCB pre-filing checklist.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">
                I&apos;ve sold over $2 million on the platform and they&apos;re just ignoring my infringement report. Is this normal?
              </h3>
              <p className="text-gray-600 text-sm">
                Unfortunately, yes, platform support is often generic and unresponsive to
                first reports, regardless of your seller status. The difference is in how you
                escalate. A second filing that explicitly references your original case number,
                cites the platform&apos;s repeat infringer policy, and mentions DMCA safe harbor
                implications gets reviewed at a different level than a first report. Document 5
                is designed exactly for this situation.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">
                The copycat keeps re-listing the same design after I get them taken down. How do I stop it?
              </h3>
              <p className="text-gray-600 text-sm">
                Re-listing after removal is evidence of willful infringement, which increases your
                potential damages and makes a CCB case much stronger. Document 7 (Repeat Infringer
                Log) tracks every re-listing incident with dates, URLs, and screenshots. Once you
                have 3 or more documented re-listings, you have strong grounds for a CCB case
                and potentially an injunction. The log also generates the pattern summary language
                that CCB judges and IP attorneys specifically look for.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">
                What&apos;s the difference between small claims court and the Copyright Claims Board?
              </h3>
              <p className="text-gray-600 text-sm">
                State small claims court handles money claims under your state&apos;s limit
                (typically $5,000&ndash;$25,000) and covers copyright claims as property damage.
                The Copyright Claims Board (CCB) is a federal tribunal specifically designed for
                copyright claims up to $30,000 per work, with no lawyer required. The CCB is
                usually better for copyright cases because it understands copyright law, can award
                statutory damages, and doesn&apos;t require proving actual financial loss.
                Document 3 covers both options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECOND CTA ── */}
      <section className="bg-amber-50 px-5 py-14">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Stop Watching the Listing Stay Up
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Every day the infringement stays live is another day of lost revenue and diluted brand
            value. You&apos;ve already sent the first notice. This kit handles everything that comes after.
          </p>

          <div className="bg-white rounded-xl p-6 border border-amber-200 mb-8 text-left max-w-md mx-auto">
            <p className="font-semibold text-gray-900 mb-3">Escalation Framework includes:</p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold flex-shrink-0">+</span>
                <span>Escalation Notice Letter (second notice, legally distinct from first)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold flex-shrink-0">+</span>
                <span>Evidence Packaging Checklist (40-item file index, court-ready)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold flex-shrink-0">+</span>
                <span>Small Claims Court / CCB Preparation (complete filing guide)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold flex-shrink-0">+</span>
                <span>Lawyer Handoff Documentation (saves $200-$400 in consultation time)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold flex-shrink-0">+</span>
                <span>Platform Re-Filing Template (for 5 major platforms)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold flex-shrink-0">+</span>
                <span>Escalation Decision Tree (know exactly what to do next)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold flex-shrink-0">+</span>
                <span>Repeat Infringer Documentation Log (tracks 11 incidents)</span>
              </li>
            </ul>
          </div>

          <a
            href={STRIPE_P4_PAYMENT_LINK}
            className="inline-block bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xl font-bold px-10 py-5 rounded-xl shadow-lg transition-colors w-full sm:w-auto mb-4"
          >
            Get the Escalation Framework ($77)
          </a>

          <p className="text-sm text-gray-500">
            Instant download. 30-day money-back guarantee.
          </p>
        </div>
      </section>
    </main>
  );
}
