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
        onClick={() => router.push(ROUTES.WORKFLOWS.NEW)}
        testId="create-workflow-button"
      >
        Create Workflow
      </Button>

      <Button
        variant="secondary"
        onClick={() => router.push(ROUTES.MINI_PROMPTS.NEW)}
        testId="create-mini-prompt-button"
      >
        Create Mini-Prompt
      </Button>

      <Button
        variant="secondary"
        onClick={() => router.push(ROUTES.DISCOVER)}
        testId="discover-button"
      >
        Discover Public
      </Button>
    </div>
  );
}
