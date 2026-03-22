import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Etsy IP & DMCA Help — Blog | Seller Defense Kit",
  description:
    "Expert guides for Etsy sellers on DMCA takedowns, copyright infringement reporting, and fighting IP theft. Protect your shop with the right tools.",
  openGraph: {
    title: "Etsy IP & DMCA Help — Blog | Seller Defense Kit",
    description:
      "Expert guides for Etsy sellers on DMCA takedowns, copyright infringement reporting, and fighting IP theft.",
    url: "https://sellerdefensekit.com/blog",
  },
};

export default function BlogIndex() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="bg-amber-50 border-b border-amber-100 px-5 py-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-900 hover:text-amber-600 transition-colors">
            Seller Defense Kit
          </Link>
          <nav className="flex gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <Link href="/blog" className="text-amber-600 font-semibold">Blog</Link>
            <Link
              href="https://buy.stripe.com/bJe6oH7PnfHfbXbc1O2Fa00"
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              Get the Kit — $27
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-amber-50 px-5 py-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-3">Resources for Etsy Sellers</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Etsy IP &amp; DMCA Guides
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Step-by-step guides to filing DMCA takedowns, reporting copyright infringement, and fighting back against copycats — written for Etsy sellers who need real answers, not legal runaround.
          </p>
        </div>
      </section>

      {/* Article List */}
      <section className="px-5 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="border border-gray-200 rounded-xl p-6 hover:border-amber-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-amber-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">{post.intro}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700 transition-colors text-sm"
                >
                  Read article →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-amber-50 border-t border-amber-100 px-5 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Protect Your Shop?</h2>
          <p className="text-gray-600 mb-6">
            The Etsy IP Defense Kit includes 5 fill-in-the-blank templates so you can file takedowns in minutes, not hours.
          </p>
          <a
            href="https://buy.stripe.com/bJe6oH7PnfHfbXbc1O2Fa00"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-xl shadow-md transition-colors"
          >
            Get the Kit — $27
          </a>
          <p className="text-sm text-gray-500 mt-3">Instant download. No account needed.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-8 border-t border-gray-100">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Seller Defense Kit. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-gray-700 transition-colors">Blog</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
