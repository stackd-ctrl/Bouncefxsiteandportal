/**
 * Editorial scrolling marquee bands.
 *  - <Marquee>          straight repeating band
 *  - <DiagonalMarquee>  signature tilted "Follow the fun" band
 */

export default function Marquee({
  text = "Party vibes made easy",
  bg = "bg-party-yellow",
  color = "text-party-ink",
  separator = "✺",
}: {
  text?: string;
  bg?: string;
  color?: string;
  separator?: string;
}) {
  const items = Array.from({ length: 8 });
  return (
    <div className={`overflow-hidden ${bg} ${color} py-3`}>
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0">
            {items.map((_, i) => (
              <span
                key={i}
                className="flex items-center font-display text-xl font-bold italic sm:text-2xl"
              >
                <span className="px-5">{text}</span>
                <span className="opacity-70">{separator}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DiagonalMarquee({
  text = "Follow the fun",
  bg = "bg-party-red",
  color = "text-white",
}: {
  text?: string;
  bg?: string;
  color?: string;
}) {
  const items = Array.from({ length: 10 });
  return (
    <div className="relative my-16 h-28 sm:h-36">
      <div
        className={`absolute inset-x-[-8%] top-1/2 -translate-y-1/2 -rotate-[4deg] overflow-hidden border-y-2 border-party-ink ${bg} ${color} py-5 shadow-card`}
      >
        <div className="flex w-max animate-marquee-rev whitespace-nowrap">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0">
              {items.map((_, i) => (
                <span
                  key={i}
                  className="flex items-center font-display text-3xl font-bold italic sm:text-4xl"
                >
                  <span className="px-6">{text}</span>
                  <span className="opacity-80">✺</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Bold "Follow the fun" scrolling band. A clean, seamless straight marquee:
 * two identical halves translate -50% so the loop never gaps or jumps. (This
 * replaced a fragile SVG sine-wave textPath version that clipped and tiled
 * unevenly.) Kept the WaveMarquee name so existing usage stays unchanged.
 */
export function WaveMarquee({
  text = "Follow the fun",
  bg = "bg-party-red",
  color = "text-white",
}: {
  text?: string;
  bg?: string;
  color?: string;
}) {
  const items = Array.from({ length: 8 });
  return (
    <div
      className={`overflow-hidden border-y-2 border-party-ink ${bg} ${color} py-4 shadow-card`}
      aria-label={text}
    >
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0">
            {items.map((_, i) => (
              <span
                key={i}
                className="flex items-center font-display text-3xl font-bold italic sm:text-4xl"
              >
                <span className="px-6">{text}</span>
                <span className="opacity-80">✺</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
