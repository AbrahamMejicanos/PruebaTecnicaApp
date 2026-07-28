export type ApiEnvelope<T> = {
  data: T;
  message: string;
};

export type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};
