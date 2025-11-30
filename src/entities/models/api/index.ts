import { ModelsApiResponse } from '../model/types';

/**
 * Fetch all predefined AI models
 * 
 * @returns Promise with models data grouped by category
 */
export async function fetchModels(): Promise<ModelsApiResponse> {
  const response = await fetch('/api/models');
  
  if (!response.ok) {
    throw new Error('Failed to fetch models');
  }
  
  return response.json();
}

