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
          <h1 className="text-3xl font-black tracking-tight mb-1">
            <span className="cyber-text-glitch" data-text={t("title")} style={{ color: '#00ffff', textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff40' }}>
              {t("title")}
            </span>
          </h1>
          <p className="text-cyan-100/60 font-mono text-sm uppercase tracking-wider">
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
