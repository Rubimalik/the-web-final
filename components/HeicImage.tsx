"use client";

import { useEffect, useState } from "react";

interface HeicImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
}

export function HeicImage({ src, alt, className, loading = "lazy" }: HeicImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src) return;

    let objectUrl: string | null = null;

    const isHeic =
      src.toLowerCase().includes(".heic") ||
      src.toLowerCase().includes(".heif");

    if (!isHeic) {
      setFailed(false);
      setImgSrc(src);
      return;
    }

    // Only import heic2any in the browser
    let cancelled = false;
    (async () => {
      try {
        const heic2any = (await import("heic2any")).default;
        const res = await fetch(src);
        const blob = await res.blob();
        const converted = await heic2any({ blob, toType: "image/jpeg", quality: 0.8 });
        if (!cancelled) {
          objectUrl = URL.createObjectURL(
            Array.isArray(converted) ? converted[0] : converted
          );
          setFailed(false);
          setImgSrc(objectUrl);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (failed) return null;

  if (!imgSrc) {
    // Placeholder while loading
    return <div className={`bg-zinc-800 animate-pulse ${className ?? ""}`} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imgSrc} alt={alt} className={className} loading={loading} decoding="async" />
  );
}
