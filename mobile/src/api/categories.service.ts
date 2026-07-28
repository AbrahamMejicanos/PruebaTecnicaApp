import { apiClient } from './client';
import type { ApiEnvelope } from '../types/api';
import type { Category } from '../types/category';

export async function fetchCategories(): Promise<Category[]> {
  const response = await apiClient.get<ApiEnvelope<Category[]>>('/categories');

  return response.data.data;
}
