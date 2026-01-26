import { notFound } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { getSharedContent } from "@/features/sharing/lib/share-service";
import { SharedWorkflowView } from "@/features/sharing/components/SharedWorkflowView";
import { SharedMiniPromptView } from "@/features/sharing/components/SharedMiniPromptView";
import { SharedSkillView } from "@/features/sharing/components/SharedSkillView";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ token: string }>;
}

interface SharedContentBase {
  name: string;
  description?: string | null;
  content?: string;
  user: { username: string };
  tags?: Array<{ tag: { name: string } }>;
}

/**
 * Build consistent metadata for shared content
 */
function buildSharedMetadata(
  content: SharedContentBase,
  typeLabel: string,
  extraInfo: string,
  url: string,
  logoUrl: string
): Metadata {
  const title = `${content.name} - Shared ${typeLabel}`;
  const baseDescription = content.description || content.content?.substring(0, 160) || `View shared ${typeLabel.toLowerCase()}: ${content.name}`;
  const tagsText = content.tags?.length ? `Tags: ${content.tags.map(t => t.tag.name).join(', ')}` : '';
  const fullDescription = [baseDescription, extraInfo, tagsText, `By @${content.user.username}`]
    .filter(Boolean)
    .join(' \u2022 ');

  return {
    title,
    description: fullDescription,
    openGraph: {
      title,
      description: fullDescription,
      url,
      type: "website",
      siteName: "Agents Playbook",
      images: [{ url: logoUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: fullDescription,
      images: [logoUrl],
    },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const result = await getSharedContent(token, false);
  const baseUrl = process.env.NEXTAUTH_URL || 'https://agents-playbook.com';
  const url = `${baseUrl}/s/${token}`;

  if (!result.success) {
    const notFoundMeta = {
      title: "Shared Content Not Found",
      description: "This shared link is invalid or has expired.",
    };
    return {
      ...notFoundMeta,
      openGraph: { ...notFoundMeta, url, type: "website" },
      twitter: { card: "summary", ...notFoundMeta },
    };
  }

  const logoUrl = `${baseUrl}/logo.png`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = result.content as any;

  if (result.targetType === "WORKFLOW") {
    const stagesCount = Array.isArray(content.stages) ? content.stages.length : 0;
    const extraInfo = stagesCount > 0 ? `${stagesCount} stage${stagesCount !== 1 ? 's' : ''}` : '';
    return buildSharedMetadata(content, "Workflow", extraInfo, url, logoUrl);
  }

  if (result.targetType === "SKILL") {
    const attachmentsCount = Array.isArray(content.attachments) ? content.attachments.length : 0;
    const extraInfo = attachmentsCount > 0 ? `${attachmentsCount} attachment${attachmentsCount !== 1 ? 's' : ''}` : '';
    return buildSharedMetadata(content, "Skill", extraInfo, url, logoUrl);
  }

  return buildSharedMetadata(content, "Mini-Prompt", '', url, logoUrl);
}

/**
 * Create import handler for shared content
 */
function createImportHandler(apiPath: string, itemType: string) {
  return async () => {
    "use server";
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3012";
    const response = await fetch(`${baseUrl}${apiPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to import ${itemType}`);
    }

    return response.json();
  };
}

export default async function SharedContentPage({ params }: PageProps) {
  const { token } = await params;
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  const result = await getSharedContent(token, true);

  if (!result.success) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = result.content as any;
  const isPublic = content.visibility === "PUBLIC";

  if (result.targetType === "WORKFLOW") {
    const handleImport = createImportHandler(`/api/v1/workflows/import/${content.id}`, "workflow");
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <SharedWorkflowView
          workflow={content}
          isAuthenticated={isAuthenticated}
          onImport={isPublic ? handleImport : undefined}
        />
      </div>
    );
  }

  if (result.targetType === "SKILL") {
    const handleImport = createImportHandler(`/api/skills/${content.id}/import`, "skill");
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <SharedSkillView
          skill={content}
          isAuthenticated={isAuthenticated}
          onImport={isPublic ? handleImport : undefined}
        />
      </div>
    );
  }

  if (result.targetType === "MINI_PROMPT") {
    const handleImport = createImportHandler(`/api/v1/mini-prompts/import/${content.id}`, "mini-prompt");
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <SharedMiniPromptView
          miniPrompt={content}
          isAuthenticated={isAuthenticated}
          onImport={isPublic ? handleImport : undefined}
        />
      </div>
    );
  }

  notFound();
}
