"use client";

import { useParams } from "next/navigation";
import {
  Package,
  Search,
  Grid,
  Filter,
  TrendingUp,
  Activity,
  LucideIcon,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Grid3X3,
  List,
} from "lucide-react";
import { JSX, useEffect, useState } from "react";
import { unwrapResult } from "@reduxjs/toolkit";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/admin/useCategory";
import { IServiceDocument } from "@/app/models/category-service-models/serviceModel";
import { useServices } from "@/hooks/admin/useServices";
import { Category, Service } from "@/store/types/dataTypes";
import { ServiceCard } from "../../ServiceCard";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
};

const cardVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  description,
  gradient = "from-blue-500 to-purple-600",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  description?: string;
  gradient?: string;
}) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.02 }}
    className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-background/50 to-muted/50 p-4 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div
      className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
    />
    <div className="relative flex items-center space-x-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r ${gradient} shadow-lg`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  </motion.div>
);

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </motion.div>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Skeleton className="h-32 w-full rounded-xl" />
        </motion.div>
      ))}
    </div>

    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </CardContent>
    </Card>
  </div>
);

export default function CategoryDetailsWithServicesPage(): JSX.Element {
  const params = useParams();
  const categoryId = params.id as string;

  const {
    categories,
    getCategoryById,
    selectedCategory,
    loading: categoryLoading,
  } = useCategories();

  const { getServicesByCategory, loading: servicesLoading } = useServices();

  const [category, setCategory] = useState<Category | null>(null);
  const [categoryServices, setCategoryServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active" | "popular">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Collapsible states
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);

  // Fetch category data
  useEffect(() => {
    const fetchCategoryData = async (): Promise<void> => {
      try {
        setLoading(true);

        const existingCategory = categories.find(
          (cat) => cat._id.toString() === categoryId
        );

        if (existingCategory) {
          setCategory(existingCategory);
        } else {
          const result = await getCategoryById?.(categoryId);
          if (result) {
            try {
              const categoryData = unwrapResult(result);
              setCategory(categoryData);
            } catch (error) {
              console.error("Failed to unwrap category result:", error);
              setCategory(null);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch category data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId, categories, getCategoryById]);

  // Fetch services for this category
  useEffect(() => {
    const fetchServices = async (): Promise<void> => {
      if (!categoryId) return;

      try {
        const result = await getServicesByCategory(categoryId);
        if (result) {
          const servicesData = unwrapResult(result) as IServiceDocument[];

          // Transform ObjectId to string
          const transformed = servicesData.map((service) => ({
            ...service,
            categoryId: service.categoryId.toString(),
          }));

          setCategoryServices(transformed as unknown as Service[]);
        }
      } catch (error) {
        console.error("Failed to fetch services:", error);
        setCategoryServices([]);
      }
    };

    fetchServices();
  }, [categoryId, getServicesByCategory]);

  // Alternative approach: Use selectedCategory from Redux store
  useEffect(() => {
    if (selectedCategory && selectedCategory._id.toString() === categoryId) {
      setCategory(selectedCategory);
      setLoading(false);
    }
  }, [selectedCategory, categoryId]);

  // Filter services based on search and filter type
  useEffect(() => {
    let filtered = [...categoryServices];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    switch (filterType) {
      case "active":
        filtered = filtered.filter((service) => service.isActive);
        break;
      case "popular":
        filtered = filtered.filter((service) => service.popular);
        break;
      default:
        break;
    }

    setFilteredServices(filtered);
  }, [categoryServices, searchQuery, filterType]);

  const activeServices = categoryServices.filter((service) => service.isActive);
  const popularServices = categoryServices.filter((service) => service.popular);

  if (loading || categoryLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <TooltipProvider>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Collapsible Stats Section */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <Button
                variant="ghost"
                className="w-full justify-between p-2 h-auto hover:bg-transparent"
                onClick={() => setIsStatsExpanded(!isStatsExpanded)}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Quick Stats</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{categoryServices.length} total</span>
                    <span>•</span>
                    <span>{activeServices.length} active</span>
                    <span>•</span>
                    <span>{popularServices.length} featured</span>
                  </div>
                </div>
                {isStatsExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>

            <AnimatePresence>
              {isStatsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <CardContent className="pt-0">
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={containerVariants}
                      className="grid gap-4 md:grid-cols-3"
                    >
                      <StatCard
                        icon={Package}
                        label="Total Services"
                        value={categoryServices.length}
                        description="All services in category"
                        gradient="from-blue-500 to-cyan-500"
                      />
                      <StatCard
                        icon={Activity}
                        label="Active Services"
                        value={activeServices.length}
                        description="Currently available"
                        gradient="from-green-500 to-emerald-500"
                      />
                      <StatCard
                        icon={TrendingUp}
                        label="Popular Services"
                        value={popularServices.length}
                        description="Featured services"
                        gradient="from-purple-500 to-pink-500"
                      />
                    </motion.div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Services Section - Always Visible and Prominent */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Grid className="h-5 w-5 text-primary" />
                    Services
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredServices.length} of {categoryServices.length}{" "}
                    services
                  </p>
                </div>

                {categoryServices.length > 0 && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View Mode Toggle */}
                      <div className="flex items-center border rounded-lg p-1">
                        <Button
                          variant={viewMode === "grid" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("grid")}
                          className="h-8 w-8 p-0"
                        >
                          <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === "list" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("list")}
                          className="h-8 w-8 p-0"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            {filterType === "all"
                              ? "All"
                              : filterType === "active"
                              ? "Active"
                              : "Popular"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setFilterType("all")}
                          >
                            All Services
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setFilterType("active")}
                          >
                            Active Only
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setFilterType("popular")}
                          >
                            Popular Only
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <AnimatePresence mode="wait">
                {servicesLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "grid gap-4",
                      viewMode === "grid"
                        ? "md:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1"
                    )}
                  >
                    {[...Array(viewMode === "grid" ? 6 : 4)].map((_, i) => (
                      <Skeleton
                        key={i}
                        className={cn(
                          "w-full",
                          viewMode === "grid" ? "h-80" : "h-32"
                        )}
                      />
                    ))}
                  </motion.div>
                ) : filteredServices.length > 0 ? (
                  <motion.div
                    key="services"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className={cn(
                      "grid gap-6",
                      viewMode === "grid"
                        ? "md:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1"
                    )}
                  >
                    {filteredServices.map((service, index) => (
                      <motion.div
                        key={service._id.toString()}
                        variants={cardVariants}
                        whileHover="hover"
                        layout
                        custom={index}
                      >
                        <ServiceCard
                          service={service as unknown as IServiceDocument}
                          index={index}
                          viewMode={viewMode}
                          categories={categories}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : categoryServices.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-12"
                  >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                      <Grid className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">
                      No services yet
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                      This category doesn&apos;t have any services yet. Services
                      added to{" "}
                      <strong>
                        {category?.categoryName || "this category"}
                      </strong>{" "}
                      will appear here.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-8"
                  >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold">
                      No services found
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Try adjusting your search or filter criteria
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setFilterType("all");
                      }}
                      className="mt-4"
                    >
                      Clear filters
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}
