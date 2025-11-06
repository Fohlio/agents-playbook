"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import PushPinIcon from '@mui/icons-material/PushPin';
import LockIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from "@/shared/ui/atoms";
import { togglePinTopic, toggleCloseTopic, deleteTopic } from "../actions/topic-actions";
import type { Topic, User } from "@prisma/client";

interface TopicHeaderProps {
  topic: Topic & { author: Pick<User, "username"> };
  isAdmin: boolean;
  isOwner: boolean;
}

export function TopicHeader({ topic, isAdmin, isOwner }: TopicHeaderProps) {
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
    if (!confirm("Are you sure you want to delete this topic and all its messages?")) {
      return;
    }

    // Optimistic update - redirect immediately
    router.push("/dashboard/community");

    // Delete in background
    const result = await deleteTopic(topic.id);
    if (!result.success) {
      // If deletion failed, show error (user already on community page)
      alert(result.error || "Failed to delete topic");
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              {topic.title}
            </h1>
            {isPinned && <PushPinIcon className="text-primary-600" fontSize="medium" />}
            {isClosed && <LockIcon className="text-gray-500" fontSize="medium" />}
          </div>

          <div className="text-sm text-gray-700 font-medium">
            by @{topic.author.username} •{" "}
            {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}
          </div>
        </div>

        {/* Admin actions */}
        {(isAdmin || isOwner) && (
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePin}
                  disabled={isLoading}
                >
                  {isPinned ? "Unpin" : "Pin"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  {isClosed ? "Reopen" : "Close"}
                </Button>
              </>
            )}
            {(isOwner || isAdmin) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <DeleteIcon fontSize="small" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
