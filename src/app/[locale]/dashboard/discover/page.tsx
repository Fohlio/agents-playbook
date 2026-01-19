import { redirect } from 'next/navigation';

/**
 * Discover Page - Deprecated
 *
 * The Discover functionality has been moved to the Library page as a tab.
 * This page redirects users to the Library with the Discover tab selected.
 */
export default function DiscoverPage() {
  redirect('/dashboard/library?tab=discover');
}
