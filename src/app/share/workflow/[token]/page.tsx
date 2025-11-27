import { notFound, redirect } from "next/navigation";
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
  const baseUrl = process.env.NEXTAUTH_URL || 'https://agents-playbook.com';
  const url = `${baseUrl}/share/workflow/${token}`;

  if (!result.success || result.targetType !== "WORKFLOW") {
    return {
      title: "Shared Workflow Not Found",
      description: "This shared workflow link is invalid or has expired.",
      openGraph: {
        title: "Shared Workflow Not Found",
        description: "This shared workflow link is invalid or has expired.",
        url,
        type: "website",
      },
      twitter: {
        card: "summary",
        title: "Shared Workflow Not Found",
        description: "This shared workflow link is invalid or has expired.",
      },
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

  const title = `${workflow.name} - Shared Workflow`;
  const description = workflow.description || `View shared workflow: ${workflow.name}`;
  const stagesCount = Array.isArray(workflow.stages) ? workflow.stages.length : 0;
  const tagsText = workflow.tags?.length > 0 
    ? `Tags: ${workflow.tags.map(t => t.tag.name).join(', ')}` 
    : '';
  const fullDescription = `${description}${stagesCount > 0 ? ` • ${stagesCount} stage${stagesCount !== 1 ? 's' : ''}` : ''}${tagsText ? ` • ${tagsText}` : ''} • By @${workflow.user.username}`;

  return {
    title,
    description: fullDescription,
    openGraph: {
      title,
      description: fullDescription,
      url,
      type: "website",
      siteName: "Agents Playbook",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: fullDescription,
      images: ["/og-image.png"],
    },
  };
}

export default async function SharedWorkflowPage({ params }: PageProps) {
  const { token } = await params;
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    redirect("/dashboard");
  }

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
