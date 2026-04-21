import Link from "next/link";

/**
 * SiteFooter — shared global footer, rendered by app/layout.tsx.
 *
 * Layout (all rows centered):
 *   Row 1: "PROTECTION KITS" label
 *   Row 2: Product links separated by |, growing horizontally with each launch
 *   Row 3: Blog · Privacy Policy · Support
 *   Row 4: Company name and address
 *   Row 5: Legal disclaimer
 *
 * When adding a new product: append another pipe-separated <Link> to Row 2.
 * Do not add placeholders for unreleased products.
 *
 * UTM pattern: utm_source=footer&utm_medium=website&utm_campaign=product-suite
 */
export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm px-5 py-10 text-center">
      <div className="max-w-3xl mx-auto">

        {/* Row 1: Section label */}
        <p className="text-gray-300 font-semibold text-xs uppercase tracking-widest mb-2">
          Protection Kits
        </p>

        {/* Row 2: Products — pipe-separated, horizontal, grows with each launch */}
        <p className="mb-6">
          <Link
            href="/?utm_source=footer&utm_medium=website&utm_campaign=product-suite"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            DMCA Enforcement Kit ($27)
          </Link>
          <span className="text-gray-600 mx-2">|</span>
          <Link
            href="/trademark-protection-kit?utm_source=footer&utm_medium=website&utm_campaign=product-suite"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            Trademark Protection Kit ($47)
          </Link>
          <span className="text-gray-600 mx-2">|</span>
          <Link
            href="/platform-ip-kit?utm_source=footer&utm_medium=website&utm_campaign=product-suite"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            Platform IP Enforcement Kit ($67)
          </Link>
          <span className="text-gray-600 mx-2">|</span>
          <Link
            href="/escalation-framework?utm_source=footer&utm_medium=website&utm_campaign=product-suite"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            Escalation Framework ($77)
          </Link>
        </p>

        {/* Row 3: Nav links — dot-separated */}
        <p className="mb-6">
          <Link href="/blog" className="text-amber-400 hover:text-amber-300 transition-colors">
            Blog
          </Link>
          <span className="text-gray-600 mx-2">·</span>
          <Link href="/privacy" className="text-amber-400 hover:text-amber-300 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-gray-600 mx-2">·</span>
          <a
            href="mailto:hello@sellerdefensekit.com"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            Support
          </a>
        </p>

        {/* Row 4: Copyright */}
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Seller Defense Kit, a product of The Starter Group. All rights reserved.
        </p>

        {/* Row 5: Address */}
        <p className="text-xs text-gray-500 mt-1">
          2967 Dundas St W, Toronto, ON M6P 1Z2, Canada.
        </p>

        {/* Row 6: Legal disclaimer */}
        <p className="text-xs text-gray-600 mt-1">
          Not legal advice. These templates are provided for informational purposes. For complex IP disputes, consult a qualified attorney.
        </p>

      </div>
    </footer>
  );
}
