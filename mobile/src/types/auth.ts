export type UserRole = {
  id: number;
  name: string;
  slug: string;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export type LoginResponse = {
  token: string;
  token_type: 'bearer';
  expires_in: number;
  user: AuthUser;
};
