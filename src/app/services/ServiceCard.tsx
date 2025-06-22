// components/services/ServiceCard.tsx
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, Grid3X3, Star, Clock } from "lucide-react";
import { Category } from "@/store/types/dataTypes";
import { IServiceDocument } from "../models/category-service-models/serviceModel";

interface ServiceCardProps {
  service: IServiceDocument;
  index: number;
  viewMode: "grid" | "list";
  categories: Category[];
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  index,
  viewMode,
  categories,
}) => {
  const [imageError, setImageError] = useState(false);

  // Find category info
  const serviceCategory = categories.find(
    (cat) => cat._id.toString() === service.categoryId.toString()
  );

  const modernGradients = [
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-amber-500 to-amber-600",
    "from-violet-500 to-violet-600",
    "from-rose-500 to-rose-600",
    "from-indigo-500 to-indigo-600",
  ];

  const fallbackGradient = modernGradients[index % modernGradients.length];

  // Handle category click - prevent event bubbling
  const handleCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/errand-services/categories/${serviceCategory?._id}`;
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Service Image/Icon */}
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
              {service.serviceImage?.url && !imageError ? (
                <Image
                  src={service.serviceImage.url}
                  alt={service.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center`}
                >
                  <Package className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {/* Service Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {service.title}
                </h3>
                {service.popular && (
                  <span className="flex-shrink-0 inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </span>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {service.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {serviceCategory && (
                  <button
                    onClick={handleCategoryClick}
                    className="inline-flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <Grid3X3 className="w-4 h-4 mr-1" />
                    {serviceCategory.categoryName}
                  </button>
                )}
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Available
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0">
              <Link
                href={`/services/${service._id}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Request Service
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group relative">
      <Link
        href={`/services/${service._id}`}
        className="block relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl h-80 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
      >
        {/* Background */}
        <div className="absolute inset-0">
          {service.serviceImage?.url && !imageError ? (
            <Image
              src={service.serviceImage.url}
              alt={service.title}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className={`h-full w-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center`}
            >
              <Package className="h-12 w-12 text-white opacity-80" />
            </div>
          )}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 group-hover:from-black/80 group-hover:to-black/30 transition-all duration-500" />

        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between text-white z-10">
          {/* Top - Category & Popular Badge */}
          <div className="flex items-start justify-between">
            {serviceCategory && (
              <button
                onClick={handleCategoryClick}
                className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium hover:bg-white/30 transition-colors cursor-pointer"
              >
                {serviceCategory.categoryName}
              </button>
            )}
            {service.popular && (
              <span className="inline-flex items-center px-3 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-full text-xs font-bold">
                <Star className="w-3 h-3 mr-1" />
                Popular
              </span>
            )}
          </div>

          {/* Bottom - Service Info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-bold mb-2 leading-tight">
                {service.title}
              </h3>
              <p className="text-white/90 text-sm line-clamp-2 leading-relaxed">
                {service.description}
              </p>
            </div>

            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors duration-300 rounded-full px-4 py-2 text-sm font-semibold">
              Request Service
              <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
