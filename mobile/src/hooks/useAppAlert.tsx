import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

type AlertType = 'error' | 'success' | 'info';

type AlertState = {
  title: string;
  message: string;
  type: AlertType;
} | null;

type AlertContextValue = {
  showAlert: (title: string, message: string, type?: AlertType) => void;
  showError: (message: string, title?: string) => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

export function AppAlertProvider({ children }: PropsWithChildren) {
  const { colors } = useTheme();
  const [alert, setAlert] = useState<AlertState>(null);

  const showAlert = useCallback((title: string, message: string, type: AlertType = 'info') => {
    setAlert({ title, message, type });
  }, []);

  const value = useMemo(
    () => ({
      showAlert,
      showError: (message: string, title = 'Algo no salio bien') => showAlert(title, message, 'error'),
    }),
    [showAlert],
  );

  return (
    <AlertContext.Provider value={value}>
      {children}
      <Modal animationType="fade" transparent visible={Boolean(alert)}>
        <View style={styles.backdrop}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{alert?.title}</Text>
            <Text style={[styles.message, { color: colors.muted }]}>{alert?.message}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setAlert(null)}
              style={[styles.button, { backgroundColor: alert?.type === 'error' ? colors.danger : colors.primaryStrong }]}
            >
              <Text style={styles.buttonText}>Entendido</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAppAlert(): AlertContextValue {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error('useAppAlert must be used inside AppAlertProvider');
  }

  return context;
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.48)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  button: {
    alignItems: 'center',
    borderRadius: 8,
    minHeight: 46,
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    maxWidth: 420,
    padding: 18,
    width: '100%',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
  },
});
