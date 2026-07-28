import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

type Props = {
  label?: string;
};

export function LoadingState({ label = 'Cargando...' }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={[styles.text, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    fontSize: 14,
  },
});
