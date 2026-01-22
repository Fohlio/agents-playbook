"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("pagination");
  if (totalPages <= 1) {
    return null;
  }

  const pages: number[] = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

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
          <button className="px-3 py-1.5 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-xs uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer">
            {`← ${t("previous")}`}
          </button>
        </Link>
      ) : (
        <button className="px-3 py-1.5 bg-transparent border border-cyan-500/20 text-cyan-500/30 font-mono text-xs uppercase tracking-wider cursor-not-allowed" disabled>
          {`← ${t("previous")}`}
        </button>
      )}

      {/* Page numbers */}
      {pages.map((page) =>
        page === currentPage ? (
          <button
            key={page}
            className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 font-mono text-xs shadow-[0_0_10px_rgba(0,255,255,0.3)]"
            disabled
          >
            {String(page).padStart(2, '0')}
          </button>
        ) : (
          <Link key={page} href={`${basePath}?page=${page}`}>
            <button className="px-3 py-1.5 bg-transparent border border-cyan-500/30 text-cyan-100/60 font-mono text-xs hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-400 transition-all cursor-pointer">
              {String(page).padStart(2, '0')}
            </button>
          </Link>
        )
      )}

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link href={`${basePath}?page=${currentPage + 1}`}>
          <button className="px-3 py-1.5 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-xs uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer">
            {`${t("next")} →`}
          </button>
        </Link>
      ) : (
        <button className="px-3 py-1.5 bg-transparent border border-cyan-500/20 text-cyan-500/30 font-mono text-xs uppercase tracking-wider cursor-not-allowed" disabled>
          {`${t("next")} →`}
        </button>
      )}
    </div>
  );
}
