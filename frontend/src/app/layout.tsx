import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/contexts/ProfileContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI News Intel — Real-time Tech & AI News",
  description: "AI-powered news curation with trending topics, category filters, and personalised alerts.",
  keywords: "AI news, tech news, trending, machine learning, startups, security",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </body>
    </html>
  );
}
