export interface CityInfo {
  slug: string;
  name: string;
  state: string; // "VA" | "MD" | "DC"
  miles: number; // approx driving miles from Fredericksburg 22401
  freeDelivery: boolean;
  blurb: string;
}

/**
 * Service areas — each generates an SEO landing page. We deliver roughly within
 * a 100-mile radius of Fredericksburg (22401): all of the Northern Virginia /
 * Richmond corridor, Washington DC, and the Maryland suburbs. Free delivery is
 * inside our 15-mile local zone; everywhere else is a low flat per-mile rate.
 * Listed alphabetically by city name.
 */
export const CITIES: CityInfo[] = [
  {
    slug: "alexandria-va",
    name: "Alexandria",
    state: "VA",
    miles: 50,
    freeDelivery: false,
    blurb:
      "From Old Town to the West End, we deliver bounce houses and party rentals throughout Alexandria — setup and pickup included.",
  },
  {
    slug: "annapolis-md",
    name: "Annapolis",
    state: "MD",
    miles: 85,
    freeDelivery: false,
    blurb:
      "We deliver inflatables, tents and seating to Annapolis and Anne Arundel County for waterfront parties and big celebrations.",
  },
  {
    slug: "arlington-va",
    name: "Arlington",
    state: "VA",
    miles: 55,
    freeDelivery: false,
    blurb:
      "Party and inflatable rentals for Arlington backyards, parks and community events — we handle delivery, setup and pickup.",
  },
  {
    slug: "ashland-va",
    name: "Ashland",
    state: "VA",
    miles: 45,
    freeDelivery: false,
    blurb:
      "Party rentals for Ashland and northern Hanover County — inflatables, tents and seating delivered right to your celebration.",
  },
  {
    slug: "baltimore-md",
    name: "Baltimore",
    state: "MD",
    miles: 95,
    freeDelivery: false,
    blurb:
      "At the edge of our service area — we bring bounce houses, tents and party rentals to Baltimore and the surrounding suburbs.",
  },
  {
    slug: "bethesda-md",
    name: "Bethesda",
    state: "MD",
    miles: 60,
    freeDelivery: false,
    blurb:
      "Inflatables, tents and full party setups for Bethesda and Rockville birthdays, school days and corporate family events.",
  },
  {
    slug: "bowie-md",
    name: "Bowie",
    state: "MD",
    miles: 72,
    freeDelivery: false,
    blurb:
      "Bounce houses, water slides and party rentals for Bowie birthdays, school events and community days in Prince George's County.",
  },
  {
    slug: "bowling-green-va",
    name: "Bowling Green",
    state: "VA",
    miles: 20,
    freeDelivery: false,
    blurb:
      "Inflatables, tents and seating for Bowling Green and Caroline County celebrations — delivered and set up so you can just enjoy the day.",
  },
  {
    slug: "centreville-va",
    name: "Centreville",
    state: "VA",
    miles: 44,
    freeDelivery: false,
    blurb:
      "Bounce houses, water slides and party rentals for Centreville and Clifton — delivered, set up and picked up by our team.",
  },
  {
    slug: "culpeper-va",
    name: "Culpeper",
    state: "VA",
    miles: 30,
    freeDelivery: false,
    blurb:
      "From downtown Culpeper to the countryside, we deliver inflatables, tents and seating to make your celebration effortless.",
  },
  {
    slug: "dale-city-va",
    name: "Dale City",
    state: "VA",
    miles: 30,
    freeDelivery: false,
    blurb:
      "Bounce houses and party rentals for Dale City birthdays, block parties and HOA events across Prince William County.",
  },
  {
    slug: "dumfries-va",
    name: "Dumfries",
    state: "VA",
    miles: 25,
    freeDelivery: false,
    blurb:
      "Serving Dumfries, Quantico and southern Prince William with inflatables, tents and seating for parties of any size.",
  },
  {
    slug: "fairfax-va",
    name: "Fairfax",
    state: "VA",
    miles: 45,
    freeDelivery: false,
    blurb:
      "Inflatables, tents, tables and chairs for Fairfax birthdays, school events and corporate family days across Northern Virginia.",
  },
  {
    slug: "fredericksburg-va",
    name: "Fredericksburg",
    state: "VA",
    miles: 0,
    freeDelivery: true,
    blurb:
      "Our home base. From Central Park to historic downtown backyards, we deliver bounce houses, tents, tables and chairs all over Fredericksburg.",
  },
  {
    slug: "gainesville-va",
    name: "Gainesville",
    state: "VA",
    miles: 42,
    freeDelivery: false,
    blurb:
      "We deliver inflatables, tents and seating to Gainesville and Haymarket — perfect for backyard birthdays and community celebrations.",
  },
  {
    slug: "glen-allen-va",
    name: "Glen Allen",
    state: "VA",
    miles: 55,
    freeDelivery: false,
    blurb:
      "Serving Glen Allen and Short Pump with clean, safe inflatables and full party setups — delivery, setup and pickup included.",
  },
  {
    slug: "king-george-va",
    name: "King George",
    state: "VA",
    miles: 18,
    freeDelivery: false,
    blurb:
      "We bring the party to King George — bounce houses, slides and tents for backyard birthdays and community days, with low flat-rate delivery.",
  },
  {
    slug: "la-plata-md",
    name: "La Plata",
    state: "MD",
    miles: 38,
    freeDelivery: false,
    blurb:
      "Party rentals for La Plata and southern Maryland — bounce houses, slides and tents for celebrations of every size.",
  },
  {
    slug: "lake-anna-va",
    name: "Lake Anna",
    state: "VA",
    miles: 32,
    freeDelivery: false,
    blurb:
      "Lakeside birthdays and reunions at Lake Anna — we deliver inflatables, tents, tables and chairs right to your waterfront party.",
  },
  {
    slug: "leesburg-va",
    name: "Leesburg",
    state: "VA",
    miles: 65,
    freeDelivery: false,
    blurb:
      "We bring the party to Leesburg and Loudoun County — bounce houses, water slides and full event setups, delivered to your door.",
  },
  {
    slug: "locust-grove-va",
    name: "Locust Grove",
    state: "VA",
    miles: 22,
    freeDelivery: false,
    blurb:
      "Bounce houses, water slides and party rentals for Locust Grove and the Lake of the Woods community — setup and pickup always included.",
  },
  {
    slug: "lorton-va",
    name: "Lorton",
    state: "VA",
    miles: 36,
    freeDelivery: false,
    blurb:
      "Party rentals for Lorton and southern Fairfax County — inflatables, tents and seating for celebrations big and small.",
  },
  {
    slug: "manassas-va",
    name: "Manassas",
    state: "VA",
    miles: 35,
    freeDelivery: false,
    blurb:
      "Reliable party and inflatable rentals for Manassas birthdays, school field days and corporate family events across Northern Virginia.",
  },
  {
    slug: "mechanicsville-va",
    name: "Mechanicsville",
    state: "VA",
    miles: 60,
    freeDelivery: false,
    blurb:
      "Inflatables, tents and seating for Mechanicsville and Hanover County birthdays, church events and community days.",
  },
  {
    slug: "midlothian-va",
    name: "Midlothian",
    state: "VA",
    miles: 68,
    freeDelivery: false,
    blurb:
      "We deliver bounce houses, slides and party rentals to Midlothian and Chesterfield County for celebrations of every size.",
  },
  {
    slug: "orange-va",
    name: "Orange",
    state: "VA",
    miles: 38,
    freeDelivery: false,
    blurb:
      "Party rentals for Orange County — bounce houses, slides and tents for birthdays, festivals and community events, delivered to your door.",
  },
  {
    slug: "reston-va",
    name: "Reston",
    state: "VA",
    miles: 56,
    freeDelivery: false,
    blurb:
      "Serving Reston and Herndon with inflatables, tents and seating for birthdays, festivals and corporate family events.",
  },
  {
    slug: "richmond-va",
    name: "Richmond",
    state: "VA",
    miles: 58,
    freeDelivery: false,
    blurb:
      "Bounce houses, water slides, tents and party rentals delivered across Richmond for birthdays, festivals and corporate events.",
  },
  {
    slug: "silver-spring-md",
    name: "Silver Spring",
    state: "MD",
    miles: 62,
    freeDelivery: false,
    blurb:
      "Party rentals for Silver Spring and Montgomery County — bounce houses, tents and seating, delivered and set up for you.",
  },
  {
    slug: "spotsylvania-va",
    name: "Spotsylvania",
    state: "VA",
    miles: 8,
    freeDelivery: true,
    blurb:
      "Birthday parties, church festivals and HOA events across Spotsylvania County — delivered, set up, and picked up with free local delivery.",
  },
  {
    slug: "springfield-va",
    name: "Springfield",
    state: "VA",
    miles: 40,
    freeDelivery: false,
    blurb:
      "Serving Springfield and Burke with clean, safe bounce houses and full party setups — heavy lifting included.",
  },
  {
    slug: "stafford-va",
    name: "Stafford",
    state: "VA",
    miles: 12,
    freeDelivery: true,
    blurb:
      "Serving Stafford neighborhoods, schools and ball fields with clean, safe inflatables and party rentals — and free delivery inside our zone.",
  },
  {
    slug: "upper-marlboro-md",
    name: "Upper Marlboro",
    state: "MD",
    miles: 65,
    freeDelivery: false,
    blurb:
      "Inflatables and full party setups for Upper Marlboro and Prince George's County, delivered and installed by our team.",
  },
  {
    slug: "vienna-va",
    name: "Vienna",
    state: "VA",
    miles: 50,
    freeDelivery: false,
    blurb:
      "Bounce houses, slides and tents for Vienna and Oakton celebrations, delivered and installed by our friendly crew.",
  },
  {
    slug: "waldorf-md",
    name: "Waldorf",
    state: "MD",
    miles: 40,
    freeDelivery: false,
    blurb:
      "Serving Waldorf and Charles County with clean, safe inflatables, tents, tables and chairs — delivered, set up and picked up.",
  },
  {
    slug: "washington-dc",
    name: "Washington",
    state: "DC",
    miles: 52,
    freeDelivery: false,
    blurb:
      "Bounce houses, tents and party rentals delivered across Washington, DC for birthdays, block parties and community events.",
  },
  {
    slug: "woodbridge-va",
    name: "Woodbridge",
    state: "VA",
    miles: 28,
    freeDelivery: false,
    blurb:
      "Big-event ready for Woodbridge and eastern Prince William — slides, the Grand Party Dome, tents and seating for crowds of any size.",
  },
];

export function getCity(slug: string): CityInfo | undefined {
  return CITIES.find((c) => c.slug === slug);
}
