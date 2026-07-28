import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/hooks/useAuth';
import { AppAlertProvider } from './src/hooks/useAppAlert';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

function AppContent() {
  const { navigationTheme, mode } = useTheme();

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <AppAlertProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </AppAlertProvider>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
