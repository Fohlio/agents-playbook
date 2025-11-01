import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { SystemPromptsManager } from './_components/SystemPromptsManager';

export const metadata = {
  title: 'System Prompts | Admin',
  description: 'Manage automatic system mini-prompts'
};

export default async function SystemPromptsPage() {
  const session = await auth();

  // Check admin role
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          System Prompts
        </h1>
        <p className="text-text-secondary">
          Manage automatic mini-prompts that are attached to workflows based on settings.
        </p>
      </div>

      <SystemPromptsManager />
    </div>
  );
}
