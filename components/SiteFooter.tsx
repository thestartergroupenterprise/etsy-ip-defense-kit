import Link from "next/link";

/**
 * SiteFooter, shared footer component.
 * Protection Kits list grows progressively with each new product launch.
 * Add each new product to the Protection Kits section when it goes PAGE_LIVE.
 * Do not add placeholders.
 *
 * UTM parameters follow the pattern:
 *   utm_source=footer&utm_medium=website&utm_campaign=product-suite
 */
export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm px-5 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Protection Kits, grows with each product launch */}
        <div className="mb-6">
          <p className="text-gray-300 font-semibold text-xs uppercase tracking-widest mb-3">
            Protection Kits
          </p>
          <ul className="space-y-2">
            <li>
              <Link
                href="/?utm_source=footer&utm_medium=website&utm_campaign=product-suite"
                className="text-amber-400 hover:text-amber-300 transition-colors"
              >
                DMCA Enforcement Kit ($27)
              </Link>
            </li>
            <li>
              <Link
                href="/trademark-protection-kit?utm_source=footer&utm_medium=website&utm_campaign=product-suite"
                className="text-amber-400 hover:text-amber-300 transition-colors"
              >
                Trademark Protection Kit ($47)
              </Link>
            </li>
            {/* Add Product 3 here when PAGE_LIVE: Platform-Specific Filing Toolkit ($67) */}
            {/* Add Product 4 here when PAGE_LIVE: Cease and Desist Templates ($77) */}
            {/* Add Product 5 here when PAGE_LIVE: Complete IP Protection Vault ($97) */}
          </ul>
        </div>

        {/* Nav links */}
        <div className="mb-6 flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/blog" className="text-amber-400 hover:text-amber-300 transition-colors">
            Blog
          </Link>
          <Link href="/privacy" className="text-amber-400 hover:text-amber-300 transition-colors">
            Privacy Policy
          </Link>
          <a
            href="mailto:hello@sellerdefensekit.com"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            Support
          </a>
        </div>

        <p className="text-xs text-gray-500">
          Seller Defense Kit, a product of The Starter Group. 2967 Dundas St W, Toronto, ON M6P 1Z2, Canada.
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Not legal advice. These templates are provided for informational purposes. For complex IP disputes, consult a qualified attorney.
        </p>
      </div>
    </footer>
  );
}
