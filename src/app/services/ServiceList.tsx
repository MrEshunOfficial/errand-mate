// components/services/ServicesList.tsx
import React from "react";
import { Package, Grid3X3, List } from "lucide-react";
import { ServiceCard } from "./ServiceCard";
import { Category } from "@/store/types/dataTypes";
import { IServiceDocument } from "../models/category-service-models/serviceModel";

interface ServicesListProps {
  services: IServiceDocument[];
  categories: Category[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  totalServices: number;
  showPopularOnly: boolean;
}

export const ServicesList: React.FC<ServicesListProps> = ({
  services,
  categories,
  viewMode,
  onViewModeChange,
  totalServices,
  showPopularOnly,
}) => {
  return (
    <>
      {/* View Mode Toggle & Results Count */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {services.length} of {totalServices} service
            {services.length !== 1 ? "s" : ""}
          </p>
          {categories && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              from {categories.length} categor
              {categories.length !== 1 ? "ies" : "y"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Services Grid/List */}
      {services.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {totalServices === 0
              ? "No services available"
              : showPopularOnly
              ? "No popular services found"
              : "No services found"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {totalServices === 0
              ? "Services will appear here once they are added."
              : showPopularOnly
              ? "Try removing the popular filter or check back later."
              : "Try adjusting your filters or search query."}
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              : "space-y-4"
          }
        >
          {services.map((service, index) => (
            <ServiceCard
              key={service._id.toString()}
              service={service}
              index={index}
              viewMode={viewMode}
              categories={categories}
            />
          ))}
        </div>
      )}
    </>
  );
};
