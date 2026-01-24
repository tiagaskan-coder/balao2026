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
          <div key={image.id} className="min-w-full relative h-full bg-gray-900 overflow-hidden">
             {/* Background blurred image for fill effect */}
             <div className="absolute inset-0 opacity-30">
                 <Image
                    src={image.image_url}
                    alt=""
                    fill
                    className="object-cover blur-2xl scale-110"
                 />
             </div>
             
             {/* Main image - contained */}
             <Image
                src={image.image_url}
                alt={image.title || "Banner"}
                fill
                className="object-contain relative z-10"
                priority={currentIndex === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
             />
             {/* Title removed as requested */}
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
