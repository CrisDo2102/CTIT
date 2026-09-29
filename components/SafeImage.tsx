"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  src: string;
  alt: string;
  fallback: ReactNode;
  loading?: "lazy" | "eager";
};

// <img> co san phuong an du phong: neu ten anh trong sheet khong khop file that
// (sai ten, sai hoa/thuong, chua bo anh vao folder) thi hien `fallback`
// (chu cai dau / icon) thay vi icon anh vo kem chu alt xau xi.
export function SafeImage({ src, alt, fallback, loading }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Anh co the loi truoc khi React gan xong onError (server render san) nen
  // kiem tra lai luc mount.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailedSrc(src);
    }
  }, [src]);

  if (!src || failedSrc === src) {
    return <>{fallback}</>;
  }

  return <img ref={imgRef} src={src} alt={alt} loading={loading} onError={() => setFailedSrc(src)} />;
}
