export type ApiEnvelope<T> = {
  data: T;
  message: string;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type PaginatedApiEnvelope<T> = ApiEnvelope<T> & {
  meta: PaginationMeta;
};

export type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};
