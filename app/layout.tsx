import type { Metadata } from "next";
import { getSiteContent } from "@/lib/site-content";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();

  return {
    title: site.metadata.title,
    description: site.metadata.description,
    metadataBase: new URL(site.links.site),
    openGraph: {
      title: site.metadata.openGraphTitle,
      description: site.metadata.openGraphDescription,
      url: site.links.site,
      siteName: "SEREDO Expo",
      locale: "ar_SA",
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
