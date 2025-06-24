// pages/services/index.tsx or app/services/page.tsx
"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ServiceFilters } from "./ServiceFilters";
import { ServicesList } from "./ServiceList";
import { useCategories } from "@/hooks/admin/useCategory";
import { useServices } from "@/hooks/admin/useServices";
import Image from "next/image";

export default function AllServicesPage() {
  const { services, loading, error, getServices } = useServices();
  const { categories, getCategories } = useCategories();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // Initialize filters from URL parameters
  useEffect(() => {
    const popular = searchParams.get("popular");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");

    if (popular === "true") {
      setShowPopularOnly(true);
    }
    if (category) {
      setSelectedCategory(category);
    }
    if (search) {
      setSearchQuery(search);
    }
    if (sort) {
      setSortBy(sort);
    }
  }, [searchParams]);

  // Header visibility animation on scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 100) {
        setIsHeaderVisible(true);
      } else {
        setIsHeaderVisible(currentScrollY < lastScrollY);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update URL when filters change
  const updateURL = (params: Record<string, string | boolean>) => {
    const newSearchParams = new URLSearchParams();

    // Add current filters to URL
    if (params.popular || showPopularOnly) {
      newSearchParams.set("popular", "true");
    }
    if (params.category || selectedCategory) {
      newSearchParams.set(
        "category",
        (params.category as string) || selectedCategory
      );
    }
    if (params.search || searchQuery) {
      newSearchParams.set("search", (params.search as string) || searchQuery);
    }
    if (params.sort || sortBy) {
      newSearchParams.set("sort", (params.sort as string) || sortBy);
    }

    const newURL = `/services${
      newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""
    }`;
    router.push(newURL, { scroll: false });
  };

  // Enhanced filter handlers that update URL
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    updateURL({ category: categoryId });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateURL({ search: query });
  };

  const handlePopularToggle = (show: boolean) => {
    setShowPopularOnly(show);
    updateURL({ popular: show });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateURL({ sort });
  };

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          getServices({ limit: 100 }),
          getCategories({ limit: 100 }),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [getServices, getCategories]);

  // Filter and sort services based on current filters
  const filteredAndSortedServices = useMemo(() => {
    if (!services) return [];

    let filtered = services.filter((service) => {
      // Search filter
      if (
        searchQuery &&
        !service.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (
        selectedCategory &&
        service.categoryId.toString() !== selectedCategory
      ) {
        return false;
      }

      // Popular filter
      if (showPopularOnly && !service.popular) {
        return false;
      }

      return true;
    });

    // Apply sorting
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case "title":
            return a.title.localeCompare(b.title);
          case "title-desc":
            return b.title.localeCompare(a.title);
          case "popular":
            return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
          case "newest":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case "oldest":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [services, searchQuery, selectedCategory, showPopularOnly, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading services...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-600 dark:text-red-400">
            Error loading services: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Compact Header */}
      <header
        className={`
          sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md 
          border-b border-gray-200/50 dark:border-gray-700/50 
          transition-all duration-500 ease-out
          ${
            isHeaderVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            {/* Logo and Brand Section */}
            <div className="flex items-center space-x-3 group">
              {/* Animated Logo Container */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-110"></div>
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 p-0.5 transform group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src="/errand_logo.jpg"
                    alt="Errand Logo"
                    fill
                    className="object-cover rounded-full bg-white dark:bg-gray-800"
                    sizes="(max-width: 640px) 2.5rem, 3rem"
                    priority
                  />
                </div>
              </div>

              {/* Brand Text */}
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-bold">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Services
                  </span>
                </h1>
                <div className="flex items-center space-x-2">
                  <div className="h-0.5 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform origin-left group-hover:scale-x-125 transition-transform duration-300"></div>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {showPopularOnly ? "Popular" : "All Available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats - Hidden on small screens */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center group cursor-default">
                <div className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                  {filteredAndSortedServices.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {showPopularOnly ? "Popular" : "Services"}
                </div>
              </div>

              {selectedCategory && (
                <div className="text-center group cursor-default">
                  <div className="text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200">
                    {categories?.find(
                      (cat) => cat._id.toString() === selectedCategory
                    )?.categoryName || "Category"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Filtered
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      </header>

      {/* Main Content */}
      <main className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Compact Hero Section */}
          <div className="text-center mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-3 sm:space-y-4">
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                {showPopularOnly
                  ? "Discover the most requested services by our community"
                  : "Find the perfect service for your needs"}
              </p>

              {!showPopularOnly && (
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                  Browse by category or search to find exactly what you&apos;re
                  looking for
                </p>
              )}
            </div>

            {/* Floating Action Indicator */}
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium animate-pulse">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <span>Start exploring below</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <ServiceFilters
              categories={categories || []}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              showPopularOnly={showPopularOnly}
              onPopularToggle={handlePopularToggle}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />
          </div>

          {/* Services List */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <ServicesList
              services={filteredAndSortedServices}
              categories={categories || []}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalServices={services?.length || 0}
              showPopularOnly={showPopularOnly}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
