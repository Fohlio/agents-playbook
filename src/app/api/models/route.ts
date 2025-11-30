import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import { ModelCategory } from '@prisma/client';

export interface ModelResponse {
  id: string;
  name: string;
  slug: string;
  category: ModelCategory;
}

export interface ModelsApiResponse {
  models: ModelResponse[];
  byCategory: {
    LLM: ModelResponse[];
    IMAGE: ModelResponse[];
  };
}

/**
 * GET /api/models
 * 
 * Fetch all predefined AI models.
 * No authentication required (public data).
 */
export async function GET(): Promise<NextResponse<ModelsApiResponse>> {
  const models = await prisma.model.findMany({
    orderBy: [
      { category: 'asc' },
      { name: 'asc' },
    ],
  });

  const byCategory = {
    LLM: models.filter((m) => m.category === ModelCategory.LLM),
    IMAGE: models.filter((m) => m.category === ModelCategory.IMAGE),
  };

  return NextResponse.json({
    models,
    byCategory,
  });
}

