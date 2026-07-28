import { apiClient } from './client';
import type { ApiEnvelope } from '../types/api';
import type { AuthUser, UserRole } from '../types/auth';

export type UserPayload = {
  name: string;
  email: string;
  password: string;
  role_id: number;
};

export async function fetchUsers(): Promise<AuthUser[]> {
  const response = await apiClient.get<ApiEnvelope<AuthUser[]>>('/users');

  return response.data.data;
}

export async function createUser(payload: UserPayload): Promise<AuthUser> {
  const response = await apiClient.post<ApiEnvelope<AuthUser>>('/users', payload);

  return response.data.data;
}

export async function updateUserRole(userId: number, roleId: number): Promise<AuthUser> {
  const response = await apiClient.put<ApiEnvelope<AuthUser>>(`/users/${userId}/role`, {
    role_id: roleId,
  });

  return response.data.data;
}

export async function fetchRoles(): Promise<UserRole[]> {
  const response = await apiClient.get<ApiEnvelope<UserRole[]>>('/roles');

  return response.data.data;
}
