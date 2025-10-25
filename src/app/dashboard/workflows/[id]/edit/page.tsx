import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/routes";
import Link from "next/link";

export default async function WorkflowEditorPage() {
  const session = await auth();
  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-base border border-gray-200 p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Workflow Editor
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Coming in Phase 3
        </p>
        <p className="text-sm text-gray-500 mb-8">
          This feature will allow you to edit and customize your workflows with a visual editor.
        </p>
        <Link
          href={ROUTES.DASHBOARD}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
