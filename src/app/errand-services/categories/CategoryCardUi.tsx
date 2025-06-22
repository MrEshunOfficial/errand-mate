// components/ui/category-card.tsx
"use client";

import React from "react";
import Image from "next/image";
import {
  Package,
  Tag,
  Users,
  ArrowRight,
  TrendingUp,
  Clock,
  Star,
  Sparkles,
  Calendar,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Category } from "@/store/types/dataTypes";

interface CategoryCardProps {
  category: Category;
  serviceCount: number;
  onClick: (categoryId: string) => void;
  className?: string;
  priority?: "high" | "medium" | "low";
}

// Utility function for date formatting
const formatCreatedDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Utility function to determine category status
const getCategoryStatus = (serviceCount: number, createdAt: string | Date) => {
  const isPopular = serviceCount > 10;
  const isNew =
    Date.now() - new Date(createdAt).getTime() < 30 * 24 * 60 * 60 * 1000; // 30 days
  const isEmpty = serviceCount === 0;

  return { isPopular, isNew, isEmpty };
};

// Enhanced Grid Card Component
export function CategoryGridCard({
  category,
  serviceCount,
  onClick,
  className,
  priority = "medium",
}: CategoryCardProps) {
  const { isPopular, isNew, isEmpty } = getCategoryStatus(
    serviceCount,
    category.createdAt
  );

  const handleClick = () => onClick(category._id.toString());

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      className={cn(
        // Base styles with semantic structure
        "group relative cursor-pointer overflow-hidden",
        "bg-white dark:bg-slate-900",
        "border border-slate-200 dark:border-slate-800",
        "rounded-xl shadow-sm",

        // Interactive states with improved transitions
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:shadow-slate-900/10 dark:hover:shadow-black/25",
        "hover:-translate-y-1 hover:scale-[1.02]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",

        // Priority-based styling
        priority === "high" && "ring-1 ring-blue-200 dark:ring-blue-800",

        // Hover overlay effects
        "before:absolute before:inset-0 before:bg-gradient-to-br",
        "before:from-blue-500/0 before:via-purple-500/0 before:to-pink-500/0",
        "before:opacity-0 hover:before:opacity-5 before:transition-opacity before:duration-300",

        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View ${category.categoryName} category with ${serviceCount} services`}
    >
      {/* Status Badges - Improved positioning and hierarchy */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        {isPopular && (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg animate-pulse">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Popular
          </Badge>
        )}
        {isNew && !isPopular && (
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg">
            <Sparkles className="h-3 w-3 mr-1" />
            New
          </Badge>
        )}
        {isEmpty && (
          <Badge
            variant="secondary"
            className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
          >
            Coming Soon
          </Badge>
        )}
      </div>

      {/* Enhanced Image Section */}
      <div className="relative w-full h-52 overflow-hidden bg-slate-50 dark:bg-slate-800">
        {category.catImage?.url ? (
          <>
            <Image
              src={category.catImage.url}
              alt={
                category.catImage.catName || `${category.categoryName} category`
              }
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority === "high"}
            />
            {/* Multi-layer gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-200 dark:group-hover:from-slate-700 dark:group-hover:to-slate-600 transition-all duration-500">
            <div className="relative">
              {/* Enhanced glow effect */}
              <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl group-hover:bg-blue-500/50 transition-all duration-500" />
              <div className="relative p-8 rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                <Package className="h-16 w-16 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Indicator - Improved design */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <div className="p-3 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border border-white/20 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 transition-colors duration-300">
            <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform duration-200" />
          </div>
        </div>
      </div>

      {/* Enhanced Content Section */}
      <CardContent className="p-6 space-y-4">
        {/* Header Section - Better typography hierarchy */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2 leading-tight">
              {category.categoryName}
            </CardTitle>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 flex-shrink-0">
              <Sparkles className="h-5 w-5 text-amber-500" />
            </div>
          </div>

          {/* Service Count with Enhanced Design */}
          <div className="flex items-center gap-2">
            <Badge
              variant={serviceCount > 0 ? "default" : "secondary"}
              className={cn(
                "text-sm font-medium transition-all duration-300 shadow-sm",
                serviceCount > 0
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
              )}
            >
              <Users className="h-3 w-3 mr-1.5" />
              {serviceCount === 0
                ? "No services yet"
                : `${serviceCount} ${
                    serviceCount === 1 ? "service" : "services"
                  }`}
            </Badge>
          </div>
        </div>

        {/* Description with better spacing */}
        {category.description && (
          <CardDescription className="text-sm line-clamp-3 leading-relaxed text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
            {category.description}
          </CardDescription>
        )}

        {/* Enhanced Tags Section */}
        {category.tags && category.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Tag className="h-3 w-3" />
              <span>Tags</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {category.tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center text-xs px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 text-blue-700 dark:text-blue-300 rounded-full font-medium border border-blue-200/50 dark:border-blue-800/50 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-all duration-300"
                >
                  {tag}
                </span>
              ))}
              {category.tags.length > 4 && (
                <span className="inline-flex items-center text-xs px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700 font-medium">
                  +{category.tags.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Footer with Better Information Architecture */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              <span>Created {formatCreatedDate(category.createdAt)}</span>
            </div>
          </div>

          {isPopular && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <Activity className="h-3 w-3" />
              <span>Trending</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced List Card Component
export function CategoryListCard({
  category,
  serviceCount,
  onClick,
  className,
  priority = "medium",
}: CategoryCardProps) {
  const { isPopular, isNew } = getCategoryStatus(
    serviceCount,
    category.createdAt
  );

  const handleClick = () => onClick(category._id.toString());

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      className={cn(
        // Base structure with semantic design
        "group relative cursor-pointer overflow-hidden",
        "bg-white dark:bg-slate-900",
        "border border-slate-200 dark:border-slate-800",
        "rounded-lg shadow-sm",

        // Enhanced interactive states
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:shadow-slate-900/10 dark:hover:shadow-black/20",
        "hover:scale-[1.01] hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",

        // Left border accent with status indication
        "border-l-4 transition-colors duration-300",
        isPopular
          ? "border-l-amber-500"
          : isNew
          ? "border-l-emerald-500"
          : "border-l-transparent hover:border-l-blue-500",

        // Priority styling
        priority === "high" && "ring-1 ring-blue-200 dark:ring-blue-800",

        // Subtle hover overlay
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/0 before:to-purple-500/0",
        "before:opacity-0 hover:before:opacity-3 before:transition-opacity before:duration-300",

        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View ${category.categoryName} category with ${serviceCount} services`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          {/* Enhanced Image Section with Status Indicators */}
          <div className="relative w-20 h-20 flex-shrink-0 sm:w-24 sm:h-24">
            {/* Status Badges - Repositioned for list view */}
            <div className="absolute -top-2 -right-2 z-20 flex flex-col gap-1">
              {isPopular && (
                <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="h-3 w-3 text-white fill-current" />
                </div>
              )}
              {isNew && !isPopular && (
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            {category.catImage?.url ? (
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-700">
                <Image
                  src={category.catImage.url}
                  alt={
                    category.catImage.catName ||
                    `${category.categoryName} category`
                  }
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="96px"
                  priority={priority === "high"}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
              </div>
            ) : (
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-200 dark:group-hover:from-slate-700 dark:group-hover:to-slate-600 transition-all duration-500 shadow-md border border-white/30 dark:border-slate-600/30">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg group-hover:bg-blue-500/40 transition-all duration-500" />
                  <Package className="relative h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Content Section */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header with improved layout */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-1">
                  {category.categoryName}
                </CardTitle>

                {/* Enhanced badges section */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={serviceCount > 0 ? "default" : "secondary"}
                    className={cn(
                      "text-xs sm:text-sm font-medium transition-all duration-300 shadow-sm",
                      serviceCount > 0
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    )}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    {serviceCount === 0
                      ? "No services"
                      : `${serviceCount} ${
                          serviceCount === 1 ? "service" : "services"
                        }`}
                  </Badge>

                  {isPopular && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs shadow-sm">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
              </div>

              {/* Enhanced Action Button */}
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 flex-shrink-0">
                <div className="p-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* Description with responsive text sizing */}
            {category.description && (
              <CardDescription className="text-slate-600 dark:text-slate-400 line-clamp-2 text-sm leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                {category.description}
              </CardDescription>
            )}

            {/* Enhanced Tags and Meta section */}
            <div className="flex items-center justify-between gap-4">
              {/* Tags section with improved design */}
              {category.tags && category.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Tag className="h-3 w-3 text-slate-400 flex-shrink-0" />
                  <div className="flex gap-1.5 flex-wrap min-w-0">
                    {category.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center text-xs px-2 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 text-blue-700 dark:text-blue-300 rounded-md font-medium border border-blue-200/50 dark:border-blue-800/50 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-all duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                    {category.tags.length > 2 && (
                      <span className="inline-flex items-center text-xs px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-700 font-medium">
                        +{category.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Meta information with better spacing */}
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="hidden sm:inline">Created </span>
                  <span>{formatCreatedDate(category.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
