// components/services/ServiceFilters.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  Sparkles,
  SortAsc,
  Tag,
  ChevronDown,
} from "lucide-react";
import { Category } from "@/store/types/dataTypes";

interface ServiceFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showPopularOnly: boolean;
  onPopularToggle: (show: boolean) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  showPopularOnly,
  onPopularToggle,
  sortBy,
  onSortChange,
}) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const clearAllFilters = () => {
    onCategoryChange("");
    onSearchChange("");
    onPopularToggle(false);
    onSortChange("");
    setIsMobileFilterOpen(false);
  };

  const hasActiveFilters =
    selectedCategory || searchQuery || showPopularOnly || sortBy;
  const activeFiltersCount = [
    selectedCategory,
    searchQuery,
    showPopularOnly,
    sortBy,
  ].filter(Boolean).length;

  // Enhanced handlers that close popover when appropriate
  const handleCategoryChange = (categoryId: string) => {
    onCategoryChange(categoryId);
    setIsMobileFilterOpen(false); // Close popover after selection
  };

  const handleSortChange = (sort: string) => {
    onSortChange(sort);
    setIsMobileFilterOpen(false); // Close popover after selection
  };

  const handlePopularToggle = (show: boolean) => {
    onPopularToggle(show);
    // Keep popover open for toggle as user might want to adjust other filters
  };

  // Close popover when clicking outside (but not on search input for mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        popoverRef.current &&
        buttonRef.current &&
        searchInputRef.current &&
        !popoverRef.current.contains(target) &&
        !buttonRef.current.contains(target) &&
        !searchInputRef.current.contains(target)
      ) {
        setIsMobileFilterOpen(false);
      }
    };

    if (isMobileFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMobileFilterOpen]);

  // Close popover on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileFilterOpen(false);
      }
    };

    if (isMobileFilterOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isMobileFilterOpen]);

  const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={`grid grid-cols-1 ${
        isMobile ? "gap-4" : "md:grid-cols-2 lg:grid-cols-4 gap-6"
      }`}
    >
      {/* Search - Only show in desktop version since mobile has it outside */}
      {!isMobile && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Search className="w-4 h-4" />
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Tag className="w-4 h-4" />
          Category
        </label>
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) =>
              isMobile
                ? handleCategoryChange(e.target.value)
                : onCategoryChange(e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option
                key={category._id.toString()}
                value={category._id.toString()}
              >
                {category.categoryName}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <SortAsc className="w-4 h-4" />
          Sort By
        </label>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) =>
              isMobile
                ? handleSortChange(e.target.value)
                : onSortChange(e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 appearance-none cursor-pointer"
          >
            <option value="">Default Order</option>
            <option value="title">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="popular">Popular First</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Popular Filter */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Sparkles className="w-4 h-4" />
          Popular Only
        </label>
        <div className="flex items-center h-12">
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={showPopularOnly}
              onChange={(e) =>
                isMobile
                  ? handlePopularToggle(e.target.checked)
                  : onPopularToggle(e.target.checked)
              }
              className="sr-only"
            />
            <div
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ease-in-out ${
                showPopularOnly
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                  : "bg-gray-200 dark:bg-gray-600 group-hover:bg-gray-300 dark:group-hover:bg-gray-500"
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 ease-in-out shadow-md ${
                  showPopularOnly ? "translate-x-6 shadow-lg" : "translate-x-0"
                }`}
              />
              {showPopularOnly && (
                <Sparkles className="absolute top-1 left-1 w-3 h-3 text-white animate-pulse" />
              )}
            </div>
            <span className="ml-3 text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              {showPopularOnly ? "Popular Services" : "All Services"}
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-100 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filter Services
              </h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-6">
          <FilterContent />
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-100 dark:border-gray-600">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active filters:
              </span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm rounded-full border border-blue-200 dark:border-blue-800">
                  <Tag className="w-3 h-3" />
                  {
                    categories.find(
                      (c) => c._id.toString() === selectedCategory
                    )?.categoryName
                  }
                  <button
                    onClick={() => onCategoryChange("")}
                    className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-sm rounded-full border border-green-200 dark:border-green-800">
                  <Search className="w-3 h-3" />
                  &quot;{searchQuery}&quot;
                  <button
                    onClick={() => onSearchChange("")}
                    className="ml-1 text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {showPopularOnly && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 text-sm rounded-full border border-purple-200 dark:border-purple-800">
                  <Sparkles className="w-3 h-3" />
                  Popular Only
                  <button
                    onClick={() => onPopularToggle(false)}
                    className="ml-1 text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {sortBy && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 text-sm rounded-full border border-orange-200 dark:border-orange-800">
                  <SortAsc className="w-3 h-3" />
                  {sortBy === "title"
                    ? "A-Z"
                    : sortBy === "title-desc"
                    ? "Z-A"
                    : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                  <button
                    onClick={() => onSortChange("")}
                    className="ml-1 text-orange-600 dark:text-orange-300 hover:text-orange-800 dark:hover:text-orange-100 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Version with External Search */}
      <div className="md:hidden mb-6">
        {/* Mobile Search - Outside of popover */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filter Controls */}
        <div className="relative">
          {/* Mobile Filter Button */}
          <button
            ref={buttonRef}
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">
                Filters
              </span>
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isMobileFilterOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Mobile Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-2 px-4">
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                    <Tag className="w-3 h-3" />
                    {
                      categories.find(
                        (c) => c._id.toString() === selectedCategory
                      )?.categoryName
                    }
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-xs rounded-full">
                    <Search className="w-3 h-3" />
                    &quot;{searchQuery}&quot;
                  </span>
                )}
                {showPopularOnly && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Popular
                  </span>
                )}
                {sortBy && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 text-xs rounded-full">
                    <SortAsc className="w-3 h-3" />
                    {sortBy === "title"
                      ? "A-Z"
                      : sortBy === "title-desc"
                      ? "Z-A"
                      : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Mobile Popover */}
          {isMobileFilterOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 bg-black/20 z-40" />

              {/* Popover Content */}
              <div
                ref={popoverRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[70vh] overflow-y-auto"
              >
                {/* Popover Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Filter Options
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Clear
                      </button>
                    )}
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Popover Content - Excluding search */}
                <div className="p-4">
                  <FilterContent isMobile={true} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
