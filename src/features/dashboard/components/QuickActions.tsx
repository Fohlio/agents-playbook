"use client";

import { Button } from "@/shared/ui/atoms";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="flex gap-4" data-testid="quick-actions">
      <Button
        variant="primary"
        onClick={() => router.push("/dashboard/workflows/new")}
        testId="create-workflow-button"
      >
        Create Workflow
      </Button>

      <Button
        variant="secondary"
        onClick={() => router.push("/dashboard/mini-prompts/new")}
        testId="create-mini-prompt-button"
      >
        Create Mini-Prompt
      </Button>

      <Button
        variant="secondary"
        onClick={() => router.push("/dashboard/discover")}
        testId="discover-button"
      >
        Discover Public
      </Button>
    </div>
  );
}
