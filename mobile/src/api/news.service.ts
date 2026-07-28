import { apiClient } from './client';
import type { ApiEnvelope } from '../types/api';
import type { NewsDetail, NewsListItem } from '../types/news';

export async function fetchNews(): Promise<NewsListItem[]> {
  const response = await apiClient.get<ApiEnvelope<NewsListItem[]>>('/news');

  return response.data.data;
}

export async function fetchNewsDetail(id: number): Promise<NewsDetail> {
  const response = await apiClient.get<ApiEnvelope<NewsDetail>>(`/news/${id}`);

  return response.data.data;
}

export async function fetchRecommendedNews(id: number): Promise<NewsListItem[]> {
  const response = await apiClient.get<ApiEnvelope<NewsListItem[]>>(`/news/${id}/recommended`);

  return response.data.data;
}
