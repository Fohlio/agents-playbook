import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkflowEditPage({ params }: PageProps) {
  const { id } = await params;
  // Redirect to constructor page (actual workflow editor)
  redirect(`/dashboard/library/workflows/${id}/constructor`);
}
