import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { getApiErrorMessage } from '../api/client';
import { fetchNews } from '../api/news.service';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { NewsCard } from '../components/NewsCard';
import { useTheme } from '../theme/ThemeProvider';
import type { NewsListItem } from '../types/news';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeList'>;

export function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [news, setNews] = useState<NewsListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    setError(null);

    try {
      setNews(await fetchNews());
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadNews();
  }, [loadNews]);

  if (isLoading) {
    return <LoadingState label="Cargando noticias..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void loadNews()} />;
  }

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: colors.primary }]}>Ultimas historias</Text>
          <Text style={[styles.heading, { color: colors.text }]}>Noticias para seguir el pulso del dia</Text>
        </View>
      }
      contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}
      data={news}
      keyExtractor={(item) => String(item.id)}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          tintColor={colors.primary}
          onRefresh={() => void loadNews(true)}
        />
      }
      renderItem={({ item }) => (
        <NewsCard item={item} onPress={(selected) => navigation.navigate('NewsDetail', { id: selected.id })} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 28,
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
