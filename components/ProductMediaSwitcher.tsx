"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import ProductVideo from "./ProductVideo";

interface ProductMediaSwitcherProps {
  imageUrl: string;
  videoUrl?: string;
  productName: string;
}

export default function ProductMediaSwitcher({
  imageUrl,
  videoUrl,
  productName,
}: ProductMediaSwitcherProps) {
  const hasVideo = !!videoUrl;
  const [showVideo, setShowVideo] = useState(false);

  if (!hasVideo) {
    return (
      <div className="relative aspect-square bg-white border border-gray-100 rounded-lg flex items-center justify-center p-4">
        <Image
          src={imageUrl}
          alt={productName}
          fill
          className="object-contain product-main-image"
          priority
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {showVideo ? (
        <ProductVideo videoUrl={videoUrl as string} productName={productName} />
      ) : (
        <div className="relative aspect-square bg-white border border-gray-100 rounded-lg flex items-center justify-center p-4">
          <Image
            src={imageUrl}
            alt={productName}
            fill
            className="object-contain product-main-image"
            priority
            unoptimized
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowVideo((prev) => !prev)}
        className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-black/70 text-white text-xs px-3 py-1.5 hover:bg-black/80 transition-colors"
      >
        <ChevronRight size={14} />
        <span>{showVideo ? "Ver foto" : "Ver vídeo"}</span>
      </button>
    </div>
  );
}

