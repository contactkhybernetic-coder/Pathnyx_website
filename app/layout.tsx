import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Is hisse ko dhoondein aur replace kar dein
export const metadata: Metadata = {
  title: "Pathnyx | Launch Your Store in 60 Seconds", // 👈 Yahan apna title likhein
  description: "Pakistan's #1 E-commerce Builder for Local Businesses",
  icons: {
    icon: "/favicon.ico", // 👈 Agar public folder mein favicon.ico hai toh ye sahi hai
    apple: "/icon.png",   // Mobile users ke liye aapka logo
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
