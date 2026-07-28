import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeProvider';

export function HeaderActions() {
  const { colors, mode, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel="Cambiar tema"
        accessibilityRole="button"
        onPress={toggleTheme}
        style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Ionicons color={colors.primary} name={mode === 'dark' ? 'sunny' : 'moon'} size={22} />
      </Pressable>
      <Pressable
        accessibilityLabel="Cerrar sesion"
        accessibilityRole="button"
        onPress={() => void logout()}
        style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Ionicons color={colors.primary} name="log-out-outline" size={23} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  row: {
    flexDirection: 'row',
    marginRight: 4,
  },
});
