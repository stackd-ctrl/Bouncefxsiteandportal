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
 * Wavy scrolling marquee — the text rides a sine-wave path (SVG textPath) and
 * scrolls horizontally. Two identical, seamlessly-tiling segments translate via
 * the marquee animation for an infinite loop.
 */
function WaveSegment({ id, text }: { id: string; text: string }) {
  const phrase = ` ${text}   ✺  `;
  const content = phrase.repeat(7);
  return (
    <svg
      width={1100}
      height={180}
      viewBox="0 0 1100 180"
      className="block shrink-0"
      aria-hidden
    >
      <defs>
        <path
          id={id}
          d="M0,118 Q137.5,52 275,118 T550,118 T825,118 T1100,118"
          fill="none"
        />
      </defs>
      <text
        className="fill-white font-display font-bold italic"
        fontSize="60"
        style={{ filter: "drop-shadow(2px 3px 0 rgba(0,0,0,0.18))" }}
      >
        <textPath href={`#${id}`}>{content}</textPath>
      </text>
    </svg>
  );
}

export function WaveMarquee({
  text = "Follow the fun",
  bg = "bg-party-red",
}: {
  text?: string;
  bg?: string;
}) {
  return (
    <div className={`overflow-hidden ${bg} py-4`} aria-label={text}>
      <div className="flex w-max animate-marquee">
        <WaveSegment id="wave-seg-a" text={text} />
        <WaveSegment id="wave-seg-b" text={text} />
      </div>
    </div>
  );
}
