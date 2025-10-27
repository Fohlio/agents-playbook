'use client';

import { useSearchParams } from 'next/navigation';
import { Tabs } from '@/shared/ui/molecules/Tabs';
import { WorkflowsSection } from '@/features/library/components/WorkflowsSection';
import { MiniPromptsSection } from '@/features/library/components/MiniPromptsSection';

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'workflows';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Library</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your workflows and mini-prompts
        </p>
      </div>

      <Tabs
        defaultTab={defaultTab}
        tabs={[
          {
            id: 'workflows',
            label: 'Workflows',
            content: <WorkflowsSection />,
          },
          {
            id: 'mini-prompts',
            label: 'Mini-Prompts',
            content: <MiniPromptsSection />,
          },
        ]}
      />
    </div>
  );
}
