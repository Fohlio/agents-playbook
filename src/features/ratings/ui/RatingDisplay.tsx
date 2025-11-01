"use client";

interface RatingDisplayProps {
  averageRating: number;
  totalRatings: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function RatingDisplay({
  averageRating,
  totalRatings,
  size = "sm",
  showCount = true,
}: RatingDisplayProps) {
  if (totalRatings === 0) {
    return null;
  }

  const fullStars = Math.floor(averageRating);
  const hasHalfStar = averageRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-1 ${sizeClasses[size]}`}>
      <span className="flex text-yellow-400">
        {"★".repeat(fullStars)}
        {hasHalfStar && "☆"}
        <span className="text-gray-300">{"★".repeat(emptyStars)}</span>
      </span>
      <span className="text-gray-600 font-medium">
        {averageRating.toFixed(1)}
      </span>
    </div>
  );
}
