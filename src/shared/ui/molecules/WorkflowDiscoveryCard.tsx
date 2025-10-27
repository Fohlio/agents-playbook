"use client";

import { useState } from "react";
import { Card, Button, Badge } from "@/shared/ui/atoms";
import { ROUTES } from "@/shared/routes";
import { PublicWorkflowWithMeta } from "@/features/public-discovery/types";
import { WorkflowPreviewModal } from "./WorkflowPreviewModal";

interface WorkflowDiscoveryCardProps {
  workflow: PublicWorkflowWithMeta;
  onImport: (id: string) => void;
  isAuthenticated: boolean;
  isImporting?: boolean;
  currentUserId?: string;
}

export function WorkflowDiscoveryCard({
  workflow,
  onImport,
  isAuthenticated,
  isImporting,
  currentUserId,
}: WorkflowDiscoveryCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isOwnWorkflow = Boolean(currentUserId && workflow.userId === currentUserId);

  const handleImportClick = () => {
    if (!isAuthenticated) {
      window.location.href = `${ROUTES.LOGIN}?returnUrl=${ROUTES.DISCOVER}`;
    } else {
      onImport(workflow.id);
    }
  };

  return (
    <>
      <div
        onClick={() => setIsPreviewOpen(true)}
        className="cursor-pointer"
      >
        <Card
          testId={`workflow-card-${workflow.id}`}
          className="hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              {workflow.name}
            </h3>
            {workflow.averageRating && (
              <Badge variant="default" testId="rating-badge">
                ★ {workflow.averageRating.toFixed(1)}
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {workflow.description || "No description available"}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              @{workflow.user.username}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {workflow._count.stages} {workflow._count.stages === 1 ? 'stage' : 'stages'}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {workflow._count.references} {workflow._count.references === 1 ? 'user' : 'users'}
            </span>
          </div>

          {!isOwnWorkflow && (
            <div className="flex items-center justify-end">
              <Button
                variant={workflow.isInUserLibrary ? "secondary" : "primary"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImportClick();
                }}
                disabled={workflow.isInUserLibrary || isImporting}
                testId={`import-button-${workflow.id}`}
              >
                {workflow.isInUserLibrary
                  ? "In Library"
                  : isAuthenticated
                    ? "Add to Library"
                    : "Login to Import"}
              </Button>
            </div>
          )}
        </div>
        </Card>
      </div>

      <WorkflowPreviewModal
        workflow={workflow}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onImport={handleImportClick}
        isAuthenticated={isAuthenticated}
        isImporting={isImporting}
        isOwnWorkflow={isOwnWorkflow}
      />
    </>
  );
}
