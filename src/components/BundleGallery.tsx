"use client";

import { useState } from "react";
import Image from "next/image";

export default function BundleGallery({ images }: { images: string[] }) {
  const [view, setView] = useState(0);
  if (images.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-white">
        <Image
          src={images[view] ?? images[0]}
          alt="Bundle photo"
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setView(i)}
              className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === view ? "border-party-red" : "border-white/40"
              }`}
              aria-label={`Photo ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="48px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
