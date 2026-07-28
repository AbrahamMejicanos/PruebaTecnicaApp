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
      <Image
        resizeMode="cover"
        source={{ uri: item.image_url }}
        style={compact ? styles.compactImage : styles.image}
      />
      <View style={[styles.body, compact ? styles.compactBody : null]}>
        <View style={[styles.metaRow, compact ? styles.compactMetaRow : null]}>
          <Text numberOfLines={1} style={[styles.category, { color: colors.primary }]}>
            {item.category.name}
          </Text>
          <Text numberOfLines={1} style={[styles.date, compact ? styles.compactDate : null, { color: colors.muted }]}>
            {formatDate(item.published_at)}
          </Text>
        </View>
        <Text
          numberOfLines={compact ? 2 : 3}
          style={[styles.title, compact ? styles.compactTitle : null, { color: colors.text }]}
        >
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
    alignSelf: 'stretch',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    width: '100%',
  },
  category: {
    flex: 1,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '800',
    minWidth: 0,
    textTransform: 'uppercase',
  },
  compactBody: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  compactCard: {
    alignItems: 'stretch',
    flexDirection: 'row',
    minHeight: 108,
    width: '100%',
  },
  compactDate: {
    maxWidth: 86,
  },
  compactImage: {
    height: 108,
    width: 94,
  },
  compactMetaRow: {
    gap: 6,
  },
  compactTitle: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 20,
    minWidth: 0,
  },
  date: {
    flexShrink: 0,
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
    minWidth: 0,
  },
  title: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    minWidth: 0,
  },
});
