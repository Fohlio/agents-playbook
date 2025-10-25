"use client";

import { useSession } from "next-auth/react";
import { Link, Badge, Card, CardHeader } from "@/shared/ui/atoms";
import { ROUTES } from "@/shared/routes";

/**
 * Dashboard Page
 * 
 * Main landing page after user authentication.
 * Displays user information and quick links to key features.
 */
export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
    </div>
  );
}

