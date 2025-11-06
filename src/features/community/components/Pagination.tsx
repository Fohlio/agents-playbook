"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/atoms";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages: number[] = [];
  const maxVisiblePages = 5;

  // Calculate visible page range
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  // Adjust if we're near the beginning or end
  if (currentPage <= 3) {
    endPage = Math.min(maxVisiblePages, totalPages);
  }
  if (currentPage >= totalPages - 2) {
    startPage = Math.max(1, totalPages - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Previous button */}
      {currentPage > 1 ? (
        <Link href={`${basePath}?page=${currentPage - 1}`}>
          <Button variant="secondary" size="sm">
            Previous
          </Button>
        </Link>
      ) : (
        <Button variant="secondary" size="sm" disabled>
          Previous
        </Button>
      )}

      {/* Page numbers */}
      {pages.map((page) =>
        page === currentPage ? (
          <Button key={page} variant="primary" size="sm" disabled>
            {page}
          </Button>
        ) : (
          <Link key={page} href={`${basePath}?page=${page}`}>
            <Button variant="secondary" size="sm">
              {page}
            </Button>
          </Link>
        )
      )}

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link href={`${basePath}?page=${currentPage + 1}`}>
          <Button variant="secondary" size="sm">
            Next
          </Button>
        </Link>
      ) : (
        <Button variant="secondary" size="sm" disabled>
          Next
        </Button>
      )}
    </div>
  );
}
