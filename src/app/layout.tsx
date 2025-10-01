import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";

import "./globals.css";

const geistSans = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Sefro Crypto App",
  description: "Sefro Crypto App Developed with Nextjs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${geistSans.variable} bg-gray-950 text-blue-50`}>{children}</body>
    </html>
  );
}
