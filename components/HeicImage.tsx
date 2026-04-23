"use client";

import { useEffect, useState } from "react";

interface HeicImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function HeicImage({ src, alt, className }: HeicImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src) return;

    const isHeic =
      src.toLowerCase().includes(".heic") ||
      src.toLowerCase().includes(".heif");

    if (!isHeic) {
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
          const url = URL.createObjectURL(
            Array.isArray(converted) ? converted[0] : converted
          );
          setImgSrc(url);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => { cancelled = true; };
  }, [src]);

  if (failed) return null;

  if (!imgSrc) {
    // Placeholder while loading
    return <div className={`bg-zinc-800 animate-pulse ${className ?? ""}`} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imgSrc} alt={alt} className={className} />
  );
}