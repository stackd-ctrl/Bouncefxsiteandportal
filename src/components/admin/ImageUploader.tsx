"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export default function ImageUploader({
  value,
  onChange,
  aspect = "aspect-[4/5]",
  label = "Replace photo",
}: {
  value: string;
  onChange: (url: string) => void;
  aspect?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div
        className={`relative ${aspect} overflow-hidden rounded-xl border border-party-ink/15 bg-white`}
      >
        {value && (
          <Image
            src={value}
            alt="Preview"
            fill
            sizes="200px"
            className="object-contain p-2"
          />
        )}
        {uploading && (
          <div className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-semibold">
            Uploading…
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="mt-2 w-full rounded-lg border border-party-ink/20 bg-white px-3 py-2 text-sm font-semibold transition-colors hover:bg-party-cream disabled:opacity-50"
      >
        {label}
      </button>
      {error && <p className="mt-1 text-xs text-party-red">{error}</p>}
    </div>
  );
}
