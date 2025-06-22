// app/errand-services/categories/layout.tsx
"use client";

import { Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import { JSX, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Image from "next/image";
import { useCategories } from "@/hooks/admin/useCategory";
import { Category } from "@/store/types/dataTypes";

interface PublicCategoryLayoutProps {
  children: React.ReactNode;
}

export default function PublicCategoryLayout({
  children,
}: PublicCategoryLayoutProps): JSX.Element {
  const { categories, getCategories } = useCategories();
  const pathname = usePathname();

  // Get current category for breadcrumb
  const getCurrentCategory = (): Category | null => {
    const pathSegments = pathname.split("/");
    const categoryId = pathSegments[pathSegments.length - 1];

    if (categoryId && categoryId !== "categories") {
      return (
        categories.find((cat) => cat._id.toString() === categoryId) || null
      );
    }
    return null;
  };

  const currentCategory = getCurrentCategory();
  const isOnCategoryPage =
    pathname.includes("/categories/") && pathname.split("/").length > 3;

  // Fetch categories on component mount
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        await getCategories({ limit: 20 });
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchData();
  }, [getCategories]);

  const getDescriptionText = (
    isOnCategoryPage: boolean,
    currentCategory: Category | null
  ): string => {
    if (isOnCategoryPage) {
      return (
        currentCategory?.description ||
        "Explore comprehensive services available in this category. Find the perfect solution for your needs."
      );
    }

    return "Discover our comprehensive range of errand service categories. From everyday tasks to specialized services, find exactly what you need.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-slate-900/75">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo/Title Section */}
            <div className="flex items-center gap-4">
              {currentCategory?.catImage?.url && (
                <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                  <Image
                    src={currentCategory.catImage.url}
                    alt={
                      currentCategory.catImage.catName ||
                      currentCategory.categoryName
                    }
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isOnCategoryPage
                    ? currentCategory?.categoryName || "Category"
                    : "Categories"}
                </h1>
                {isOnCategoryPage && (
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Errand Services
                  </p>
                )}
              </div>
            </div>

            {/* Breadcrumb Navigation */}
            <nav className="hidden md:block">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link
                        href="/"
                        className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <Home className="h-4 w-4" />
                        <span>Home</span>
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link
                        href="/errand-services"
                        className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Errand Services
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    {isOnCategoryPage ? (
                      <BreadcrumbLink asChild>
                        <Link
                          href="/errand-services/categories"
                          className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          Categories
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-gray-900 dark:text-white font-medium">
                        Categories
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {isOnCategoryPage && (
                    <>
                      <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4" />
                      </BreadcrumbSeparator>
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-gray-900 dark:text-white font-medium max-w-[200px] truncate">
                          {currentCategory?.categoryName || "Category"}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </nav>
          </div>

          {/* Mobile Breadcrumb */}
          <div className="block md:hidden pb-3">
            <Breadcrumb>
              <BreadcrumbList className="text-sm">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href="/"
                      className="flex items-center gap-1 text-gray-600 dark:text-slate-400"
                    >
                      <Home className="h-3 w-3" />
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-400" />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href="/errand-services"
                      className="text-gray-600 dark:text-slate-400"
                    >
                      Services
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-400" />
                <BreadcrumbItem>
                  {isOnCategoryPage ? (
                    <BreadcrumbLink asChild>
                      <Link
                        href="/errand-services/categories"
                        className="text-gray-600 dark:text-slate-400"
                      >
                        Categories
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-gray-900 dark:text-white font-medium">
                      Categories
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {isOnCategoryPage && (
                  <>
                    <BreadcrumbSeparator className="text-gray-400" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-gray-900 dark:text-white font-medium max-w-[120px] truncate">
                        {currentCategory?.categoryName || "Category"}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header Section */}
        <section className="py-8 lg:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              {/* Status indicator */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    {isOnCategoryPage
                      ? "Category Services"
                      : "Service Categories"}
                  </span>
                </div>
              </div>

              {/* Main description with enhanced typography */}
              <div className="relative">
                <p className="text-xl font-medium text-gray-900 dark:text-slate-100 leading-relaxed tracking-tight">
                  {getDescriptionText(isOnCategoryPage, currentCategory)}
                </p>

                {/* Accent line */}
                <div className="mt-3 h-0.5 w-16 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 rounded-full" />
              </div>
            </div>

            <div className="flex items-center gap-3 lg:flex-shrink-0">
              {!isOnCategoryPage && (
                <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500 dark:text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {categories.length}
                    </span>
                    <span>Categories</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="pb-12 lg:pb-16">
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-gray-200/5 dark:ring-slate-700/50">
            <div className="relative">
              {/* Optional gradient overlay for visual depth */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-slate-900/50 pointer-events-none" />

              {/* Main content */}
              <div className="relative">{children}</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
