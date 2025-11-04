import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getSharedContent } from "@/features/sharing/lib/share-service";
import { SharedWorkflowView } from "@/features/sharing/components/SharedWorkflowView";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const result = await getSharedContent(token, false);

  if (!result.success || result.targetType !== "WORKFLOW") {
    return {
      title: "Shared Workflow Not Found",
      description: "This shared workflow link is invalid or has expired.",
    };
  }

  const workflow = result.content as unknown as {
    id: string;
    name: string;
    description: string | null;
    visibility: "PUBLIC" | "PRIVATE";
    user: { id: string; username: string };
    stages: unknown[];
    tags: Array<{ tag: { name: string; id: string; color: string | null } }>;
  };
  return {
    title: `${workflow.name} - Shared Workflow`,
    description:
      workflow.description || `View shared workflow: ${workflow.name}`,
  };
}

export default async function SharedWorkflowPage({ params }: PageProps) {
  const { token } = await params;
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  // Fetch shared content
  const result = await getSharedContent(token, true);

  // Handle errors
  if (!result.success) {
    notFound();
  }

  // Verify it's a workflow
  if (result.targetType !== "WORKFLOW") {
    notFound();
  }

  const workflow = result.content as unknown as {
    id: string;
    name: string;
    description: string | null;
    visibility: "PUBLIC" | "PRIVATE";
    user: { id: string; username: string };
    stages: unknown[];
    tags: Array<{ tag: { name: string; id: string; color: string | null } }>;
  };

  // Import handler (client-side action)
  const handleImport = async () => {
    "use server";
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3012"}/api/v1/workflows/import/${workflow.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to import workflow");
    }

    return response.json();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SharedWorkflowView
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        workflow={workflow as any}
        isAuthenticated={isAuthenticated}
        onImport={workflow.visibility === "PUBLIC" ? handleImport : undefined}
      />
    </div>
  );
}
