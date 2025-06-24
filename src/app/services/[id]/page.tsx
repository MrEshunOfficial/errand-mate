"use client";
import { useServices } from "@/hooks/admin/useServices";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Package,
  Users,
  Heart,
  Share2,
  MessageCircle,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for providers (replace with actual data)
const mockProviders = [
  {
    id: "1",
    name: "Sarah Johnson",
    rating: 4.9,
    reviews: 156,
    avatar: "/avatars/sarah.jpg",
    specialties: ["Premium Service", "Quick Response"],
    distance: "0.8 km away",
    price: "$45/hr",
    available: true,
  },
  {
    id: "2",
    name: "Mike Chen",
    rating: 4.8,
    reviews: 203,
    avatar: "/avatars/mike.jpg",
    specialties: ["Experienced", "Reliable"],
    distance: "1.2 km away",
    price: "$38/hr",
    available: true,
  },
  {
    id: "3",
    name: "Emma Wilson",
    rating: 4.7,
    reviews: 89,
    avatar: "/avatars/emma.jpg",
    specialties: ["Fast Delivery", "Quality Work"],
    distance: "2.1 km away",
    price: "$42/hr",
    available: false,
  },
  {
    id: "4",
    name: "David Rodriguez",
    rating: 4.9,
    reviews: 234,
    avatar: "/avatars/david.jpg",
    specialties: ["Expert Level", "24/7 Available"],
    distance: "1.5 km away",
    price: "$50/hr",
    available: true,
  },
  {
    id: "5",
    name: "Lisa Thompson",
    rating: 4.6,
    reviews: 167,
    avatar: "/avatars/lisa.jpg",
    specialties: ["Budget Friendly", "Quick Turnaround"],
    distance: "3.2 km away",
    price: "$35/hr",
    available: true,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const imageVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

const badgeVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      delay: 0.3,
      ease: "easeOut",
    },
  },
};

export default function ServiceRequestPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const [isLiked, setIsLiked] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Use selectedService instead of services for single service data
  const { selectedService, getServiceById, loading, error } = useServices();

  useEffect(() => {
    if (serviceId) {
      getServiceById(serviceId);
    }
  }, [serviceId, getServiceById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-400 font-medium"
          >
            Loading service details...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error || !selectedService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-red-600 dark:text-red-400 mb-4 text-lg">
            {error || "Service not found"}
          </p>
          <Link href="/services">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className=" container mx-auto max-w-7xl min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Header Section */}
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-pink-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)]" />

        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Navigation */}
            <motion.div variants={itemVariants} className="mb-8">
              <Link href="/services">
                <motion.div
                  whileHover={{ x: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                >
                  <motion.div
                    whileHover={{ rotate: -180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </motion.div>
                  <span className="font-medium">Back to Services</span>
                </motion.div>
              </Link>
            </motion.div>

            {/* Service Header */}
            <motion.div
              variants={containerVariants}
              className="flex flex-col lg:flex-row lg:items-start gap-8"
            >
              {/* Service Image */}
              <motion.div
                variants={imageVariants}
                whileHover="hover"
                className="flex-shrink-0"
              >
                <div className="relative w-40 h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-3xl overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center">
                    {selectedService.serviceImage?.url ? (
                      <Image
                        src={selectedService.serviceImage.url}
                        alt={selectedService.title}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Service Info */}
              <motion.div variants={itemVariants} className="flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <motion.h1
                      variants={itemVariants}
                      className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4"
                    >
                      {selectedService.title}
                    </motion.h1>

                    <AnimatePresence>
                      {selectedService.popular && (
                        <motion.div
                          variants={badgeVariants}
                          initial="hidden"
                          animate="visible"
                          className="mb-4"
                        >
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                            <Star className="w-4 h-4 mr-2 fill-current" />
                            Popular Service
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action Buttons */}
                  <motion.div
                    variants={itemVariants}
                    className="flex items-center gap-3"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsLiked(!isLiked)}
                      className={`p-3 rounded-full transition-all duration-300 ${
                        isLiked
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                      />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                    >
                      <Share2 className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                </div>

                <motion.p
                  variants={itemVariants}
                  className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed max-w-3xl"
                >
                  {selectedService.description}
                </motion.p>

                {/* Service Stats */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-wrap gap-6"
                >
                  {[
                    {
                      icon: Users,
                      text: `${mockProviders.length} Providers Available`,
                      color: "text-blue-600",
                    },
                    {
                      icon: Clock,
                      text: "Quick Response",
                      color: "text-green-600",
                    },
                    {
                      icon: MapPin,
                      text: "Service Available in Your Area",
                      color: "text-purple-600",
                    },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                    >
                      <stat.icon className={`w-5 h-5 mr-3 ${stat.color}`} />
                      <span className="font-medium">{stat.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="px-2 py-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Providers Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 sticky top-8 overflow-hidden">
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Users className="w-5 h-5 mr-3 text-blue-600" />
                  Available Providers
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Choose from {mockProviders.filter((p) => p.available).length}{" "}
                  available providers
                </p>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="p-4 space-y-4">
                  {mockProviders.map((provider, index) => (
                    <motion.div
                      key={provider.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                        selectedProvider === provider.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : provider.available
                          ? "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800/50"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 opacity-60"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                          <AvatarImage
                            src={provider.avatar}
                            alt={provider.name}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {provider.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {provider.name}
                            </h3>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                provider.available
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            />
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                                {provider.rating}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              ({provider.reviews} reviews)
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-2">
                            {provider.specialties
                              .slice(0, 2)
                              .map((specialty, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs px-2 py-0.5"
                                >
                                  {specialty}
                                </Badge>
                              ))}
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                              {provider.distance}
                            </span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {provider.price}
                            </span>
                          </div>

                          {provider.available && (
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" className="flex-1 h-8 text-xs">
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Chat
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2"
                              >
                                <Phone className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </motion.div>

          {/* Main Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Request Service
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Fill out the details below to request this service
                </p>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="p-6">
                  <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">
                      Service Request Form
                    </h3>
                    <p>The main content form will be implemented here</p>
                    <p className="text-sm mt-2">
                      This area is scrollable and ready for your form components
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
