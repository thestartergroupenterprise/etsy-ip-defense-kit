import { MetadataRoute } from "next";

const BASE_URL = "https://sellerdefensekit.com";

// Pinned lastmod dates — update when content changes (not on every build)
const HOMEPAGE_LAST_MOD = "2026-04-08";
const BLOG_INDEX_LAST_MOD = "2026-04-08";
const TRADEMARK_KIT_LAST_MOD = "2026-04-08"; // Product 2 landing page

const blogSlugs: { slug: string; lastMod: string }[] = [
  { slug: "file-dmca-etsy", lastMod: "2026-04-04" },
  { slug: "etsy-listing-stolen", lastMod: "2026-04-04" },
  { slug: "dmca-takedown-notice-etsy-template", lastMod: "2026-04-04" },
  { slug: "copyright-infringement-etsy", lastMod: "2026-04-04" },
  { slug: "etsy-ip-theft", lastMod: "2026-04-04" },
  { slug: "etsy-seller-protection", lastMod: "2026-04-04" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(HOMEPAGE_LAST_MOD),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(BLOG_INDEX_LAST_MOD),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/trademark-protection-kit`,
      lastModified: new Date(TRADEMARK_KIT_LAST_MOD),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map(({ slug, lastMod }) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(lastMod),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}
