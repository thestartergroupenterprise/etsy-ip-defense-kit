import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly bundle the download ZIP with the serverless function.
  // outputFileTracingIncludes ensures Vercel includes _files/ in the
  // function container — without it, fs.readFile fails in production
  // because public/ files go to the CDN, not the function filesystem.
  outputFileTracingIncludes: {
    "/api/download/[token]": ["./_files/**"],
  },

  // 301 redirects for SEO slug migration (stop-word cleanup 2026-03-22)
  // and www -> non-www canonical redirect (added 2026-04-08)
  async redirects() {
    return [
      // www -> non-www: eliminates duplicate content on https://www.sellerdefensekit.com
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sellerdefensekit.com" }],
        destination: "https://sellerdefensekit.com/:path*",
        permanent: true,
      },
      {
        source: "/blog/how-to-file-dmca-on-etsy",
        destination: "/blog/file-dmca-etsy",
        permanent: true,
      },
      {
        source: "/blog/etsy-listing-stolen-what-to-do",
        destination: "/blog/etsy-listing-stolen",
        permanent: true,
      },
      {
        source: "/blog/how-to-report-copyright-infringement-on-etsy",
        destination: "/blog/copyright-infringement-etsy",
        permanent: true,
      },
      {
        source: "/blog/etsy-ip-theft-how-to-fight-back",
        destination: "/blog/etsy-ip-theft",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
