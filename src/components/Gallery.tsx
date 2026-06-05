"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function Gallery({ images }: { images: string[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback(
    (dir: number) =>
      setOpen((cur) =>
        cur === null ? cur : (cur + dir + images.length) % images.length
      ),
    [images.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, go]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setOpen(i)}
            className={`reveal group relative overflow-hidden rounded-2xl bg-white shadow-soft ${
              i % 5 === 0 ? "row-span-2" : ""
            }`}
            aria-label="Open photo"
          >
            <div
              className={`relative ${
                i % 5 === 0 ? "aspect-[3/4]" : "aspect-square"
              }`}
            >
              <Image
                src={src}
                alt={`Bounce FX event photo ${i + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-party-ink/0 font-display text-lg font-bold italic text-white opacity-0 transition-all duration-300 group-hover:bg-party-ink/40 group-hover:opacity-100">
                View
              </span>
            </div>
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border-2 border-white/40 text-2xl text-white transition-colors hover:bg-white/10"
            aria-label="Close"
          >
            ✕
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="absolute left-3 grid h-12 w-12 place-items-center rounded-full border-2 border-white/40 text-3xl text-white transition-colors hover:bg-white/10 sm:left-8"
            aria-label="Previous"
          >
            ‹
          </button>
          <div
            className="relative h-[78vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[open]}
              alt={`Bounce FX event photo ${open + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute right-3 grid h-12 w-12 place-items-center rounded-full border-2 border-white/40 text-3xl text-white transition-colors hover:bg-white/10 sm:right-8"
            aria-label="Next"
          >
            ›
          </button>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-body text-sm text-white/70">
            {open + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}
