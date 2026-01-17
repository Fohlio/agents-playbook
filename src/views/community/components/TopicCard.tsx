"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";
import PushPinIcon from '@mui/icons-material/PushPin';
import LockIcon from '@mui/icons-material/Lock';
import { Card } from "@/shared/ui/atoms";
import type { TopicWithDetails } from "../types";

interface TopicCardProps {
  topic: TopicWithDetails;
}

export function TopicCard({ topic }: TopicCardProps) {
  const t = useTranslations("community");

  return (
    <Link href={`/dashboard/community/${topic.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start gap-3">
          {/* Icons */}
          <div className="flex gap-1 mt-1">
            {topic.isPinned && (
              <PushPinIcon
                fontSize="small"
                className="text-primary-600"
                titleAccess={t("pinnedTopic")}
              />
            )}
            {topic.isClosed && (
              <LockIcon
                fontSize="small"
                className="text-gray-500"
                titleAccess={t("closedTopic")}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
              {topic.title}
            </h3>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>@{topic.author.username}</span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(topic.createdAt), {
                  addSuffix: true,
                })}
              </span>
              <span>•</span>
              <span>
                {topic._count.messages}{" "}
                {t("messages", { count: topic._count.messages })}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
