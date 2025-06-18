// components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Laptop,
  ChevronDown,
  Grid3X3,
  User,
  Menu,
  X,
  Package,
  Info,
  Home,
  Crown,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import MobileMenu from "./MobileHeader";

// Mock category data
const mockCategories = [
  { _id: "1", categoryName: "Delivery Services", serviceCount: 25 },
  { _id: "2", categoryName: "Home Services", serviceCount: 18 },
  { _id: "3", categoryName: "Shopping", serviceCount: 32 },
  { _id: "4", categoryName: "Cleaning", serviceCount: 15 },
];

// Navigation item interface
interface NavigationItem {
  title: string;
  href: string;
  children?: NavigationChild[];
  icon?: React.ReactNode;
}

interface NavigationChild {
  title: string;
  href: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
}

// Base navigation items
const navigationItems: NavigationItem[] = [
  {
    title: "Home",
    href: "/",
    icon: <Home className="h-4 w-4" />,
  },
  {
    title: "Services",
    href: "/errand-services",
    icon: <Package className="h-4 w-4" />,
    children: [
      {
        title: "All Categories",
        href: "/errand-services",
        description: "Browse all available categories and services",
        icon: <Grid3X3 className="h-4 w-4" />,
      },
      ...mockCategories.map((category) => ({
        title: category.categoryName,
        href: `/errand-services/categories/${category._id}`,
        description: `Explore ${category.categoryName} services`,
        badge: `${category.serviceCount}`,
      })),
    ],
  },
  {
    title: "How It Works",
    href: "/how-it-works",
    icon: <Info className="h-4 w-4" />,
    children: [
      {
        title: "Getting Started",
        href: "/how-it-works",
        description: "Learn how our platform works",
        icon: <Info className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "About",
    href: "/about-us",
    children: [
      {
        title: "Our Story",
        href: "/about-us/story",
        description: "Learn about our journey",
      },
      {
        title: "Team",
        href: "/about-us/team",
        description: "Meet our amazing team",
      },
      {
        title: "Contact",
        href: "/about-us/our-contacts",
        description: "Get in touch with us",
      },
    ],
  },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const userSession = session?.user?.id;
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-500 ease-out ${
          scrolled
            ? "bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl shadow-2xl border-b border-white/20 dark:border-gray-800/30"
            : "bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-transparent"
        }`}
        style={{
          backdropFilter: scrolled
            ? "blur(20px) saturate(180%)"
            : "blur(10px) saturate(120%)",
        }}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-blue-600/5 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex-shrink-0 group">
                <div className="flex items-center space-x-3 transition-all duration-300 group-hover:scale-105">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/50 to-blue-600/50 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Image
                      src="/errand_logo.jpg"
                      alt="Errand Mate"
                      width={40}
                      height={40}
                      className="relative object-cover w-10 h-10 rounded-full ring-2 ring-white/50 dark:ring-gray-800/50 shadow-lg"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-blue-600 text-transparent bg-clip-text tracking-tight">
                      Errand Mate
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                      Let us run it for you
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:space-x-2">
              {navigationItems.map((item) =>
                item.children ? (
                  <NavDropdown
                    key={item.title}
                    item={item}
                    isActive={isActive(item.href)}
                  />
                ) : (
                  <NavLink
                    key={item.title}
                    href={item.href}
                    isActive={isActive(item.href)}
                    icon={item.icon}
                  >
                    {item.title}
                  </NavLink>
                )
              )}
            </nav>

            {/* Desktop Auth Buttons and Theme Toggle */}
            <div className="hidden lg:flex items-center space-x-4">
              {!userSession ? (
                <>
                  <Link
                    href="/auth/users/login"
                    className="relative px-6 py-2.5 font-medium text-gray-700 dark:text-gray-300 transition-all duration-300 group"
                  >
                    <div className="absolute inset-0 bg-white/20 dark:bg-gray-800/20 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      Sign In
                    </span>
                  </Link>
                  <Link
                    href="/auth/users/register"
                    className="relative px-8 py-3 font-semibold text-white rounded-full overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-400 to-blue-600 transition-all duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center gap-2">
                      Register
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" />
                    </span>
                  </Link>
                </>
              ) : (
                <UserMenu />
              )}

              <ThemeSwitcher />
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-3">
              <ThemeSwitcher />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative w-12 h-12 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300"
              >
                <div className="relative w-6 h-6">
                  <Menu
                    className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                      mobileMenuOpen
                        ? "rotate-90 opacity-0"
                        : "rotate-0 opacity-100"
                    }`}
                  />
                  <X
                    className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                      mobileMenuOpen
                        ? "rotate-0 opacity-100"
                        : "-rotate-90 opacity-0"
                    }`}
                  />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navigationItems={navigationItems}
        isActive={isActive}
      />
    </>
  );
}

// Theme Switcher Component
function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-12 h-12 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 border border-white/30 dark:border-gray-700/30"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border border-white/20 dark:border-gray-800/30 rounded-2xl shadow-2xl"
        style={{ backdropFilter: "blur(20px) saturate(180%)" }}
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
        >
          <Sun className="mr-3 h-4 w-4" />
          <span>Light</span>
          {theme === "light" && (
            <span className="ml-auto text-blue-600">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
        >
          <Moon className="mr-3 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <span className="ml-auto text-blue-600">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
        >
          <Laptop className="mr-3 h-4 w-4" />
          <span>System</span>
          {theme === "system" && (
            <span className="ml-auto text-blue-600">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// User Menu Component
function UserMenu() {
  const { data: session } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex items-center gap-3 px-4 py-2 h-12 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 border border-white/30 dark:border-gray-700/30"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden relative bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center shadow-lg">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={`${session?.user?.name || "User"}'s avatar`}
                width={32}
                height={32}
                className="rounded-full object-cover"
                sizes="32px"
              />
            ) : (
              <span className="text-white text-sm font-semibold">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <span className="hidden sm:inline font-medium">
            {session?.user?.name || "Account"}
          </span>
          <ChevronDown className="h-4 w-4 transition-transform duration-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border border-white/20 dark:border-gray-800/30 rounded-2xl shadow-2xl"
        style={{ backdropFilter: "blur(20px) saturate(180%)" }}
      >
        <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {session?.user?.name || "User"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {session?.user?.email}
          </p>
        </div>
        <DropdownMenuGroup className="p-2">
          <DropdownMenuItem className="rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300">
            <Link href="/profile" className="flex w-full items-center gap-3">
              <User className="h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300">
            <Link
              href="/user/dashboard"
              className="flex w-full items-center gap-3"
            >
              <Grid3X3 className="h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300">
            <Link
              href="/user/orders"
              className="flex w-full items-center gap-3"
            >
              <Package className="h-4 w-4" />
              My Orders
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {(session?.user?.role === "super_admin" ||
          session?.user?.role === "admin") && (
          <>
            <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
            <DropdownMenuGroup className="p-2">
              <DropdownMenuItem className="rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-all duration-300">
                <Link
                  href="/admin"
                  className="flex w-full items-center gap-3 text-blue-600 dark:text-blue-400"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Link>
              </DropdownMenuItem>
              {session?.user?.role === "super_admin" && (
                <DropdownMenuItem className="rounded-xl hover:bg-purple-50/50 dark:hover:bg-purple-950/50 transition-all duration-300">
                  <Link
                    href="/admin/super"
                    className="flex w-full items-center gap-3 text-purple-600 dark:text-purple-400"
                  >
                    <Crown className="h-4 w-4" />
                    Super Admin
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
        <div className="p-2">
          <button className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50/50 dark:hover:bg-red-950/50 transition-all duration-300">
            Sign Out
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Desktop Nav Link
function NavLink({
  href,
  children,
  isActive,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-2 px-6 py-3 font-medium transition-all duration-300 group rounded-2xl ${
        isActive
          ? "text-blue-600 dark:text-blue-400 bg-white/30 dark:bg-blue-950/30 shadow-lg"
          : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 dark:hover:bg-gray-800/20"
      }`}
    >
      {icon && (
        <span className="transition-transform duration-300 group-hover:scale-110">
          {icon}
        </span>
      )}
      <span>{children}</span>
      <div
        className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-red-500 to-blue-600 transition-all duration-300 ${
          isActive
            ? "w-1/2 opacity-100"
            : "w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-100"
        }`}
      />
    </Link>
  );
}

// Desktop Nav Dropdown
function NavDropdown({
  item,
  isActive,
}: {
  item: NavigationItem;
  isActive: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`relative flex items-center gap-2 px-6 py-3 font-medium transition-all duration-300 group rounded-2xl ${
            isActive
              ? "text-blue-600 dark:text-blue-400 bg-white/30 dark:bg-blue-950/30 shadow-lg"
              : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 dark:hover:bg-gray-800/20"
          }`}
        >
          {item.icon && (
            <span className="transition-transform duration-300 group-hover:scale-110">
              {item.icon}
            </span>
          )}
          <span>{item.title}</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
          <div
            className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-red-500 to-blue-600 transition-all duration-300 ${
              isActive
                ? "w-1/2 opacity-100"
                : "w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-100"
            }`}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-6 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border border-white/20 dark:border-gray-800/30 rounded-2xl shadow-2xl"
        align="center"
        sideOffset={12}
        style={{ backdropFilter: "blur(20px) saturate(180%)" }}
      >
        <div className="grid gap-3">
          {item.children?.map((child) => (
            <Link
              key={child.title}
              href={child.href}
              className="flex items-start p-4 rounded-xl text-sm hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 group"
            >
              {child.icon && (
                <div className="mr-4 mt-0.5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300">
                  {child.icon}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {child.title}
                  </span>
                  {child.badge && (
                    <span className="px-2 py-1 text-xs bg-gradient-to-r from-red-500/20 to-blue-600/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200/30 dark:border-blue-800/30">
                      {child.badge}
                    </span>
                  )}
                </div>
                {child.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {child.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
