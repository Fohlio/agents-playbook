"use client";

import { useEffect } from "react";
import { Card, CardHeader, Button, Link } from "@/shared/ui/atoms";
import { ROUTES } from "@/shared/routes";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card testId="dashboard-error">
        <CardHeader
          title="Something went wrong"
          description="We encountered an error loading your dashboard"
        />
        <div className="text-center py-8 space-y-4">
          <p className="text-gray-600">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="primary" onClick={reset} testId="error-retry-button">
              Try Again
            </Button>
            <Link href={ROUTES.HOME} variant="secondary">
              Go Home
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
