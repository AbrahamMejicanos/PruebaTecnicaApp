import { apiClient } from './client';
import type { ApiEnvelope } from '../types/api';
import type { Category } from '../types/category';
import type { NewsListItem } from '../types/news';

type CategoryNewsResponse = {
  category: Category;
  news: NewsListItem[];
};

export async function fetchCategories(): Promise<Category[]> {
  const response = await apiClient.get<ApiEnvelope<Category[]>>('/categories');

  return response.data.data;
}

export async function createCategory(payload: { name: string; description?: string | null }): Promise<Category> {
  const response = await apiClient.post<ApiEnvelope<Category>>('/categories', payload);

  return response.data.data;
}

export async function fetchCategoryNews(categoryId: number): Promise<CategoryNewsResponse> {
  const response = await apiClient.get<ApiEnvelope<CategoryNewsResponse>>(`/categories/${categoryId}/news`);

  return response.data.data;
}
