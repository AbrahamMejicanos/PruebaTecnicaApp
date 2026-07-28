import { apiClient } from './client';
import type { ApiEnvelope, PaginatedApiEnvelope, PaginationMeta } from '../types/api';
import type { NewsDetail, NewsListItem } from '../types/news';

export type NewsFilters = {
  search?: string;
  date_from?: string;
  date_to?: string;
  category_id?: number;
  page?: number;
  per_page?: number;
};

export type NewsPayload = {
  category_id: number;
  title: string;
  image?: {
    mimeType?: string | null;
    name: string;
    uri: string;
  };
  image_url?: string;
  excerpt: string;
  body: string;
  published_at: string;
};

export type PaginatedNews = {
  items: NewsListItem[];
  meta: PaginationMeta;
};

export async function fetchNews(): Promise<NewsListItem[]> {
  const response = await apiClient.get<ApiEnvelope<NewsListItem[]>>('/news');

  return response.data.data;
}

export async function fetchPaginatedNews(filters: NewsFilters): Promise<PaginatedNews> {
  const response = await apiClient.get<PaginatedApiEnvelope<NewsListItem[]>>('/news', {
    params: filters,
  });

  return {
    items: response.data.data,
    meta: response.data.meta,
  };
}

export async function fetchNewsDetail(id: number): Promise<NewsDetail> {
  const response = await apiClient.get<ApiEnvelope<NewsDetail>>(`/news/${id}`);

  return response.data.data;
}

export async function fetchRecommendedNews(id: number): Promise<NewsListItem[]> {
  const response = await apiClient.get<ApiEnvelope<NewsListItem[]>>(`/news/${id}/recommended`);

  return response.data.data;
}

export async function createNews(payload: NewsPayload): Promise<NewsDetail> {
  const response = await apiClient.post<ApiEnvelope<NewsDetail>>('/news', toNewsFormData(payload), {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}

export async function updateNews(id: number, payload: NewsPayload): Promise<NewsDetail> {
  const response = await apiClient.post<ApiEnvelope<NewsDetail>>(`/news/${id}`, toNewsFormData(payload), {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}

export async function deleteNews(id: number): Promise<void> {
  await apiClient.delete<ApiEnvelope<{ id: number }>>(`/news/${id}`);
}

function toNewsFormData(payload: NewsPayload): FormData {
  const formData = new FormData();

  formData.append('category_id', String(payload.category_id));
  formData.append('title', payload.title);
  formData.append('excerpt', payload.excerpt);
  formData.append('body', payload.body);
  formData.append('published_at', payload.published_at);

  if (payload.image) {
    formData.append('image', {
      name: payload.image.name,
      type: payload.image.mimeType ?? 'image/jpeg',
      uri: payload.image.uri,
    } as unknown as Blob);
  } else if (payload.image_url) {
    formData.append('image_url', payload.image_url);
  }

  return formData;
}
