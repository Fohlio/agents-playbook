"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";
import PushPinIcon from '@mui/icons-material/PushPin';
import LockIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';
import { togglePinTopic, toggleCloseTopic, deleteTopic } from "../actions/topic-actions";
import type { Topic, User } from "@prisma/client";

interface TopicHeaderProps {
  topic: Topic & { author: Pick<User, "username"> };
  isAdmin: boolean;
  isOwner: boolean;
}

export function TopicHeader({ topic, isAdmin, isOwner }: TopicHeaderProps) {
  const t = useTranslations("community.topicHeader");
  const [isPinned, setIsPinned] = useState(topic.isPinned);
  const [isClosed, setIsClosed] = useState(topic.isClosed);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePin = async () => {
    setIsLoading(true);
    const result = await togglePinTopic(topic.id);
    if (result.success && result.data) {
      setIsPinned(result.data.isPinned);
    }
    setIsLoading(false);
  };

  const handleClose = async () => {
    setIsLoading(true);
    const result = await toggleCloseTopic(topic.id);
    if (result.success && result.data) {
      setIsClosed(result.data.isClosed);
      window.location.reload();
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(t("confirmDelete"))) {
      return;
    }

    router.push("/dashboard/community");

    const result = await deleteTopic(topic.id);
    if (!result.success) {
      alert(result.error || t("failedToDelete"));
    }
  };

  return (
    <div 
      className="bg-[#0a0a0f]/80 backdrop-blur-sm border border-cyan-500/30 p-6 mb-6"
      style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl font-bold font-mono text-cyan-400" style={{ textShadow: '0 0 10px #00ffff40' }}>
              {topic.title}
            </h1>
            {isPinned && (
              <PushPinIcon 
                className="text-yellow-400" 
                fontSize="medium" 
                style={{ filter: 'drop-shadow(0 0 5px #eab308)' }}
              />
            )}
            {isClosed && (
              <LockIcon 
                className="text-pink-400" 
                fontSize="medium" 
              />
            )}
          </div>

          <div className="text-sm text-cyan-100/50 font-mono">
            by <span className="text-purple-400">@{topic.author.username}</span> •{" "}
            {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}
          </div>
        </div>

        {/* Admin actions */}
        {(isAdmin || isOwner) && (
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={handlePin}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-transparent border border-yellow-500/30 text-yellow-400 font-mono text-xs uppercase tracking-wider hover:bg-yellow-500/10 hover:border-yellow-400 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isPinned ? t("unpin") : t("pin")}
                </button>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-xs uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isClosed ? t("reopen") : t("close")}
                </button>
              </>
            )}
            {(isOwner || isAdmin) && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="p-2 bg-transparent border border-pink-500/30 text-pink-400 hover:bg-pink-500/10 hover:border-pink-400 disabled:opacity-50 transition-all cursor-pointer"
              >
                <DeleteIcon fontSize="small" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
