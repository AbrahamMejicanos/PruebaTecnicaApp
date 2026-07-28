import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { createUser, fetchRoles, fetchUsers, updateUserRole } from '../api/admin.service';
import { getApiErrorMessage } from '../api/client';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { useAppAlert } from '../hooks/useAppAlert';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeProvider';
import type { AuthUser, UserRole } from '../types/auth';
import { canManageSuperusers, canManageUsers } from '../utils/permissions';

export function UsersAdminScreen() {
  const { colors } = useTheme();
  const { showAlert, showError } = useAppAlert();
  const { user: actor } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [form, setForm] = useState({ email: '', name: '', password: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasAccess = canManageUsers(actor?.role);
  const availableRoles = useMemo(
    () => (canManageSuperusers(actor?.role) ? roles : roles.filter((role) => role.slug !== 'superuser')),
    [actor?.role, roles],
  );

  const loadData = useCallback(async () => {
    if (!hasAccess) {
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const [roleData, userData] = await Promise.all([fetchRoles(), fetchUsers()]);
      setRoles(roleData);
      setUsers(userData);
      setSelectedRoleId((current) => current ?? roleData.find((role) => role.slug === 'user')?.id ?? roleData[0]?.id ?? null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [hasAccess]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleCreateUser() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !selectedRoleId) {
      showError('Completa nombre, correo, password y rol.');
      return;
    }

    setIsSaving(true);

    try {
      const created = await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role_id: selectedRoleId,
      });
      setUsers((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      setForm({ email: '', name: '', password: '' });
      showAlert('Usuario creado', 'La cuenta ya puede iniciar sesion.', 'success');
    } catch (requestError) {
      showError(getApiErrorMessage(requestError), 'No se pudo crear usuario');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRoleChange(target: AuthUser, roleId: number) {
    try {
      const updated = await updateUserRole(target.id, roleId);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      showAlert('Rol actualizado', 'Los permisos del usuario fueron actualizados.', 'success');
    } catch (requestError) {
      showError(getApiErrorMessage(requestError), 'No se pudo cambiar el rol');
    }
  }

  function canModify(target: AuthUser): boolean {
    return canManageSuperusers(actor?.role) || target.role.slug !== 'superuser';
  }

  if (!hasAccess) {
    return <ErrorState message="No tienes acceso a gestion de usuarios." onRetry={() => undefined} />;
  }

  if (isLoading) {
    return <LoadingState label="Cargando usuarios..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void loadData()} />;
  }

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: colors.primary }]}>Administracion</Text>
        <Text style={[styles.heading, { color: colors.text }]}>Usuarios</Text>
      </View>

      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.panelTitle, { color: colors.text }]}>Crear usuario</Text>
        <TextInput placeholder="Nombre" placeholderTextColor={colors.muted} value={form.name} onChangeText={(name) => setForm((current) => ({ ...current, name }))} style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
        <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor={colors.muted} value={form.email} onChangeText={(email) => setForm((current) => ({ ...current, email }))} style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
        <TextInput placeholder="Password" placeholderTextColor={colors.muted} secureTextEntry value={form.password} onChangeText={(password) => setForm((current) => ({ ...current, password }))} style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
        <View style={styles.roleRow}>
          {availableRoles.map((role) => (
            <Pressable
              key={role.id}
              onPress={() => setSelectedRoleId(role.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedRoleId === role.id ? colors.primarySoft : colors.elevated,
                  borderColor: selectedRoleId === role.id ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: selectedRoleId === role.id ? colors.primary : colors.text }]}>
                {role.name}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable disabled={isSaving} onPress={() => void handleCreateUser()} style={[styles.primaryButton, { backgroundColor: colors.primaryStrong, opacity: isSaving ? 0.7 : 1 }]}>
          <Ionicons color="#fff" name="person-add" size={18} />
          <Text style={styles.primaryButtonText}>{isSaving ? 'Creando...' : 'Crear usuario'}</Text>
        </Pressable>
      </View>

      {users.map((item) => (
        <View key={item.id} style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.userEmail, { color: colors.muted }]}>{item.email}</Text>
            <Text style={[styles.currentRole, { color: colors.primary }]}>{item.role.name}</Text>
          </View>
          <View style={styles.roleRow}>
            {availableRoles.map((role) => (
              <Pressable
                disabled={!canModify(item)}
                key={role.id}
                onPress={() => void handleRoleChange(item, role.id)}
                style={[
                  styles.smallChip,
                  {
                    backgroundColor: item.role.id === role.id ? colors.primarySoft : colors.elevated,
                    borderColor: item.role.id === role.id ? colors.primary : colors.border,
                    opacity: canModify(item) ? 1 : 0.45,
                  },
                ]}
              >
                <Text style={[styles.smallChipText, { color: item.role.id === role.id ? colors.primary : colors.text }]}>
                  {role.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    gap: 14,
    padding: 16,
    paddingBottom: 28,
  },
  currentRole: {
    fontSize: 12,
    fontWeight: '900',
  },
  feedback: {
    fontSize: 13,
    lineHeight: 19,
  },
  header: {
    gap: 8,
  },
  heading: {
    fontSize: 26,
    fontWeight: '900',
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 46,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  smallChip: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  smallChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  userCard: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  userEmail: {
    fontSize: 13,
  },
  userInfo: {
    gap: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: '900',
  },
});
