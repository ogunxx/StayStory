import type { Metadata } from "next";
import { Montserrat, Fraunces } from "next/font/google";
import {
  JsonLd,
  SITE_NAME,
  SITE_URL,
  TITLE_TEMPLATE,
  organizationSchema,
  websiteSchema,
} from "@/lib/seo";
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

/**
 * Site-wide defaults. `metadataBase` is what makes every page's canonical and
 * Open Graph URL resolve to an absolute address; without it Next emits
 * relative ones and search engines can't use them.
 *
 * The title template means a page sets only its own subject — "Pricing" —
 * and the brand is appended consistently.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "StayStory — Guest Experience Design for Hospitality",
    template: TITLE_TEMPLATE,
  },
  description:
    "StayStory helps hosts intentionally design the guest journey — from what guests first encounter to what they remember afterwards.",
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // scroll-pt-24 keeps in-page anchors from landing underneath the sticky
    // header; scroll-smooth makes jumping to one feel deliberate rather than
    // abrupt.
    <html
      lang="en"
      className={`h-full scroll-smooth scroll-pt-24 antialiased ${montserrat.variable} ${fraunces.variable}`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Who StayStory is and what this site is — stated once, site-wide. */}
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        {children}
      </body>
    </html>
  );
}
