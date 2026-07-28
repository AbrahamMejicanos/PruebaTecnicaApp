import type { Category } from './category';

export type NewsListItem = {
  id: number;
  title: string;
  image_url: string;
  excerpt: string;
  published_at: string;
  category: Category;
};

export type NewsDetail = NewsListItem & {
  body: string;
};
