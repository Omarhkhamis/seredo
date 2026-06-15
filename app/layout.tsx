import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "معرض سيريدو للتطوير والتمليك العقاري",
  description:
    "معرض عقاري واستثماري متخصص يجمع المطورين، المستثمرين، جهات التمويل، والخبراء في منصة واحدة بمدينة جدة.",
  metadataBase: new URL("https://seredoexpo.sa"),
  openGraph: {
    title: "معرض سيريدو للتطوير والتمليك العقاري",
    description:
      "الدورة الخامسة من سيريدو: منصة عقارية متخصصة لعرض المشاريع وبناء الشراكات واستكشاف الفرص الاستثمارية.",
    url: "https://seredoexpo.sa",
    siteName: "SEREDO Expo",
    locale: "ar_SA",
    type: "website",
  },
};

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
