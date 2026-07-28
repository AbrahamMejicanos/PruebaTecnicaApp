import { apiClient } from './client';
import type { ApiEnvelope } from '../types/api';
import type { AuthUser, LoginResponse } from '../types/auth';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiClient.post<ApiEnvelope<LoginResponse>>('/login', {
    email,
    password,
  });

  return response.data.data;
}

export async function fetchMe(): Promise<AuthUser> {
  const response = await apiClient.get<ApiEnvelope<AuthUser>>('/me');

  return response.data.data;
}

export async function logout(): Promise<AuthUser> {
  const response = await apiClient.post<ApiEnvelope<{ user: AuthUser }>>('/logout');

  return response.data.data.user;
}
