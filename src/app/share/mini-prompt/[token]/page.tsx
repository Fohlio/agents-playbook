import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getSharedContent } from "@/features/sharing/lib/share-service";
import { SharedMiniPromptView } from "@/features/sharing/components/SharedMiniPromptView";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const result = await getSharedContent(token, false);
  const baseUrl = process.env.NEXTAUTH_URL || 'https://agents-playbook.com';
  const url = `${baseUrl}/share/mini-prompt/${token}`;

  if (!result.success || result.targetType !== "MINI_PROMPT") {
    return {
      title: "Shared Mini-Prompt Not Found",
      description: "This shared mini-prompt link is invalid or has expired.",
      openGraph: {
        title: "Shared Mini-Prompt Not Found",
        description: "This shared mini-prompt link is invalid or has expired.",
        url,
        type: "website",
      },
      twitter: {
        card: "summary",
        title: "Shared Mini-Prompt Not Found",
        description: "This shared mini-prompt link is invalid or has expired.",
      },
    };
  }

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

export default async function SharedMiniPromptPage({ params }: PageProps) {
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

  // Verify it's a mini-prompt
  if (result.targetType !== "MINI_PROMPT") {
    notFound();
  }

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
