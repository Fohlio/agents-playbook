"use client";

import { useState } from "react";
import { Modal, Button } from "@/shared/ui/atoms";
import { RatingInput } from "./RatingInput";

interface RatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "WORKFLOW" | "MINI_PROMPT";
  targetId: string;
  targetName: string;
  currentRating?: number;
  onSubmit: (rating: number) => Promise<void>;
}

export function RatingDialog({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  currentRating,
  onSubmit,
}: RatingDialogProps) {
  const [rating, setRating] = useState(currentRating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1) return;

    setIsSubmitting(true);
    try {
      await onSubmit(rating);
      onClose();
    } catch (error) {
      console.error("Failed to submit rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Rate {targetName}
        </h3>

        <p className="text-gray-600">
          How would you rate this {targetType === "WORKFLOW" ? "workflow" : "mini-prompt"}?
        </p>

        <div className="flex justify-center py-4">
          <RatingInput value={rating} onChange={setRating} size="lg" />
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={rating < 1 || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : currentRating ? "Update Rating" : "Submit Rating"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
