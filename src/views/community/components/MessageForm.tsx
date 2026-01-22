"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { UserMentionDropdown } from "./UserMentionDropdown";
import { createMessage } from "../actions/message-actions";
import { searchUsers } from "../actions/user-actions";
import type { UserSearchResult, MessageWithDetails } from "../types";

interface MessageFormProps {
  topicId: string;
  isClosed: boolean;
  onMessageCreated?: (message: MessageWithDetails) => void;
}

export function MessageForm({ topicId, isClosed, onMessageCreated }: MessageFormProps) {
  const t = useTranslations("community.messageForm");
  const tCommunity = useTranslations("community");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionUsers, setMentionUsers] = useState<UserSearchResult[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;

    setContent(value);
    setCursorPosition(cursorPos);

    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setShowMentionDropdown(true);

      if (textareaRef.current) {
        const textarea = textareaRef.current;
        const container = textarea.offsetParent as HTMLElement;

        if (container) {
          const textareaRect = textarea.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          setDropdownPosition({
            top: textareaRect.top - containerRect.top + 30,
            left: textareaRect.left - containerRect.left + 10,
          });
        } else {
          setDropdownPosition({
            top: textarea.offsetTop + 30,
            left: textarea.offsetLeft + 10,
          });
        }
      }

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (query.length > 0) {
        searchTimeoutRef.current = setTimeout(async () => {
          const result = await searchUsers(query);
          setMentionUsers(result.users);
        }, 300);
      } else {
        setMentionUsers([]);
      }
    } else {
      setShowMentionDropdown(false);
      setMentionUsers([]);
    }
  };

  const handleUserSelect = useCallback(
    (username: string) => {
      const textBeforeCursor = content.slice(0, cursorPosition);
      const textAfterCursor = content.slice(cursorPosition);
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

      if (mentionMatch) {
        const beforeMention = textBeforeCursor.slice(
          0,
          textBeforeCursor.length - mentionMatch[0].length
        );
        const newContent = `${beforeMention}@${username} ${textAfterCursor}`;
        setContent(newContent);

        setTimeout(() => {
          if (textareaRef.current) {
            const newCursorPos =
              beforeMention.length + username.length + 2;
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
        }, 0);
      }

      setShowMentionDropdown(false);
      setMentionUsers([]);
    },
    [content, cursorPosition]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSubmitting) {
      return;
    }

    const submittedContent = content.trim();

    setContent("");
    setIsSubmitting(true);

    try {
      const result = await createMessage({
        topicId,
        content: submittedContent,
      });

      if (result.success && result.data) {
        if (onMessageCreated) {
          onMessageCreated(result.data.message);
        }
        setIsSubmitting(false);
      } else {
        setContent(submittedContent);
        alert(result.error || t("failedToSend"));
        setIsSubmitting(false);
      }
    } catch {
      setContent(submittedContent);
      alert(t("failedToSend"));
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (isClosed) {
    return (
      <div className="text-center py-4 bg-pink-500/10 border border-pink-500/30 font-mono text-pink-400 text-sm uppercase">
        {tCommunity("topicClosed")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="mb-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          placeholder={t("placeholder")}
          className="w-full px-4 py-3 bg-[#050508]/50 border border-cyan-500/30 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all resize-none"
          rows={4}
          maxLength={10000}
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs font-mono ${content.length > 9500 ? 'text-pink-400' : 'text-cyan-500/40'}`}>
            {content.length}/10000
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
      >
        {isSubmitting ? t("sending") : t("send")}
      </button>

      {showMentionDropdown && mentionUsers.length > 0 && (
        <UserMentionDropdown
          users={mentionUsers}
          onSelect={handleUserSelect}
          onClose={() => setShowMentionDropdown(false)}
          position={dropdownPosition}
        />
      )}
    </form>
  );
}
