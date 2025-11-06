"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import DeleteIcon from '@mui/icons-material/Delete';
import { Card } from "@/shared/ui/atoms";
import { Button } from "@/shared/ui/atoms";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const isOwner = currentUserId === message.authorId;
  const canDelete = isOwner || isAdmin;
  const hasVoted = message.votes && message.votes.length > 0;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }

    // Optimistic update - hide immediately
    setIsDeleting(true);
    setIsHidden(true);
    onDelete?.();

    try {
      const result = await deleteMessage(message.id);

      if (result.success) {
        if (result.data?.deletedTopic) {
          // Topic was deleted, redirect to community page
          window.location.href = "/dashboard/community";
        }
        // Message successfully deleted, keep hidden
      } else {
        // Revert on error
        setIsHidden(false);
        setIsDeleting(false);
        alert(result.error || "Failed to delete message");
      }
    } catch {
      // Revert on error
      setIsHidden(false);
      setIsDeleting(false);
      alert("Failed to delete message");
    }
  };

  // Hide if being deleted
  if (isHidden) {
    return null;
  }

  // Highlight mentions in content
  const highlightMentions = (content: string) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.match(/^@\w+$/)) {
        return (
          <span key={index} className="text-primary-600 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Author and date */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-900">
              @{message.author.username}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* Content with line breaks and mentions */}
          <div className="text-gray-700 whitespace-pre-wrap break-words">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <DeleteIcon fontSize="small" />
          </Button>
        )}
      </div>
    </Card>
  );
}
