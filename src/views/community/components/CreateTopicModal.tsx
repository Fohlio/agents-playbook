"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Modal, ModalHeader, ModalBody, ModalActions } from "@/shared/ui/atoms";
import { createTopic } from "../actions/topic-actions";

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTopicModal({ isOpen, onClose }: CreateTopicModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await createTopic({ title: title.trim(), content: content.trim() });

      if (result.success && result.data) {
        onClose();
        setTitle("");
        setContent("");
        router.push(`/dashboard/community/${result.data.topicId}`);
      } else {
        setError(result.error || "Failed to create topic");
        setIsSubmitting(false);
      }
    } catch {
      setError("Failed to create topic");
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <ModalHeader title="Create New Topic" />

      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              maxLength={200}
              required
            />
            <div className="text-xs text-gray-500 mt-1">{title.length}/200</div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={6}
              maxLength={10000}
              required
            />
            <div className="text-xs text-gray-500 mt-1">{content.length}/10000</div>
          </div>

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
        </ModalBody>

        <ModalActions>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!title.trim() || !content.trim() || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Topic"}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  );
}
