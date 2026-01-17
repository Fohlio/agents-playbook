'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Tabs } from '@/shared/ui/molecules/Tabs';
import { WorkflowsSection } from '@/views/library/components/WorkflowsSection';
import { MiniPromptsSection } from '@/views/library/components/MiniPromptsSection';

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'workflows';
  const t = useTranslations('library');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
        <p className="text-sm text-text-secondary mt-1">
          {t('subtitle')}
        </p>
      </div>

      <Tabs
        defaultTab={defaultTab}
        tabs={[
          {
            id: 'workflows',
            label: t('workflows.title'),
            content: <WorkflowsSection />,
          },
          {
            id: 'mini-prompts',
            label: t('miniPrompts.title'),
            content: <MiniPromptsSection />,
          },
        ]}
      />
    </div>
  );
}
