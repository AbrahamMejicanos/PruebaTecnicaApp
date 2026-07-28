import type { UserRole } from '../types/auth';

export function canManageNews(role?: UserRole | null): boolean {
  return ['superuser', 'administrator', 'news_editor'].includes(role?.slug ?? '');
}

export function canManageUsers(role?: UserRole | null): boolean {
  return ['superuser', 'administrator'].includes(role?.slug ?? '');
}

export function canAssignRoles(role?: UserRole | null): boolean {
  return canManageUsers(role);
}

export function canManageCategories(role?: UserRole | null): boolean {
  return ['superuser', 'administrator'].includes(role?.slug ?? '');
}

export function canManageSuperusers(role?: UserRole | null): boolean {
  return role?.slug === 'superuser';
}
