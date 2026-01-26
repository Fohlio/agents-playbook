import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import { withRetry } from '@/server/db/retry';
import { Prisma } from '@prisma/client';
import { getRatingStatsForMultiple } from '@/features/ratings/lib/rating-service';

/**
 * Public Skills API
 *
 * GET /api/v1/public/skills
 * Fetches public skills with pagination, sorting, and filtering.
 *
 * Query parameters:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - sort: 'most_used' | 'highest_rated' | 'recent' | 'popular'
 * - search: string (search in name, description)
 * - rating: '3+' | '4+' (minimum rating filter)
 * - minUsage: number (minimum usage count)
 * - tagIds: comma-separated tag IDs
 * - modelIds: comma-separated model IDs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    // Parse sort
    const sort = searchParams.get('sort') || 'recent';

    // Parse search
    const search = searchParams.get('search') || '';

    // Parse filters
    const rating = searchParams.get('rating') || null;
    const minUsage = searchParams.get('minUsage')
      ? parseInt(searchParams.get('minUsage') as string, 10)
      : null;
    const tagIds = searchParams.get('tagIds')
      ? searchParams.get('tagIds')!.split(',').filter(Boolean)
      : [];
    const modelIds = searchParams.get('modelIds')
      ? searchParams.get('modelIds')!.split(',').filter(Boolean)
      : [];

    // Build where clause
    const where: Prisma.SkillWhereInput = {
      visibility: 'PUBLIC',
      isActive: true,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { user: { username: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
      ...(tagIds.length > 0 && {
        tags: {
          some: {
            tagId: { in: tagIds },
          },
        },
      }),
      ...(modelIds.length > 0 && {
        models: {
          some: {
            modelId: { in: modelIds },
          },
        },
      }),
    };

    // Build orderBy
    const orderBy = getOrderBy(sort);

    // Execute query
    const [skills, total] = await Promise.all([
      withRetry(() =>
        prisma.skill.findMany({
          where,
          include: {
            user: {
              select: { id: true, username: true },
            },
            tags: {
              include: {
                tag: true,
              },
            },
            models: {
              include: {
                model: true,
              },
            },
            _count: {
              select: {
                attachments: true,
                references: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        })
      ),
      withRetry(() => prisma.skill.count({ where })),
    ]);

    // Fetch rating and usage stats
    const skillIds = skills.map((s) => s.id);
    const [ratingStatsMap, usageStatsMap] = await Promise.all([
      getRatingStatsForMultiple('SKILL', skillIds),
      getUsageStatsForMultiple(skillIds),
    ]);

    // Enrich skills with metadata
    let items = skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      key: skill.key,
      user: {
        id: skill.user.id,
        username: skill.user.username,
      },
      tags: skill.tags.map((t) => ({
        id: t.tag.id,
        name: t.tag.name,
        color: t.tag.color,
      })),
      models: skill.models.map((m) => ({
        id: m.model.id,
        name: m.model.name,
        slug: m.model.slug,
        category: m.model.category,
      })),
      attachmentCount: skill._count.attachments,
      referencesCount: skill._count.references,
      rating: {
        average: ratingStatsMap[skill.id]?.averageRating || null,
        count: ratingStatsMap[skill.id]?.totalRatings || 0,
      },
      usageCount: usageStatsMap[skill.id]?.usageCount || skill._count.references,
      createdAt: skill.createdAt.toISOString(),
      updatedAt: skill.updatedAt.toISOString(),
    }));

    // Apply post-fetch filters (rating, usage)
    if (rating) {
      const minRating = rating === '4+' ? 4 : 3;
      items = items.filter(
        (skill) => skill.rating.average !== null && skill.rating.average >= minRating
      );
    }

    if (minUsage !== null) {
      items = items.filter((skill) => skill.usageCount >= minUsage);
    }

    // Calculate pagination
    const filteredTotal = items.length;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages,
      },
    });
  } catch (error) {
    console.error('[PublicSkillsAPI] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public skills' },
      { status: 500 }
    );
  }
}

function getOrderBy(sort: string): Prisma.SkillOrderByWithRelationInput {
  switch (sort) {
    case 'most_used':
    case 'popular':
      // Sort by reference count (most imported)
      return { references: { _count: 'desc' } };
    case 'highest_rated':
      // We'll sort by createdAt here; actual rating sort would need a subquery
      return { createdAt: 'desc' };
    case 'recent':
    default:
      return { createdAt: 'desc' };
  }
}

async function getUsageStatsForMultiple(
  targetIds: string[]
): Promise<Record<string, { usageCount: number }>> {
  if (targetIds.length === 0) {
    return {};
  }

  const usageStats = await prisma.usageStats.findMany({
    where: {
      targetType: 'SKILL',
      targetId: { in: targetIds },
    },
    select: {
      targetId: true,
      usageCount: true,
    },
  });

  const statsMap: Record<string, { usageCount: number }> = {};
  for (const stat of usageStats) {
    statsMap[stat.targetId] = {
      usageCount: stat.usageCount,
    };
  }

  return statsMap;
}
