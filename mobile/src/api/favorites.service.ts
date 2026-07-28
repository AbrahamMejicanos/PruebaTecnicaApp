import { apiClient } from './client';
import type { ApiEnvelope } from '../types/api';
import type { NewsListItem } from '../types/news';

type FavoriteResponse = {
  news_id: number;
  is_favorite: boolean;
};

export async function fetchFavorites(): Promise<NewsListItem[]> {
  const response = await apiClient.get<ApiEnvelope<NewsListItem[]>>('/favorites');

  return response.data.data;
}

export async function addFavorite(newsId: number): Promise<FavoriteResponse> {
  const response = await apiClient.post<ApiEnvelope<FavoriteResponse>>(`/news/${newsId}/favorite`);

  return response.data.data;
}

export async function removeFavorite(newsId: number): Promise<FavoriteResponse> {
  const response = await apiClient.delete<ApiEnvelope<FavoriteResponse>>(`/news/${newsId}/favorite`);

  return response.data.data;
}
