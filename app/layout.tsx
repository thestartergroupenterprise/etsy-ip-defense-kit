import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Seller Defense Kit — DMCA Templates for Independent Sellers",
  description:
    "5 fill-in-the-blank templates that let Etsy sellers file a DMCA takedown on any copycat in 15 minutes — without a lawyer, without spinning your wheels.",
  openGraph: {
    title: "Seller Defense Kit — Stop Copycats in 15 Minutes",
    description:
      "5 fill-in-the-blank templates that let Etsy sellers file a DMCA takedown on any copycat in 15 minutes — without a lawyer, without spinning your wheels. For Etsy sellers losing revenue to copycat shops on Etsy, Temu, AliExpress, and Amazon.",
    url: "https://sellerdefensekit.com",
    siteName: "Seller Defense Kit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Seller Defense Kit — Stop Copycats in 15 Minutes",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seller Defense Kit — Stop Copycats in 15 Minutes",
    description:
      "5 fill-in-the-blank templates that let Etsy sellers file a DMCA takedown on any copycat in 15 minutes — without a lawyer.",
    images: ["/og-image.png"],
  },
  metadataBase: new URL("https://sellerdefensekit.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TSLSGCB5QX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-TSLSGCB5QX');
        `}</Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
