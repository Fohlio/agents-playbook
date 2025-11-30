"use client";

import { useState } from "react";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { toggleMessageVote } from "../actions/vote-actions";

interface VoteButtonProps {
  messageId: string;
  initialVoteCount: number;
  initialHasVoted: boolean;
  isOwnMessage: boolean;
}

export function VoteButton({
  messageId,
  initialVoteCount,
  initialHasVoted,
  isOwnMessage,
}: VoteButtonProps) {
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isLoading, setIsLoading] = useState(false);

  // Hide button if it's user's own message
  if (isOwnMessage) {
    return null;
  }

  const handleVote = async () => {
    if (isLoading) return;

    // Optimistic update
    const previousVoteCount = voteCount;
    const previousHasVoted = hasVoted;

    setVoteCount(hasVoted ? voteCount - 1 : voteCount + 1);
    setHasVoted(!hasVoted);
    setIsLoading(true);

    try {
      const result = await toggleMessageVote(messageId);

      if (result.success && result.data) {
        // Update with server response
        setVoteCount(result.data.voteCount);
        setHasVoted(result.data.hasVoted);
      } else {
        // Revert on error
        setVoteCount(previousVoteCount);
        setHasVoted(previousHasVoted);
      }
    } catch {
      // Revert on error
      setVoteCount(previousVoteCount);
      setHasVoted(previousHasVoted);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={isLoading}
      className={`
        flex items-center gap-1 px-2 py-1 rounded transition-colors
        ${hasVoted
          ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={hasVoted ? 'Remove vote' : 'Upvote'}
    >
      <ArrowUpwardIcon fontSize="small" />
      <span className="text-sm font-medium">{voteCount}</span>
    </button>
  );
}
