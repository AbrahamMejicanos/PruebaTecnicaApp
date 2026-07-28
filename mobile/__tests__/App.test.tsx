import { render } from '@testing-library/react-native';

import App from '../App';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const insetValues = { bottom: 0, left: 0, right: 0, top: 0 };
  const frame = { height: 800, width: 400, x: 0, y: 0 };

  return {
    SafeAreaInsetsContext: React.createContext(insetValues),
    SafeAreaFrameContext: React.createContext(frame),
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => (
      <View style={style}>{children}</View>
    ),
    initialWindowMetrics: { frame, insets: insetValues },
    useSafeAreaFrame: () => frame,
    useSafeAreaInsets: () => insetValues,
  };
});

describe('App', () => {
  it('renders the login screen when there is no stored token', async () => {
    const { findByText } = await render(<App />);

    expect(await findByText('Prueba Abraham Mejicanos')).toBeTruthy();
    expect(await findByText('Iniciar sesion')).toBeTruthy();
  });
});
