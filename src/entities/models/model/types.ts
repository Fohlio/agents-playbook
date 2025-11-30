import { ModelCategory } from '@prisma/client';

/**
 * Model entity type
 * Represents a predefined AI model
 */
export interface Model {
  id: string;
  name: string;
  slug: string;
  category: ModelCategory;
}

/**
 * Models grouped by category
 */
export interface ModelsByCategory {
  LLM: Model[];
  IMAGE: Model[];
}

/**
 * API response for models endpoint
 */
export interface ModelsApiResponse {
  models: Model[];
  byCategory: ModelsByCategory;
}

