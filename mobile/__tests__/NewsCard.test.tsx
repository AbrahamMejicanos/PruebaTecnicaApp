import { render } from '@testing-library/react-native';

import { NewsCard } from '../src/components/NewsCard';
import { ThemeProvider } from '../src/theme/ThemeProvider';

const news = {
  id: 1,
  title: 'Pruebas de API ayudan a estabilizar productos moviles',
  image_url: 'http://localhost/image.png',
  excerpt: 'Resumen',
  published_at: '2026-07-28T12:00:00.000000Z',
  is_favorite: false,
  category: {
    id: 1,
    name: 'Tecnologia',
    description: 'Noticias de tecnologia',
    news_count: 4,
  },
};

describe('NewsCard', () => {
  it('shows the publication date as secondary information', async () => {
    const { getByText } = await render(
      <ThemeProvider>
        <NewsCard item={news} onPress={() => undefined} />
      </ThemeProvider>,
    );

    expect(getByText(/Publicado:/)).toBeTruthy();
  });
});
