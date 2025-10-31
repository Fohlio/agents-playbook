"use client";

import { useState } from "react";
import { Tooltip } from "@/shared/ui/molecules";

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

export function RatingInput({
  value,
  onChange,
  readonly = false,
  size = "md",
}: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <Tooltip content={readonly ? "Community rating" : "Click to rate this item (1-5 stars)"}>
      <div
        className={`flex gap-1 ${sizeClasses[size]}`}
        onMouseLeave={() => setHoverValue(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            className={`transition-colors ${
              readonly ? "cursor-default" : "cursor-pointer hover:text-yellow-400"
            } ${
              star <= displayValue ? "text-yellow-400" : "text-gray-300"
            }`}
            aria-label={`Rate ${star} out of 5`}
          >
            ★
          </button>
        ))}
      </div>
    </Tooltip>
  );
}
