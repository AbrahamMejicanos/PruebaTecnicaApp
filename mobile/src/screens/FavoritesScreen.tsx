import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { getApiErrorMessage } from '../api/client';
import { fetchFavorites, removeFavorite } from '../api/favorites.service';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { NewsCard } from '../components/NewsCard';
import type { FavoritesStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeProvider';
import type { NewsListItem } from '../types/news';

type Props = NativeStackScreenProps<FavoritesStackParamList, 'FavoritesList'>;

export function FavoritesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [favorites, setFavorites] = useState<NewsListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    setError(null);

    try {
      setFavorites(await fetchFavorites());
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  async function handleRemoveFavorite(item: NewsListItem) {
    setFavorites((current) => current.filter((favorite) => favorite.id !== item.id));

    try {
      await removeFavorite(item.id);
    } catch (requestError) {
      setFavorites((current) => [{ ...item, is_favorite: true }, ...current]);
      setError(getApiErrorMessage(requestError));
    }
  }

  if (isLoading) {
    return <LoadingState label="Cargando favoritos..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void loadFavorites()} />;
  }

  return (
    <FlatList
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin favoritos todavia</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>Marca noticias con el corazon para guardarlas aqui.</Text>
        </View>
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: colors.primary }]}>Guardadas</Text>
          <Text style={[styles.heading, { color: colors.text }]}>Tus noticias favoritas</Text>
        </View>
      }
      contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}
      data={favorites}
      keyExtractor={(item) => String(item.id)}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          tintColor={colors.primary}
          onRefresh={() => void loadFavorites(true)}
        />
      }
      renderItem={({ item }) => (
        <NewsCard
          item={item}
          onFavoritePress={(selected) => void handleRemoveFavorite(selected)}
          onPress={(selected) => navigation.navigate('FavoriteNewsDetail', { id: selected.id })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 28,
  },
  empty: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 70,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
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
  kicker: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
