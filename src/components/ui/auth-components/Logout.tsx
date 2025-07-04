// components/Logout.tsx
"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { doLogout } from "@/app/actions";
import { useToast } from "../use-toast";

interface LogoutProps {
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function Logout({
  className = "",
  showIcon = true,
  children,
}: LogoutProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleLogout = async () => {
    startTransition(async () => {
      try {
        await doLogout();
        toast({
          title: "Success",
          description: "Logged out successfully",
        });
      } catch (error) {
        console.error("Logout error:", error);
        toast({
          title: "Error",
          description: "Failed to logout. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className={`flex items-center w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isPending ? (
        <Loader2
          className={`h-4 w-4 animate-spin ${
            children || showIcon ? "mr-2" : ""
          }`}
        />
      ) : (
        showIcon && <LogOut className={`h-4 w-4 ${children ? "" : "mr-2"}`} />
      )}
      {children || (isPending ? "Logging out..." : "Logout")}
    </button>
  );
}
