import type { DeliveryQuote } from "./types";

export const ORIGIN_ZIP = "22401";
export const ORIGIN_LABEL = "Fredericksburg, VA 22401";
export const FREE_RADIUS_MILES = 15;
export const PER_MILE_RATE = 2.0;

const ORIGIN_COORDS = { lat: 38.3032, lng: -77.4605 };

/**
 * Compact lat/lng table for common DMV / Northern-VA ZIP codes, used for the
 * offline distance estimate when no Google Maps key is configured. Distances
 * are straight-line (haversine) and intentionally slightly conservative.
 */
const ZIP_COORDS: Record<string, { lat: number; lng: number }> = {
  "22401": { lat: 38.3032, lng: -77.4605 },
  "22402": { lat: 38.2987, lng: -77.4869 },
  "22403": { lat: 38.3998, lng: -77.4147 },
  "22405": { lat: 38.3217, lng: -77.4108 },
  "22406": { lat: 38.3739, lng: -77.5398 },
  "22407": { lat: 38.2806, lng: -77.5409 },
  "22408": { lat: 38.2272, lng: -77.4583 },
  "22553": { lat: 38.2273, lng: -77.6225 }, // Spotsylvania
  "22554": { lat: 38.4452, lng: -77.4099 }, // Stafford
  "22556": { lat: 38.4745, lng: -77.4878 }, // Stafford
  "22405b": { lat: 38.3217, lng: -77.4108 },
  "22193": { lat: 38.6404, lng: -77.3242 }, // Woodbridge
  "22192": { lat: 38.6855, lng: -77.295 }, // Woodbridge
  "22191": { lat: 38.6326, lng: -77.2497 }, // Woodbridge
  "20109": { lat: 38.7984, lng: -77.5247 }, // Manassas
  "20110": { lat: 38.7468, lng: -77.4753 }, // Manassas
  "20111": { lat: 38.7551, lng: -77.4422 }, // Manassas
  "22030": { lat: 38.8462, lng: -77.3064 }, // Fairfax
  "22031": { lat: 38.8606, lng: -77.2611 }, // Fairfax
  "22033": { lat: 38.8807, lng: -77.3855 }, // Fairfax
  "22314": { lat: 38.8048, lng: -77.0469 }, // Alexandria
  "22301": { lat: 38.8185, lng: -77.0593 }, // Alexandria
  "22201": { lat: 38.887, lng: -77.0947 }, // Arlington
  "20001": { lat: 38.9101, lng: -77.0173 }, // Washington DC
  "20002": { lat: 38.9075, lng: -76.9851 },
  "20639": { lat: 38.5293, lng: -76.6116 }, // Huntingtown MD
  "20602": { lat: 38.5223, lng: -76.9897 }, // Waldorf MD
  "20603": { lat: 38.6404, lng: -76.9624 }, // Waldorf MD
  "22701": { lat: 38.4737, lng: -77.9961 }, // Culpeper
  "22408b": { lat: 38.2272, lng: -77.4583 },
  "22485": { lat: 38.2589, lng: -77.0586 }, // King George
};

/**
 * Coarser fallback: approximate centroids by ZIP **prefix** (first 3 digits) so
 * the offline calculator returns a sensible estimate for *any* VA / MD / DC ZIP,
 * not only the handful in ZIP_COORDS above. Exact ZIP wins when we have it; this
 * catches everything else in the region. (Precise any-address distance needs the
 * Google Maps key — until then these are clearly flagged as estimates.)
 */
