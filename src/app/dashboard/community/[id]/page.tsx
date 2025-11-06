import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/client";
import { getMessages } from "@/features/community/actions/message-actions";
import { TopicHeader } from "@/features/community/components/TopicHeader";
import { MessageList } from "@/features/community/components/MessageList";

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  // Get topic with author
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      author: {
        select: { username: true },
      },
    },
  });

  if (!topic) {
    notFound();
  }

  // Get all messages
  const { messages } = await getMessages(id, page);

  const isAdmin = session?.user?.role === "ADMIN";
  const isOwner = session?.user?.id === topic.authorId;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <TopicHeader
        topic={topic}
        isAdmin={isAdmin}
        isOwner={isOwner}
      />

      <MessageList
        messages={messages}
        currentUserId={session?.user?.id || null}
        isAdmin={isAdmin}
        topicId={id}
        isClosed={topic.isClosed}
        isAuthenticated={!!session}
      />
    </div>
  );
}
