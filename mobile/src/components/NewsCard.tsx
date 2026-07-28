import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import type { NewsListItem } from '../types/news';
import { formatDate } from '../utils/date';

type Props = {
  item: NewsListItem;
  onPress: (item: NewsListItem) => void;
  compact?: boolean;
};

export function NewsCard({ item, onPress, compact = false }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.card,
        compact ? styles.compactCard : null,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <Image source={{ uri: item.image_url }} style={compact ? styles.compactImage : styles.image} />
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={[styles.category, { color: colors.primary }]}>{item.category.name}</Text>
          <Text style={[styles.date, { color: colors.muted }]}>{formatDate(item.published_at)}</Text>
        </View>
        <Text numberOfLines={compact ? 2 : 3} style={[styles.title, { color: colors.text }]}>
          {item.title}
        </Text>
        {!compact ? (
          <Text numberOfLines={3} style={[styles.excerpt, { color: colors.muted }]}>
            {item.excerpt}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 8,
    padding: 14,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
  },
  category: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  compactCard: {
    flexDirection: 'row',
  },
  compactImage: {
    height: 116,
    width: 112,
  },
  date: {
    fontSize: 12,
  },
  excerpt: {
    fontSize: 14,
    lineHeight: 20,
  },
  image: {
    height: 188,
    width: '100%',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
});
