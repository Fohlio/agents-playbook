import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { ROUTES } from '@/shared/routes';
import { GettingStartedWizard } from '@/features/getting-started';

/**
 * Getting Started Page
 *
 * Onboarding wizard for new users
 * Requires authentication
 */
export default async function GettingStartedPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }

  return <GettingStartedWizard />;
}
