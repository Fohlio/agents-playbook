import { notFound } from 'next/navigation';
import { auth } from '@/server/auth/auth';
import { SkillStudio } from '@/views/skill-studio/components/SkillStudio';

export default async function NewSkillPage() {
  const session = await auth();
  if (!session?.user) {
    notFound();
  }

  return <SkillStudio />;
}
