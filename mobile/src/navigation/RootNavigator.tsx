import { LoadingState } from '../components/LoadingState';
import { useAuth } from '../hooks/useAuth';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';

export function RootNavigator() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <LoadingState label="Preparando sesion..." />;
  }

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
}
