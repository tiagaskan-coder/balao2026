"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CarouselImage } from "@/lib/utils";

export default function Carousel({ images }: { images: CarouselImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (!isAutoPlay || images.length <= 1) return;
    const interval = setInterval(nextSlide, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [isAutoPlay, images.length, nextSlide]);

  if (!images || images.length === 0) {
    return null; // Or a default banner
  }

  return (
    <div 
      className="relative w-full h-48 md:h-80 lg:h-96 overflow-hidden rounded-lg shadow-md group mb-6"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Slides */}
      <div 
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image) => (
          <div key={image.id} className="min-w-full relative h-full bg-gray-200">
             <Image
                src={image.image_url}
                alt={image.title || "Banner"}
                fill
                className="object-cover"
                priority={currentIndex === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
             />
             {image.title && (
                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                     <h3 className="text-lg md:text-2xl font-bold">{image.title}</h3>
                     {image.metadata && image.metadata.width && image.metadata.height && (
                        <meta itemProp="dimensions" content={`${image.metadata.width}x${image.metadata.height}`} />
                     )}
                 </div>
             )}
          </div>
        ))}
      </div>

      {/* Navigation Buttons (visible on hover) */}
      {images.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.preventDefault(); prevSlide(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); nextSlide(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === index ? "bg-white w-6" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
