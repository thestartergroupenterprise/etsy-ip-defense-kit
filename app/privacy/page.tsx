import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Seller Defense Kit",
  description: "Privacy policy for sellerdefensekit.com.",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* Header */}
      <header className="bg-amber-50 px-5 py-8 border-b border-amber-100">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
            &larr; Back to Seller Defense Kit
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="px-5 py-12">
        <div className="max-w-2xl mx-auto">

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-10">Effective date: March 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">What data we collect</h2>
              <p className="text-gray-600 leading-relaxed">
                We collect only the information necessary to process your purchase and deliver your order.
                This is limited to your email address, which is provided at checkout and handled by our
                payment processor. We do not collect names, mailing addresses, phone numbers, or any
                other personal information beyond what is required for order fulfillment.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">How we use your data</h2>
              <p className="text-gray-600 leading-relaxed">
                Your email address is used solely for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2 ml-2">
                <li>Delivering your download link immediately after purchase</li>
                <li>Sending transactional email communications related to your order (such as delivery confirmations or support responses)</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-3">
                We do not use your email address for marketing, newsletters, or any other purpose unless
                you explicitly opt in. We do not build audience profiles or engage in behavioral tracking
                beyond standard analytics described below.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Third-party services</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                We use the following third-party services to operate this site:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                <li>
                  <span className="font-medium text-gray-800">Stripe</span>, payment processing.
                  Your payment details are entered directly on Stripe&apos;s secure checkout and are
                  never transmitted to or stored on our servers. Stripe&apos;s privacy policy is
                  available at{" "}
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-700 underline">
                    stripe.com/privacy
                  </a>.
                </li>
                <li>
                  <span className="font-medium text-gray-800">Resend</span>, transactional email
                  delivery. Your email address is passed to Resend for the sole purpose of delivering
                  your order confirmation and download link. Resend&apos;s privacy policy is available
                  at{" "}
                  <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-700 underline">
                    resend.com/privacy
                  </a>.
                </li>
                <li>
                  <span className="font-medium text-gray-800">Google Analytics</span>, anonymous
                  site analytics (page views, sessions, traffic sources). No personally identifiable
                  information is collected through analytics.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">We do not sell your data</h2>
              <p className="text-gray-600 leading-relaxed">
                We do not sell, rent, trade, or otherwise transfer your personal information to any
                third party for marketing or commercial purposes. Your data is used only to fulfill
                your order and is not shared beyond the service providers listed above.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Data retention</h2>
              <p className="text-gray-600 leading-relaxed">
                We retain your email address only as long as necessary to fulfill your order and
                respond to any support requests. We do not maintain long-term customer databases
                beyond what is held by our payment and email delivery providers.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Your rights</h2>
              <p className="text-gray-600 leading-relaxed">
                You may request deletion of your data at any time by contacting us at the email
                address below. We will acknowledge your request and action it promptly.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about this policy or how your data is handled, please contact
                us at{" "}
                <a href="mailto:hello@sellerdefensekit.com"
                  className="text-amber-600 hover:text-amber-700 underline">
                  hello@sellerdefensekit.com
                </a>.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}

    </main>
  );
}
