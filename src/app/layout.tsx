import type { Metadata } from "next";
import { Montserrat, Fraunces } from "next/font/google";
import "./globals.css";

// Body copy and UI.
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Editorial headlines. Warm and modern rather than a traditional hotel serif.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

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
    <html lang="en" className={`h-full antialiased ${montserrat.variable} ${fraunces.variable}`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
