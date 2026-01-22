"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";
import DeleteIcon from '@mui/icons-material/Delete';
import { VoteButton } from "./VoteButton";
import { deleteMessage } from "../actions/message-actions";
import type { MessageWithDetails } from "../types";

interface MessageCardProps {
  message: MessageWithDetails;
  currentUserId: string | null;
  isAdmin: boolean;
  onDelete?: () => void;
}

export function MessageCard({
  message,
  currentUserId,
  isAdmin,
  onDelete,
}: MessageCardProps) {
  const t = useTranslations("community.messageCard");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const isOwner = currentUserId === message.authorId;
  const canDelete = isOwner || isAdmin;
  const hasVoted = message.votes && message.votes.length > 0;

  const handleDelete = async () => {
    if (!confirm(t("confirmDelete"))) {
      return;
    }

    setIsDeleting(true);
    setIsHidden(true);

    try {
      const result = await deleteMessage(message.id);

      if (result.success) {
        onDelete?.();

        if (result.data?.deletedTopic) {
          window.location.href = "/dashboard/community";
        }
      } else {
        setIsHidden(false);
        setIsDeleting(false);
        alert(result.error || t("failedToDelete"));
      }
    } catch (error) {
      setIsHidden(false);
      setIsDeleting(false);
      console.error("Delete message error:", error);
      alert(t("failedToDelete"));
    }
  };

  if (isHidden) {
    return null;
  }

  // Highlight mentions in content
  const highlightMentions = (content: string) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.match(/^@\w+$/)) {
        return (
          <span key={index} className="text-purple-400 font-medium" style={{ textShadow: '0 0 5px #a855f740' }}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div 
      className="p-4 bg-[#0a0a0f]/80 backdrop-blur-sm border border-cyan-500/30"
      style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Author and date */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-mono text-purple-400">
              @{message.author.username}
            </span>
            <span className="text-xs text-cyan-100/30 font-mono">
              {formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* Content with line breaks and mentions */}
          <div className="text-cyan-100/70 font-mono text-sm whitespace-pre-wrap break-words">
            {highlightMentions(message.content)}
          </div>

          {/* Vote button */}
          <div className="mt-3">
            <VoteButton
              messageId={message.id}
              initialVoteCount={message._count.votes}
              initialHasVoted={hasVoted}
              isOwnMessage={isOwner}
            />
          </div>
        </div>

        {/* Delete button */}
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 bg-transparent border border-pink-500/30 text-pink-400 hover:bg-pink-500/10 hover:border-pink-400 disabled:opacity-50 transition-all cursor-pointer"
          >
            <DeleteIcon fontSize="small" />
          </button>
        )}
      </div>
    </div>
  );
}
