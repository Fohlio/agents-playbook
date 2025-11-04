import { notFound } from "next/navigation";
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

  if (!result.success || result.targetType !== "MINI_PROMPT") {
    return {
      title: "Shared Mini-Prompt Not Found",
      description: "This shared mini-prompt link is invalid or has expired.",
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
  return {
    title: `${miniPrompt.name} - Shared Mini-Prompt`,
    description: miniPrompt.content?.substring(0, 160) || `View shared mini-prompt: ${miniPrompt.name}`,
  };
}

export default async function SharedMiniPromptPage({ params }: PageProps) {
  const { token } = await params;
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

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
