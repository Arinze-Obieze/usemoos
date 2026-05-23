import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";

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
      <html lang="en">
        <body suppressHydrationWarning>{children}</body>
      </html>
    </ClerkProvider>
  );
}
