import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { fetchCategories } from '../api/categories.service';
import { getApiErrorMessage } from '../api/client';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { useTheme } from '../theme/ThemeProvider';
import type { Category } from '../types/category';

export function CategoriesScreen() {
  const { colors } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    setError(null);

    try {
      setCategories(await fetchCategories());
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  if (isLoading) {
    return <LoadingState label="Cargando categorias..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void loadCategories()} />;
  }

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: colors.primary }]}>Secciones</Text>
          <Text style={[styles.heading, { color: colors.text }]}>Categorias disponibles</Text>
        </View>
      }
      contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}
      data={categories}
      keyExtractor={(item) => String(item.id)}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          tintColor={colors.primary}
          onRefresh={() => void loadCategories(true)}
        />
      }
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}>
            <Ionicons color={colors.primary} name="albums" size={22} />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.description, { color: colors.muted }]}>{item.description ?? 'Sin descripcion'}</Text>
          </View>
          <Text style={[styles.id, { color: colors.primary }]}>#{item.id}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
    minHeight: 92,
    padding: 14,
  },
  cardText: {
    flex: 1,
    gap: 6,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  header: {
    gap: 8,
    marginBottom: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  id: {
    fontSize: 13,
    fontWeight: '900',
  },
  kicker: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 18,
    fontWeight: '900',
  },
});
