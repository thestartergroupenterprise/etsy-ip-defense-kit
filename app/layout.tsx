import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Etsy IP Defense Kit — DMCA Templates for Etsy Sellers",
  description:
    "5 fill-in-the-blank templates that let Etsy sellers file a DMCA takedown on any copycat in 15 minutes — without a lawyer, without spinning your wheels.",
  openGraph: {
    title: "Etsy IP Defense Kit — Stop Copycats in 15 Minutes",
    description:
      "5 fill-in-the-blank templates that let Etsy sellers file a DMCA takedown on any copycat in 15 minutes — without a lawyer, without spinning your wheels. For Etsy sellers losing revenue to copycat shops on Etsy, Temu, AliExpress, and Amazon.",
    url: "https://sellerdefensekit.com",
    siteName: "Etsy IP Defense Kit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Etsy IP Defense Kit — Stop Copycats in 15 Minutes",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Etsy IP Defense Kit — Stop Copycats in 15 Minutes",
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
