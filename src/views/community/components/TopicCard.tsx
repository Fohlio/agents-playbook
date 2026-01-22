"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";
import PushPinIcon from '@mui/icons-material/PushPin';
import LockIcon from '@mui/icons-material/Lock';
import type { TopicWithDetails } from "../types";

interface TopicCardProps {
  topic: TopicWithDetails;
}

export function TopicCard({ topic }: TopicCardProps) {
  const t = useTranslations("community");

  return (
    <Link href={`/dashboard/community/${topic.id}`}>
      <div 
        className="p-4 bg-[#0a0a0f]/80 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all cursor-pointer"
        style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
      >
        <div className="flex items-start gap-3">
          {/* Icons */}
          <div className="flex gap-1 mt-1">
            {topic.isPinned && (
              <PushPinIcon
                fontSize="small"
                className="text-yellow-400"
                titleAccess={t("pinnedTopic")}
                style={{ filter: 'drop-shadow(0 0 5px #eab308)' }}
              />
            )}
            {topic.isClosed && (
              <LockIcon
                fontSize="small"
                className="text-pink-400"
                titleAccess={t("closedTopic")}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-mono text-cyan-100 mb-1 line-clamp-2 hover:text-cyan-400 transition-colors">
              {topic.title}
            </h3>

            <div className="flex items-center gap-2 text-xs font-mono text-cyan-100/50">
              <span className="text-purple-400">@{topic.author.username}</span>
              <span className="text-cyan-500/30">•</span>
              <span>
                {formatDistanceToNow(new Date(topic.createdAt), {
                  addSuffix: true,
                })}
              </span>
              <span className="text-cyan-500/30">•</span>
              <span className="text-green-400">
                {topic._count.messages}{" "}
                {t("messages", { count: topic._count.messages })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
