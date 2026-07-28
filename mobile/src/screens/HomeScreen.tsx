import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';

import { addFavorite, removeFavorite } from '../api/favorites.service';
import { getApiErrorMessage } from '../api/client';
import { fetchPaginatedNews } from '../api/news.service';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { NewsCard } from '../components/NewsCard';
import { useAppAlert } from '../hooks/useAppAlert';
import { useTheme } from '../theme/ThemeProvider';
import type { NewsListItem } from '../types/news';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeList'>;

export function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { showError } = useAppAlert();
  const [news, setNews] = useState<NewsListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [visibleDatePicker, setVisibleDatePicker] = useState<'from' | 'to' | null>(null);
  const [appliedFilters, setAppliedFilters] = useState({ search: '', dateFrom: '', dateTo: '' });
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const loadNews = useCallback(async (targetPage = 1, refresh = false) => {
    refresh ? setIsRefreshing(true) : targetPage > 1 ? setIsLoadingMore(true) : setIsLoading(true);
    setError(null);

    try {
      const response = await fetchPaginatedNews({
        search: appliedFilters.search || undefined,
        date_from: appliedFilters.dateFrom || undefined,
        date_to: appliedFilters.dateTo || undefined,
        page: targetPage,
        per_page: 5,
      });

      setNews((current) => (targetPage === 1 ? response.items : [...current, ...response.items]));
      setPage(response.meta.current_page);
      setLastPage(response.meta.last_page);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    void loadNews(1);
  }, [loadNews]);

  async function handleFavorite(item: NewsListItem) {
    setNews((current) =>
      current.map((newsItem) =>
        newsItem.id === item.id ? { ...newsItem, is_favorite: !newsItem.is_favorite } : newsItem,
      ),
    );

    try {
      await (item.is_favorite ? removeFavorite(item.id) : addFavorite(item.id));
    } catch (requestError) {
      setNews((current) =>
        current.map((newsItem) =>
          newsItem.id === item.id ? { ...newsItem, is_favorite: item.is_favorite } : newsItem,
        ),
      );
      showError(getApiErrorMessage(requestError), 'No se pudo actualizar favorito');
    }
  }

  function applyFilters() {
    setAppliedFilters({
      search: search.trim(),
      dateFrom: dateFrom.trim(),
      dateTo: dateTo.trim(),
    });
  }

  function clearFilters() {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setAppliedFilters({ search: '', dateFrom: '', dateTo: '' });
  }

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    const target = visibleDatePicker;
    setVisibleDatePicker(null);

    if (event.type === 'dismissed' || !selectedDate || !target) {
      return;
    }

    const value = selectedDate.toISOString().slice(0, 10);
    target === 'from' ? setDateFrom(value) : setDateTo(value);
  }

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
          <View style={[styles.filters, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.searchBox, { borderColor: colors.border }]}>
              <Ionicons color={colors.muted} name="search" size={18} />
              <TextInput
                autoCapitalize="none"
                onChangeText={setSearch}
                placeholder="Buscar noticias"
                placeholderTextColor={colors.muted}
                style={[styles.searchInput, { color: colors.text }]}
                value={search}
              />
            </View>
            <View style={styles.dateRow}>
              <View style={styles.dateGroup}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setVisibleDatePicker('from')}
                  style={({ pressed }) => [
                    styles.dateButton,
                    { borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <Ionicons color={colors.primary} name="calendar-outline" size={17} />
                  <Text numberOfLines={1} style={[styles.dateButtonText, { color: dateFrom ? colors.text : colors.muted }]}>
                    {dateFrom || 'Desde'}
                  </Text>
                </Pressable>
                {dateFrom ? (
                  <Pressable accessibilityLabel="Limpiar desde" onPress={() => setDateFrom('')} style={styles.clearDateButton}>
                    <Ionicons color={colors.muted} name="close-circle" size={18} />
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.dateGroup}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setVisibleDatePicker('to')}
                  style={({ pressed }) => [
                    styles.dateButton,
                    { borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <Ionicons color={colors.primary} name="calendar-outline" size={17} />
                  <Text numberOfLines={1} style={[styles.dateButtonText, { color: dateTo ? colors.text : colors.muted }]}>
                    {dateTo || 'Hasta'}
                  </Text>
                </Pressable>
                {dateTo ? (
                  <Pressable accessibilityLabel="Limpiar hasta" onPress={() => setDateTo('')} style={styles.clearDateButton}>
                    <Ionicons color={colors.muted} name="close-circle" size={18} />
                  </Pressable>
                ) : null}
              </View>
            </View>
            <View style={styles.filterActions}>
              <Pressable
                accessibilityRole="button"
                onPress={applyFilters}
                style={({ pressed }) => [
                  styles.filterButton,
                  { backgroundColor: colors.primaryStrong, opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <Ionicons color="#fff" name="funnel" size={17} />
                <Text style={styles.primaryActionText}>Aplicar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={clearFilters}
                style={({ pressed }) => [
                  styles.clearButton,
                  { borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <Ionicons color={colors.primary} name="close" size={18} />
              </Pressable>
            </View>
          </View>
          {visibleDatePicker ? (
            <DateTimePicker
              mode="date"
              onChange={handleDateChange}
              value={new Date(`${visibleDatePicker === 'from' && dateFrom ? dateFrom : visibleDatePicker === 'to' && dateTo ? dateTo : new Date().toISOString().slice(0, 10)}T12:00:00`)}
            />
          ) : null}
        </View>
      }
      ListFooterComponent={
        page < lastPage ? (
          <Pressable
            accessibilityRole="button"
            disabled={isLoadingMore}
            onPress={() => void loadNews(page + 1)}
            style={({ pressed }) => [
              styles.loadMore,
              {
                backgroundColor: colors.elevated,
                borderColor: colors.border,
                opacity: pressed || isLoadingMore ? 0.75 : 1,
              },
            ]}
          >
            <Text style={[styles.loadMoreText, { color: colors.text }]}>
              {isLoadingMore ? 'Cargando...' : 'Cargar mas'}
            </Text>
          </Pressable>
        ) : null
      }
      contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}
      data={news}
      keyExtractor={(item) => String(item.id)}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          tintColor={colors.primary}
          onRefresh={() => void loadNews(1, true)}
        />
      }
      renderItem={({ item }) => (
        <NewsCard
          item={item}
          onFavoritePress={(selected) => void handleFavorite(selected)}
          onPress={(selected) => navigation.navigate('NewsDetail', { id: selected.id })}
        />
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
  clearButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  dateButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    minHeight: 44,
    minWidth: 0,
    paddingHorizontal: 10,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 0,
  },
  dateGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    minWidth: 0,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  clearDateButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 24,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 44,
  },
  filters: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    marginTop: 12,
    padding: 12,
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
  loadMore: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 46,
    justifyContent: 'center',
    marginTop: 2,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '800',
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  searchBox: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    minWidth: 0,
  },
});
