import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchMe, login as loginRequest, logout as logoutRequest } from '../api/auth.service';
import { setUnauthorizedHandler } from '../api/client';
import { clearToken, getToken, saveToken } from '../storage/tokenStorage';
import type { AuthUser } from '../types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  sessionMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSessionMessage: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  const endSession = useCallback(async (message?: string) => {
    await clearToken();
    setUser(null);
    setSessionMessage(message ?? null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void endSession('Tu sesion ya no esta activa.');
    });

    return () => setUnauthorizedHandler(null);
  }, [endSession]);

  useEffect(() => {
    async function bootstrap() {
      try {
        const token = await getToken();

        if (token) {
          const currentUser = await fetchMe();
          setUser(currentUser);
        }
      } catch {
        await clearToken();
      } finally {
        setIsBootstrapping(false);
      }
    }

    void bootstrap();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    await saveToken(response.token);
    setUser(response.user);
    setSessionMessage(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      await endSession();
    }
  }, [endSession]);

  const value = useMemo(
    () => ({
      user,
      isBootstrapping,
      isAuthenticated: Boolean(user),
      sessionMessage,
      login,
      logout,
      clearSessionMessage: () => setSessionMessage(null),
    }),
    [isBootstrapping, login, logout, sessionMessage, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
