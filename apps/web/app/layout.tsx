import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "usemoos · The AI knowledge layer for modern organizations",
  description:
    "usemoos centralizes fragmented org knowledge across Slack, Notion, Drive, GitHub, Jira and 12+ other tools. Permission-aware, source-cited, conversational. Join the private beta.",
  icons: {
    icon: "/assets/usemoos_icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body suppressHydrationWarning>{children}</body>
      </html>
    </ClerkProvider>
  );
}
