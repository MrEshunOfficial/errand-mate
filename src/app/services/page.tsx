// pages/services/index.tsx or app/services/page.tsx
"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ServiceFilters } from "./ServiceFilters";
import { ServicesList } from "./ServiceList";
import { useCategories } from "@/hooks/admin/useCategory";
import { useServices } from "@/hooks/admin/useServices";

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
              {showPopularOnly ? "Popular Services" : "All Services"}
            </h1>

            {/* Decorative elements */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60"></div>
          </div>

          <div className="mt-2 space-y-2">
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-medium">
              {showPopularOnly
                ? "Discover the most requested services by our community"
                : "Discover all available services in one place"}
            </p>

            {!showPopularOnly && (
              <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
                Browse by category or search for specific services to find
                exactly what you need
              </p>
            )}
          </div>
        </div>

        {/* Filters */}
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

        {/* Services List */}
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
  );
}
