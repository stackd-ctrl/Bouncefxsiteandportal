"use client";

import ImageUploader from "./ImageUploader";

export default function MultiImageEditor({
  images,
  onChange,
}: {
  images: string[];
  onChange: (next: string[]) => void;
}) {
  function setAt(i: number, url: string) {
    const next = [...images];
    next[i] = url;
    onChange(next);
  }
  function removeAt(i: number) {
    onChange(images.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <p className="field-label">Additional photos</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((src, i) => (
          <div key={i}>
            <ImageUploader
              value={src}
              aspect="aspect-square"
              onChange={(url) => setAt(i, url)}
              label="Replace"
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="mt-1 w-full text-xs font-semibold text-party-red hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...images, ""])}
          className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-party-ink/25 text-sm font-semibold text-party-ink/50 transition-colors hover:border-party-ink/50 hover:bg-party-cream"
        >
          + Add photo
        </button>
      </div>
    </div>
  );
}
