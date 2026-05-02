import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StayStory — Hospitality Intelligence for Hosts",
  description: "Create guest experiences that feel personal, thoughtful, and unforgettable. Smart tools that help you design meaningful moments — without losing the human touch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
