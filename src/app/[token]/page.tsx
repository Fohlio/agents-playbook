import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getSharedContent } from "@/features/sharing/lib/share-service";
import { SharedWorkflowView } from "@/features/sharing/components/SharedWorkflowView";
import { SharedMiniPromptView } from "@/features/sharing/components/SharedMiniPromptView";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const result = await getSharedContent(token, false);
  const baseUrl = process.env.NEXTAUTH_URL || 'https://agents-playbook.com';
  const url = `${baseUrl}/${token}`;

  if (!result.success) {
    return {
      title: "Shared Content Not Found",
      description: "This shared link is invalid or has expired.",
      openGraph: {
        title: "Shared Content Not Found",
        description: "This shared link is invalid or has expired.",
        url,
        type: "website",
      },
      twitter: {
        card: "summary",
        title: "Shared Content Not Found",
        description: "This shared link is invalid or has expired.",
      },
    };
  }

  const logoUrl = `${baseUrl}/logo.png`;

  if (result.targetType === "WORKFLOW") {
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
            url: logoUrl,
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
        images: [logoUrl],
      },
    };
  } else {
    const miniPrompt = result.content as {
      id: string;
      name: string;
      content: string;
      visibility: "PUBLIC" | "PRIVATE";
      user: { id: string; username: string };
      tags: Array<{ tag: { name: string; id: string; color: string | null } }>;
    };

    const title = `${miniPrompt.name} - Shared Mini-Prompt`;
    const description = miniPrompt.content?.substring(0, 160) || `View shared mini-prompt: ${miniPrompt.name}`;
    const tagsText = miniPrompt.tags?.length > 0 
      ? `Tags: ${miniPrompt.tags.map(t => t.tag.name).join(', ')}` 
      : '';
    const fullDescription = `${description}${tagsText ? ` • ${tagsText}` : ''} • By @${miniPrompt.user.username}`;

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
            url: logoUrl,
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
        images: [logoUrl],
      },
    };
  }
}

export default async function SharedContentPage({ params }: PageProps) {
  const { token } = await params;
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  // Fetch shared content
  const result = await getSharedContent(token, true);

  // Handle errors
  if (!result.success) {
    notFound();
  }

  // Handle workflow
  if (result.targetType === "WORKFLOW") {
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

  // Handle mini-prompt
  if (result.targetType === "MINI_PROMPT") {
    const miniPrompt = result.content as {
      id: string;
      name: string;
      content: string;
      visibility: "PUBLIC" | "PRIVATE";
      user: { id: string; username: string };
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
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3012"}/api/v1/mini-prompts/import/${miniPrompt.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to import mini-prompt");
      }

      return response.json();
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <SharedMiniPromptView
          miniPrompt={miniPrompt}
          isAuthenticated={isAuthenticated}
          onImport={miniPrompt.visibility === "PUBLIC" ? handleImport : undefined}
        />
      </div>
    );
  }

  // Should not reach here, but handle just in case
  notFound();
}

