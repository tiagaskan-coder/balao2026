import React from "react";

export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 bg-gray-200 w-full" />
      
      <div className="p-4 space-y-3">
        {/* Category Skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        
        {/* Price Skeleton */}
        <div className="space-y-1 pt-2">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
        </div>
        
        {/* Button Skeleton */}
        <div className="pt-2">
          <div className="h-10 bg-gray-200 rounded-full w-full" />
        </div>
      </div>
    </div>
  );
}
