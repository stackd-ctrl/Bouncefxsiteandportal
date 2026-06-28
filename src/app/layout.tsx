import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import MobileBookBar from "@/components/MobileBookBar";
import PartyChat from "@/components/PartyChat";
import { readContent } from "@/lib/content";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Bounce FX Party Rentals — Party Vibes Made Easy",
    template: "%s · Bounce FX Party Rentals",
  },
  description:
    "Inflatables, tents, tables & chairs for unforgettable events in Fredericksburg, VA and the DMV. Browse rentals, check availability, and book online with an easy deposit.",
  keywords: [
    "party rentals Fredericksburg VA",
    "bounce house rental DMV",
    "inflatable rentals",
    "tent rentals",
    "table and chair rentals",
  ],
  openGraph: {
    title: "Bounce FX Party Rentals — Party Vibes Made Easy",
    description:
      "Inflatables, tents, tables & chairs for unforgettable events in Fredericksburg, VA and the DMV.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { site, media, pages } = await readContent();
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-party-cream font-body antialiased">
        <JsonLd />
        <Reveal />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer site={site} logo={media.logo} footer={pages.footer} />
        <MobileBookBar />
        <PartyChat />
      </body>
    </html>
  );
}