const ZIP3_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  // Washington DC
  "200": { lat: 38.9, lng: -77.03 },
  "202": { lat: 38.9, lng: -77.03 },
  "203": { lat: 38.9, lng: -77.03 },
  "204": { lat: 38.9, lng: -77.03 },
  "205": { lat: 38.9, lng: -77.03 },
  // Maryland
  "206": { lat: 38.6, lng: -76.9 }, // Waldorf / Southern MD
  "207": { lat: 39.0, lng: -77.0 }, // Silver Spring
  "208": { lat: 39.02, lng: -77.1 }, // Bethesda / Rockville
  "209": { lat: 39.0, lng: -77.0 }, // Silver Spring
  "210": { lat: 39.29, lng: -76.61 }, // Baltimore
  "211": { lat: 39.29, lng: -76.61 },
  "212": { lat: 39.29, lng: -76.61 },
  "214": { lat: 38.98, lng: -76.49 }, // Annapolis
  "217": { lat: 39.41, lng: -77.41 }, // Frederick MD
  // Virginia
  "220": { lat: 39.0, lng: -77.4 }, // Dulles / Sterling
  "221": { lat: 38.85, lng: -77.3 }, // Fairfax
  "222": { lat: 38.88, lng: -77.1 }, // Arlington
  "223": { lat: 38.82, lng: -77.07 }, // Alexandria
  "224": { lat: 38.3, lng: -77.46 }, // Fredericksburg
  "225": { lat: 38.3, lng: -77.46 }, // Fredericksburg
  "226": { lat: 39.18, lng: -78.16 }, // Winchester
  "227": { lat: 38.47, lng: -77.99 }, // Culpeper
  "228": { lat: 38.45, lng: -78.87 }, // Harrisonburg
  "229": { lat: 38.03, lng: -78.48 }, // Charlottesville
  "230": { lat: 37.54, lng: -77.43 }, // Richmond
  "231": { lat: 37.54, lng: -77.43 }, // Richmond
  "232": { lat: 37.54, lng: -77.43 }, // Richmond
  "233": { lat: 36.85, lng: -76.21 }, // Norfolk / VA Beach
  "235": { lat: 36.85, lng: -76.21 },
  "238": { lat: 37.21, lng: -77.4 }, // Petersburg
};

function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

export function extractZip(input: string): string | null {
  const match = input.match(/\b(\d{5})\b/);
  return match ? match[1] : null;
}

function feeForMiles(miles: number): { fee: number; free: boolean } {
  if (miles <= FREE_RADIUS_MILES) return { fee: 0, free: true };
  const billable = miles - FREE_RADIUS_MILES;
  // Driving distance is longer than straight-line; nudge up ~25% for the
  // offline estimate so quotes aren't artificially cheap.
  const fee = Math.round(billable * PER_MILE_RATE * 100) / 100;
  return { fee, free: false };
}

/** Offline estimate from a ZIP code using the local coordinate table. */
export function estimateFromZip(zip: string): DeliveryQuote | null {
  // Exact ZIP first (most accurate), then fall back to the ZIP3 region centroid
  // so any VA/MD/DC ZIP still gets an estimate.
  const coords = ZIP_COORDS[zip] ?? ZIP3_CENTROIDS[zip.slice(0, 3)];
  if (!coords) return null;
  const straight = haversineMiles(ORIGIN_COORDS, coords);
  const miles = Math.round(straight * 1.25 * 10) / 10; // approx driving miles
  const { fee, free } = feeForMiles(miles);
  return {
    miles,
    fee,
    free,
    origin: ORIGIN_LABEL,
    destination: zip,
    estimated: true,
  };
}

/**
 * Get a delivery quote. Uses the Google Distance Matrix API for real driving
 * distance when GOOGLE_MAPS_API_KEY is set, otherwise falls back to the ZIP
 * estimate. Runs server-side only.
 */
export async function getDeliveryQuote(
  destination: string
): Promise<DeliveryQuote> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const cleaned = destination.trim();

  if (key) {
    try {
      const url = new URL(
        "https://maps.googleapis.com/maps/api/distancematrix/json"
      );
      url.searchParams.set("origins", ORIGIN_LABEL);
      url.searchParams.set("destinations", cleaned);
      url.searchParams.set("units", "imperial");
      url.searchParams.set("key", key);
      const res = await fetch(url.toString(), { cache: "no-store" });
      const json = await res.json();
      const element = json?.rows?.[0]?.elements?.[0];
      if (element?.status === "OK" && element.distance?.value) {
        const miles = Math.round((element.distance.value / 1609.34) * 10) / 10;
        const { fee, free } = feeForMiles(miles);
        return {
          miles,
          fee,
          free,
          origin: ORIGIN_LABEL,
          destination: cleaned,
          estimated: false,
        };
      }
    } catch {
      // fall through to estimate
    }
  }

  const zip = extractZip(cleaned);
  if (zip) {
    const est = estimateFromZip(zip);
    if (est) return est;
  }

  // Unknown location — default to a flat "contact us" style mid estimate.
  return {
    miles: 0,
    fee: 0,
    free: false,
    origin: ORIGIN_LABEL,
    destination: cleaned,
    estimated: true,
  };
}
