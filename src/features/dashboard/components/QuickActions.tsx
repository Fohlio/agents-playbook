"use client";

import { Button } from "@/shared/ui/atoms";
import { ROUTES } from "@/shared/routes";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="flex gap-4" data-testid="quick-actions">
      <Button
        variant="primary"
        onClick={() => router.push(ROUTES.WORKFLOWS.LIST)}
        testId="workflows-button"
      >
        Workflows
      </Button>

      <Button
        variant="secondary"
        onClick={() => router.push(ROUTES.MINI_PROMPTS.LIST)}
        testId="mini-prompts-button"
      >
        Mini Prompts
      </Button>
    </div>
  );
}
