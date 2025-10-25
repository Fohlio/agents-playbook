import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { ROUTES } from "@/shared/routes";
import { Card, CardHeader, Link } from "@/shared/ui/atoms";

export default async function NewWorkflowPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card testId="workflow-constructor-placeholder">
        <CardHeader
          title="Workflow Constructor"
          description="Coming in Phase 3"
        />
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            The visual workflow constructor with drag-and-drop functionality will be available in Phase 3.
          </p>
          <Link href={ROUTES.DASHBOARD} variant="primary">
            Back to Dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
