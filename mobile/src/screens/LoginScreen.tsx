import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeProvider';

export function LoginScreen() {
  const { colors, mode, toggleTheme } = useTheme();
  const { clearSessionMessage, login, sessionMessage } = useAuth();
  const [email, setEmail] = useState('amejicanos@example.com');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setIsSubmitting(true);
    setError(null);
    clearSessionMessage();

    try {
      await login(email.trim(), password);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.topBar}>
          <View style={[styles.logo, { backgroundColor: colors.primarySoft }]}>
            <Ionicons color={colors.primary} name="newspaper" size={28} />
          </View>
          <Pressable accessibilityRole="button" onPress={toggleTheme} style={styles.themeButton}>
            <Ionicons color={colors.primary} name={mode === 'dark' ? 'sunny' : 'moon'} size={24} />
          </Pressable>
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Prueba Abraham Mejicanos</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Accede a tus noticias protegidas.</Text>
        </View>

        <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="tu-correo@example.com"
            placeholderTextColor={colors.muted}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            value={email}
          />

          <Text style={[styles.label, { color: colors.text }]}>Password</Text>
          <TextInput
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            value={password}
          />

          {sessionMessage ? <Text style={[styles.feedback, { color: colors.primary }]}>{sessionMessage}</Text> : null}
          {error ? <Text style={[styles.feedback, { color: colors.danger }]}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={() => void handleLogin()}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.primaryStrong, opacity: pressed || isSubmitting ? 0.75 : 1 },
            ]}
          >
            <Ionicons color="#fff" name="log-in-outline" size={20} />
            <Text style={styles.buttonText}>{isSubmitting ? 'Ingresando...' : 'Iniciar sesion'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 50,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 22,
  },
  copy: {
    gap: 8,
    marginBottom: 26,
  },
  feedback: {
    fontSize: 13,
    lineHeight: 19,
  },
  form: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
  },
  logo: {
    alignItems: 'center',
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  safeArea: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 23,
  },
  themeButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 34,
  },
});
