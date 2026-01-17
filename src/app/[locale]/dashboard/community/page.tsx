import { auth } from "@/server/auth/auth";
import { getTranslations } from "next-intl/server";
import { getTopics } from "@/views/community/actions/topic-actions";
import { CreateTopicButton } from "@/views/community/components/CreateTopicButton";
import { TopicList } from "@/views/community/components/TopicList";

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const { topics, totalPages } = await getTopics(page);
  const t = await getTranslations("community");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-600 mt-1">
            {t("subtitle")}
          </p>
        </div>
        {session && <CreateTopicButton />}
      </div>

      <TopicList
        topics={topics}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
