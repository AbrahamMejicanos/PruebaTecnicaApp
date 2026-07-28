import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getApiErrorMessage } from '../api/client';
import { fetchNewsDetail, fetchRecommendedNews } from '../api/news.service';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { NewsCard } from '../components/NewsCard';
import type { HomeStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeProvider';
import type { NewsDetail, NewsListItem } from '../types/news';
import { formatDate } from '../utils/date';

type Props = NativeStackScreenProps<HomeStackParamList, 'NewsDetail'>;

export function NewsDetailScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const [detail, setDetail] = useState<NewsDetail | null>(null);
  const [recommended, setRecommended] = useState<NewsListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [newsDetail, recommendedNews] = await Promise.all([
        fetchNewsDetail(route.params.id),
        fetchRecommendedNews(route.params.id),
      ]);
      setDetail(newsDetail);
      setRecommended(recommendedNews);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [route.params.id]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  if (isLoading) {
    return <LoadingState label="Abriendo noticia..." />;
  }

  if (error || !detail) {
    return <ErrorState message={error ?? 'No se encontro la noticia.'} onRetry={() => void loadDetail()} />;
  }

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}>
      <Image source={{ uri: detail.image_url }} style={styles.hero} />
      <View style={styles.article}>
        <View style={styles.metaRow}>
          <Text style={[styles.category, { color: colors.primary }]}>{detail.category.name}</Text>
          <Text style={[styles.date, { color: colors.muted }]}>{formatDate(detail.published_at)}</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{detail.title}</Text>
        <Text style={[styles.excerpt, { color: colors.muted }]}>{detail.excerpt}</Text>
        <Text style={[styles.body, { color: colors.text }]}>{detail.body}</Text>
      </View>

      <View style={styles.recommended}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recomendadas</Text>
        {recommended.map((item) => (
          <NewsCard
            compact
            item={item}
            key={item.id}
            onPress={(selected) => navigation.push('NewsDetail', { id: selected.id })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  article: {
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  body: {
    fontSize: 16,
    lineHeight: 25,
  },
  category: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  content: {
    paddingBottom: 28,
  },
  date: {
    fontSize: 12,
  },
  excerpt: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  hero: {
    height: 250,
    width: '100%',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recommended: {
    padding: 16,
    paddingTop: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 35,
  },
});
