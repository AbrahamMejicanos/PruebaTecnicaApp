import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeProvider';

export function HeaderActions() {
  const { colors, mode, toggleTheme } = useTheme();
  const { logout, user } = useAuth();

  return (
    <View style={styles.row}>
      {user?.role ? (
        <View style={[styles.roleBadge, { backgroundColor: colors.primarySoft }]}>
          <Text numberOfLines={1} style={[styles.roleText, { color: colors.primary }]}>
            {user.role.slug === 'superuser' ? 'Super' : user.role.name}
          </Text>
        </View>
      ) : null}
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
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    marginRight: 4,
  },
  roleBadge: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    maxWidth: 96,
    minHeight: 30,
    paddingHorizontal: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '900',
  },
});
