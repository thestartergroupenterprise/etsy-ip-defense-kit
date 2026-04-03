import { MetadataRoute } from "next";

const BASE_URL = "https://sellerdefensekit.com";

const blogSlugs = [
  "file-dmca-etsy",
  "etsy-listing-stolen",
  "dmca-takedown-notice-etsy-template",
  "copyright-infringement-etsy",
  "etsy-ip-theft",
  "etsy-seller-protection",
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
