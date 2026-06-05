/**
 * LocalBusiness structured data (JSON-LD) so Google can show the business
 * name, phone, area served, and rating as a rich result. Rendered site-wide
 * from the root layout.
 */
import { getSiteInfo } from "@/lib/content";

export default async function JsonLd() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const site = await getSiteInfo();
  const tel = (p?: string) =>
    p ? `+1-${p.replace(/[^0-9]/g, "")}` : undefined;

  const data = {
    "@context": "https://schema.org",
    "@type": "PartyEquipmentRentalService",
    name: "Bounce FX Party Rentals",
    image: `${siteUrl}/bounce-fx-logo.png`,
    logo: `${siteUrl}/bounce-fx-logo.png`,
    url: siteUrl,
    email: site.email,
    telephone: tel(site.phones[0]),
    priceRange: "$$",
    description:
      "Inflatable, tent, table and chair rentals serving Fredericksburg, VA and the surrounding DMV. Licensed & insured. Delivery, setup and pickup included.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Fredericksburg",
      addressRegion: "VA",
      postalCode: "22401",
      addressCountry: "US",
    },
    areaServed: [
      "Fredericksburg VA",
      "Stafford VA",
      "Spotsylvania VA",
      "King George VA",
      "Northern Virginia",
      "DMV",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: tel(site.phones[0]),
        contactType: "reservations",
      },
      {
        "@type": "ContactPoint",
        telephone: tel(site.phones[1]),
        contactType: "customer service",
      },
    ],
    sameAs: [site.instagram, site.facebook],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "27",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
