import { canAssignRoles, canManageNews, canManageUsers } from '../src/utils/permissions';
import type { UserRole } from '../src/types/auth';

const role = (slug: string): UserRole => ({ id: 1, name: slug, slug });

describe('role permissions', () => {
  it('allows news management only to editor roles and above', () => {
    expect(canManageNews(role('superuser'))).toBe(true);
    expect(canManageNews(role('administrator'))).toBe(true);
    expect(canManageNews(role('news_editor'))).toBe(true);
    expect(canManageNews(role('user'))).toBe(false);
  });

  it('allows user management and role assignment only to admin roles', () => {
    expect(canManageUsers(role('superuser'))).toBe(true);
    expect(canManageUsers(role('administrator'))).toBe(true);
    expect(canManageUsers(role('news_editor'))).toBe(false);
    expect(canAssignRoles(role('user'))).toBe(false);
  });
});
