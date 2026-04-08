import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getAllBlogSlugs, blogPosts } from "@/lib/blog-posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  const ogImage = `https://sellerdefensekit.com/og-image.png`;
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: {
      canonical: `https://sellerdefensekit.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `https://sellerdefensekit.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      siteName: "Seller Defense Kit",
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.metaTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  // Related posts (exclude current)
  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  // Ensure dates include timezone for valid schema (ISO 8601 with Z suffix)
  const toISODate = (d: string) =>
    d.includes("T") ? d : `${d}T00:00:00+00:00`;

  // Article schema (JSON-LD)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.metaDescription,
    "datePublished": toISODate(post.date),
    "dateModified": toISODate(post.date),
    "image": "https://sellerdefensekit.com/og-image.png",
    "author": {
      "@type": "Organization",
      "name": "Seller Defense Kit",
      "url": "https://sellerdefensekit.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Seller Defense Kit",
      "url": "https://sellerdefensekit.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sellerdefensekit.com/og-image.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://sellerdefensekit.com/blog/${post.slug}`
    }
  };

  // FAQ schema (JSON-LD)
  const faqSchema = post.faq && post.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faq.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  } : null;

  // HowTo schema (JSON-LD)
  const howToSchema = post.steps && post.steps.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": post.title,
    "description": post.metaDescription,
    "step": post.steps.map((step, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": step.name,
      "text": step.text
    }))
  } : null;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* FAQ Schema */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* HowTo Schema */}
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}

      {/* Header */}
      <header className="bg-amber-50 border-b border-amber-100 px-5 py-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-900 hover:text-amber-600 transition-colors">
            Seller Defense Kit
          </Link>
          <nav className="flex gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-amber-600 transition-colors">Blog</Link>
            <Link
              href="https://buy.stripe.com/bJe6oH7PnfHfbXbc1O2Fa00"
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              Get the IP Defense Kit ($27)
            </Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="max-w-3xl mx-auto text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/blog" className="hover:text-gray-700">Blog</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700 truncate">{post.title}</span>
        </div>
      </div>

      {/* Article */}
      <article className="px-5 py-10 md:py-14">
        <div className="max-w-3xl mx-auto">
          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
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

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Intro */}
          <p className="text-lg text-gray-600 leading-relaxed mb-8 border-l-4 border-amber-400 pl-5 bg-amber-50 py-4 pr-4 rounded-r-lg">
            {post.intro}
          </p>

          {/* Content */}
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Key Takeaway Box */}
          {post.keyTakeaway && (
            <div className="mt-10 bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-amber-900 mb-3">Key Takeaway</h2>
              <p className="text-amber-800 leading-relaxed">{post.keyTakeaway}</p>
            </div>
          )}

          {/* FAQ Section */}
          {post.faq && post.faq.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {post.faq.map((item, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Divider */}
          <hr className="my-10 border-gray-200" />

          {/* Back to blog */}
          <Link
            href="/blog"
            className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700 transition-colors"
          >
            ← Back to all articles
          </Link>
        </div>
      </article>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100 px-5 py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-amber-300 hover:shadow-sm transition-all"
                >
                  <p className="font-semibold text-gray-900 text-sm leading-snug mb-2">{r.title}</p>
                  <p className="text-xs text-amber-600 font-medium">Read →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-amber-50 border-t border-amber-100 px-5 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Protect Your Original Work?</h2>
          <p className="text-gray-600 mb-6">
            Seller Defense Kit includes 5 fill-in-the-blank templates so independent sellers and small creative businesses can file takedowns in minutes, not hours. Works for any platform or standalone website.
          </p>
          <a
            href="https://buy.stripe.com/bJe6oH7PnfHfbXbc1O2Fa00"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-4 rounded-xl shadow-md transition-colors"
          >
            Get the IP Defense Kit -- $27
          </a>
          <p className="text-sm text-gray-500 mt-3">Instant download. No account needed.</p>
        </div>
      </section>

      {/* Footer */}
    </main>
  );
}
