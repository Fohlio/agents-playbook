"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/shared/ui/atoms";
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
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionUsers, setMentionUsers] = useState<UserSearchResult[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Handle textarea input
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;

    setContent(value);
    setCursorPosition(cursorPos);

    // Check for @ mention trigger
    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setShowMentionDropdown(true);

      // Calculate dropdown position relative to form container
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        const container = textarea.offsetParent as HTMLElement;

        if (container) {
          const textareaRect = textarea.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          setDropdownPosition({
            top: textareaRect.top - containerRect.top + 30, // Below the textarea
            left: textareaRect.left - containerRect.left + 10,
          });
        } else {
          // Fallback to offsetTop/offsetLeft if no offsetParent
          setDropdownPosition({
            top: textarea.offsetTop + 30,
            left: textarea.offsetLeft + 10,
          });
        }
      }

      // Debounced user search
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

  // Handle user selection from dropdown
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

        // Focus and set cursor position
        setTimeout(() => {
          if (textareaRef.current) {
            const newCursorPos =
              beforeMention.length + username.length + 2; // +2 for @ and space
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSubmitting) {
      return;
    }

    const submittedContent = content.trim();

    // Optimistic update - clear form immediately
    setContent("");
    setIsSubmitting(true);

    try {
      const result = await createMessage({
        topicId,
        content: submittedContent,
      });

      if (result.success && result.data) {
        // Success - add message to list without reload
        if (onMessageCreated) {
          onMessageCreated(result.data.message);
        }
        setIsSubmitting(false);
      } else {
        // Restore content on error
        setContent(submittedContent);
        alert(result.error || "Failed to create message");
        setIsSubmitting(false);
      }
    } catch {
      // Restore content on error
      setContent(submittedContent);
      alert("Failed to create message");
      setIsSubmitting(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (isClosed) {
    return (
      <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
        Topic is closed. No new messages can be added.
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
          placeholder="Type your message... (Use @ to mention users)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={4}
          maxLength={10000}
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            {content.length}/10000
          </span>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={!content.trim() || isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>

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
