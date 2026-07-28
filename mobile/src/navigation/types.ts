import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
};

export type HomeStackParamList = {
  HomeList: undefined;
  NewsDetail: { id: number };
};

export type CategoriesStackParamList = {
  CategoriesList: undefined;
  CategoryNews: { id: number };
  CategoryNewsDetail: { id: number };
};

export type FavoritesStackParamList = {
  FavoritesList: undefined;
  FavoriteNewsDetail: { id: number };
};

export type AppTabsParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  FavoritesTab: NavigatorScreenParams<FavoritesStackParamList>;
  CategoriesTab: NavigatorScreenParams<CategoriesStackParamList>;
  NewsAdminTab: undefined;
  UsersAdminTab: undefined;
};
