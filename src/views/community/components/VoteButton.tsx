"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("community.voteButton");
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isLoading, setIsLoading] = useState(false);

  // Hide button if it's user's own message
  if (isOwnMessage) {
    return null;
  }

  const handleVote = async () => {
    if (isLoading) return;

    const previousVoteCount = voteCount;
    const previousHasVoted = hasVoted;

    setVoteCount(hasVoted ? voteCount - 1 : voteCount + 1);
    setHasVoted(!hasVoted);
    setIsLoading(true);

    try {
      const result = await toggleMessageVote(messageId);

      if (result.success && result.data) {
        setVoteCount(result.data.voteCount);
        setHasVoted(result.data.hasVoted);
      } else {
        setVoteCount(previousVoteCount);
        setHasVoted(previousHasVoted);
      }
    } catch {
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
        flex items-center gap-1 px-2 py-1 font-mono text-xs transition-all cursor-pointer
        ${hasVoted
          ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-[0_0_10px_rgba(0,255,0,0.2)]'
          : 'bg-transparent text-cyan-100/50 border border-cyan-500/30 hover:border-cyan-400/50 hover:text-cyan-400'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      aria-label={hasVoted ? t("removeVote") : t("upvote")}
    >
      <ArrowUpwardIcon fontSize="small" />
      <span className="font-bold">{voteCount}</span>
    </button>
  );
}
