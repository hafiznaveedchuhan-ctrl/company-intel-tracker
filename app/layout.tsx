import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Company Intel — Real-Time Headline Tracker",
  description: "Real-time company news surveillance and analysis powered by Tavily AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
