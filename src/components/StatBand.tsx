"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
}

const STATS: Stat[] = [
  { target: 500, suffix: "+", label: "Parties thrown" },
  { target: 5, suffix: "★", decimals: 1, label: "Average rating" },
  { target: 15, suffix: " mi", label: "Free delivery radius" },
  { target: 100, suffix: "%", label: "Licensed & insured" },
];

function useCountUp(target: number, run: boolean, decimals = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const duration = 1400;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, decimals]);
  return value;
}

function Counter({ stat, run }: { stat: Stat; run: boolean }) {
  const value = useCountUp(stat.target, run, stat.decimals);
  const shown = stat.decimals
    ? value.toFixed(stat.decimals)
    : Math.round(value).toString();
  return (
    <div className="text-center">
      <div className="font-display text-5xl font-bold italic sm:text-6xl">
        {stat.prefix}
        {shown}
        {stat.suffix}
      </div>
      <div className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
        {stat.label}
      </div>
    </div>
  );
}

export default function StatBand() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setRun(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="bg-party-red text-white">
      <div
        ref={ref}
        className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 sm:px-6 md:grid-cols-4 md:py-16"
      >
        {STATS.map((s) => (
          <Counter key={s.label} stat={s} run={run} />
        ))}
      </div>
    </section>
  );
}
