"use client";

import { Button } from "@/shared/ui/atoms";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div
      className="mt-8 flex justify-center items-center gap-4"
      data-testid="pagination"
    >
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        testId="pagination-previous"
      >
        Previous
      </Button>

      <span className="text-sm text-gray-700" data-testid="pagination-info">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        testId="pagination-next"
      >
        Next
      </Button>
    </div>
  );
}
