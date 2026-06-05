export interface CityInfo {
  slug: string;
  name: string;
  miles: number; // approx driving miles from Fredericksburg 22401
  freeDelivery: boolean;
  blurb: string;
}

/** Local service areas — each generates an SEO landing page. */
export const CITIES: CityInfo[] = [
  {
    slug: "fredericksburg-va",
    name: "Fredericksburg",
    miles: 0,
    freeDelivery: true,
    blurb:
      "Our home base. From Central Park to historic downtown backyards, we deliver bounce houses, tents, tables and chairs all over Fredericksburg.",
  },
  {
    slug: "spotsylvania-va",
    name: "Spotsylvania",
    miles: 8,
    freeDelivery: true,
    blurb:
      "Birthday parties, church festivals and HOA events across Spotsylvania County — delivered, set up, and picked up with free local delivery.",
  },
  {
    slug: "stafford-va",
    name: "Stafford",
    miles: 12,
    freeDelivery: true,
    blurb:
      "Serving Stafford neighborhoods, schools and ball fields with clean, safe inflatables and party rentals — and free delivery inside our zone.",
  },
  {
    slug: "king-george-va",
    name: "King George",
    miles: 18,
    freeDelivery: false,
    blurb:
      "We bring the party to King George — bounce houses, slides and tents for backyard birthdays and community days, with low flat-rate delivery.",
  },
  {
    slug: "woodbridge-va",
    name: "Woodbridge",
    miles: 28,
    freeDelivery: false,
    blurb:
      "Big-event ready for Woodbridge and eastern Prince William — slides, the Grand Party Dome, tents and seating for crowds of any size.",
  },
  {
    slug: "manassas-va",
    name: "Manassas",
    miles: 35,
    freeDelivery: false,
    blurb:
      "Reliable party and inflatable rentals for Manassas birthdays, school field days and corporate family events across Northern Virginia.",
  },
  {
    slug: "culpeper-va",
    name: "Culpeper",
    miles: 30,
    freeDelivery: false,
    blurb:
      "From downtown Culpeper to the countryside, we deliver inflatables, tents and seating to make your celebration effortless.",
  },
];

export function getCity(slug: string): CityInfo | undefined {
  return CITIES.find((c) => c.slug === slug);
}
