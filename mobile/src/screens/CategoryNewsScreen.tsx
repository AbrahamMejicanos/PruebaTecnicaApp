import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { getApiErrorMessage } from '../api/client';
import { fetchCategoryNews } from '../api/categories.service';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { NewsCard } from '../components/NewsCard';
import type { CategoriesStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeProvider';
import type { Category } from '../types/category';
import type { NewsListItem } from '../types/news';

type Props = NativeStackScreenProps<CategoriesStackParamList, 'CategoryNews'>;

export function CategoryNewsScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const [category, setCategory] = useState<Category | null>(null);
  const [news, setNews] = useState<NewsListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategoryNews = useCallback(async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    setError(null);

    try {
      const response = await fetchCategoryNews(route.params.id);
      setCategory(response.category);
      setNews(response.news);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [route.params.id]);

  useEffect(() => {
    void loadCategoryNews();
  }, [loadCategoryNews]);

  if (isLoading) {
    return <LoadingState label="Cargando categoria..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void loadCategoryNews()} />;
  }

  return (
    <FlatList
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin noticias</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>Esta categoria todavia no tiene publicaciones.</Text>
        </View>
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: colors.primary }]}>{category?.news_count ?? 0} noticias</Text>
          <Text style={[styles.heading, { color: colors.text }]}>{category?.name ?? 'Categoria'}</Text>
          {category?.description ? (
            <Text style={[styles.description, { color: colors.muted }]}>{category.description}</Text>
          ) : null}
        </View>
      }
      contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}
      data={news}
      keyExtractor={(item) => String(item.id)}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          tintColor={colors.primary}
          onRefresh={() => void loadCategoryNews(true)}
        />
      }
      renderItem={({ item }) => (
        <NewsCard item={item} onPress={(selected) => navigation.navigate('CategoryNewsDetail', { id: selected.id })} />
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
  description: {
    fontSize: 15,
    lineHeight: 22,
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
