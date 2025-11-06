"use client";

import { useState } from "react";
import { MessageCard } from "./MessageCard";
import { MessageForm } from "./MessageForm";
import type { MessageWithDetails } from "../types";

interface MessageListProps {
  messages: MessageWithDetails[];
  currentUserId: string | null;
  isAdmin: boolean;
  topicId: string;
  isClosed: boolean;
  isAuthenticated: boolean;
}

export function MessageList({
  messages: initialMessages,
  currentUserId,
  isAdmin,
  topicId,
  isClosed,
  isAuthenticated,
}: MessageListProps) {
  const [messages, setMessages] = useState(initialMessages);

  const handleAddMessage = (newMessage: MessageWithDetails) => {
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  return (
    <div className="space-y-6">
      {messages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No messages yet
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onDelete={() => handleDeleteMessage(message.id)}
            />
          ))}
        </div>
      )}

      {isAuthenticated && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold mb-4">Add a Message</h3>
          <MessageForm
            topicId={topicId}
            isClosed={isClosed}
            onMessageCreated={handleAddMessage}
          />
        </div>
      )}
    </div>
  );
}
