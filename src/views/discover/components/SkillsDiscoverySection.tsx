'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SkillDiscoveryCard, SkillCardData } from '@/shared/ui/molecules/SkillDiscoveryCard';
import { ROUTES } from '@/shared/routes';

interface SkillsDiscoverySectionProps {
  searchQuery?: string;
  onImportSkill?: (skillId: string) => Promise<void>;
}

interface PublicSkill extends SkillCardData {
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

type SortOption = 'most_used' | 'highest_rated' | 'recent' | 'popular';

/**
 * SkillsDiscoverySection Component
 *
 * Displays a grid of public skills for discovery with sorting and filtering.
 */
export function SkillsDiscoverySection({
  searchQuery = '',
  onImportSkill,
}: SkillsDiscoverySectionProps) {
  const t = useTranslations('discover');
  const router = useRouter();

  const [skills, setSkills] = useState<PublicSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [importingId, setImportingId] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sort: sortOption,
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/v1/public/skills?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }

      const data = await response.json();
      setSkills(data.items || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError('Failed to load skills');
    } finally {
      setIsLoading(false);
    }
  }, [page, sortOption, searchQuery]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortOption]);

  const handleImport = useCallback(
    async (skillId: string) => {
      if (!onImportSkill) return;

      setImportingId(skillId);
      try {
        await onImportSkill(skillId);
        // Refresh to update library status
        await fetchSkills();
      } finally {
        setImportingId(null);
      }
    },
    [onImportSkill, fetchSkills]
  );

  const handleViewSkill = useCallback(
    (skillId: string) => {
      router.push(ROUTES.SKILLS.EDIT(skillId));
    },
    [router]
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 font-mono mb-4">{error}</p>
        <button
          onClick={fetchSkills}
          className="px-4 py-2 border border-cyan-500/50 text-cyan-400 font-mono text-sm hover:bg-cyan-500/10 transition-all"
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with sort */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-mono text-cyan-400 uppercase tracking-wider">
          {'//'} SKILLS_DATABASE
        </h2>

        <div className="flex items-center gap-4">
          {/* Sort dropdown */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="px-3 py-2 bg-[#0a0a0f]/80 border border-cyan-500/30 text-cyan-100 font-mono text-sm focus:outline-none focus:border-cyan-400"
            style={{
              clipPath:
                'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            }}
          >
            <option value="recent">{t('sortRecent')}</option>
            <option value="most_used">{t('sortMostUsed')}</option>
            <option value="highest_rated">{t('sortHighestRated')}</option>
            <option value="popular">{t('sortPopular')}</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      )}

      {/* Skills grid */}
      {!isLoading && skills.length === 0 && (
        <div className="text-center py-12">
          <p className="text-cyan-500/60 font-mono">
            {searchQuery ? t('noSkillsMatchingSearch') : t('noPublicSkills')}
          </p>
        </div>
      )}

      {!isLoading && skills.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {skills.map((skill) => (
            <SkillDiscoveryCard
              key={skill.id}
              skill={skill}
              state={{
                isActive: true,
                isPublic: true,
                isImporting: importingId === skill.id,
              }}
              visibility={{
                showActive: false,
                showPublic: false,
                showEdit: false,
                showDuplicate: false,
                showRemove: false,
                showImport: !!onImportSkill,
                showShare: false,
                showRate: false,
                isOwned: false,
              }}
              handlers={{
                onCardClick: () => handleViewSkill(skill.id),
                onImport: () => handleImport(skill.id),
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-cyan-500/30 text-cyan-400 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-500/10 transition-all"
          >
            PREV
          </button>
          <span className="text-cyan-500/60 font-mono text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-cyan-500/30 text-cyan-400 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-500/10 transition-all"
          >
            NEXT
          </button>
        </div>
      )}
    </div>
  );
}
