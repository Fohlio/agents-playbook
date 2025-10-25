import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { ROUTES } from "@/shared/routes";
import { Card, CardHeader, Link } from "@/shared/ui/atoms";

export default async function NewMiniPromptPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card testId="mini-prompt-editor-placeholder">
        <CardHeader
          title="Mini-Prompt Editor"
          description="Coming in Phase 3"
        />
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            The mini-prompt editor with markdown support and phase categorization will be available in Phase 3.
          </p>
          <Link href={ROUTES.DASHBOARD} variant="primary">
            Back to Dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
