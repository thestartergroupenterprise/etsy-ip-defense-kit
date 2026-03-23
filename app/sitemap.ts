import { MetadataRoute } from "next";

const BASE_URL = "https://sellerdefensekit.com";

const blogSlugs = [
  "how-to-file-dmca-on-etsy",
  "etsy-listing-stolen-what-to-do",
  "dmca-takedown-notice-etsy-template",
  "how-to-report-copyright-infringement-on-etsy",
  "etsy-ip-theft-how-to-fight-back",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}
