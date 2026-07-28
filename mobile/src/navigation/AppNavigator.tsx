import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderActions } from '../components/HeaderActions';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { CategoryNewsScreen } from '../screens/CategoryNewsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { NewsAdminScreen } from '../screens/NewsAdminScreen';
import { NewsDetailScreen } from '../screens/NewsDetailScreen';
import { UsersAdminScreen } from '../screens/UsersAdminScreen';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeProvider';
import { canManageNews, canManageUsers } from '../utils/permissions';
import type { AppTabsParamList, CategoriesStackParamList, FavoritesStackParamList, HomeStackParamList } from './types';

const Tab = createBottomTabNavigator<AppTabsParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CategoriesStack = createNativeStackNavigator<CategoriesStackParamList>();
const FavoritesStack = createNativeStackNavigator<FavoritesStackParamList>();

function HomeStackNavigator() {
  const { colors } = useTheme();

  return (
    <HomeStack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerRight: () => <HeaderActions />,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800' },
      }}
    >
      <HomeStack.Screen component={HomeScreen} name="HomeList" options={{ title: 'Noticias' }} />
      <HomeStack.Screen component={NewsDetailScreen} name="NewsDetail" options={{ title: 'Detalle' }} />
    </HomeStack.Navigator>
  );
}

function FavoritesStackNavigator() {
  const { colors } = useTheme();

  return (
    <FavoritesStack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerRight: () => <HeaderActions />,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800' },
      }}
    >
      <FavoritesStack.Screen component={FavoritesScreen} name="FavoritesList" options={{ title: 'Favoritos' }} />
      <FavoritesStack.Screen component={NewsDetailScreen} name="FavoriteNewsDetail" options={{ title: 'Detalle' }} />
    </FavoritesStack.Navigator>
  );
}

function CategoriesStackNavigator() {
  const { colors } = useTheme();

  return (
    <CategoriesStack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerRight: () => <HeaderActions />,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800' },
      }}
    >
      <CategoriesStack.Screen component={CategoriesScreen} name="CategoriesList" options={{ title: 'Categorias' }} />
      <CategoriesStack.Screen component={CategoryNewsScreen} name="CategoryNews" options={{ title: 'Categoria' }} />
      <CategoriesStack.Screen component={NewsDetailScreen} name="CategoryNewsDetail" options={{ title: 'Detalle' }} />
    </CategoriesStack.Navigator>
  );
}

export function AppNavigator() {
  const { colors } = useTheme();
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, size }) => {
          const name =
            route.name === 'HomeTab'
              ? 'newspaper'
              : route.name === 'FavoritesTab'
                ? 'heart'
                : route.name === 'CategoriesTab'
                  ? 'albums'
                  : route.name === 'NewsAdminTab'
                    ? 'create'
                    : 'people';

          return <Ionicons color={color} name={name} size={size} />;
        },
      })}
    >
      <Tab.Screen component={HomeStackNavigator} name="HomeTab" options={{ title: 'Inicio' }} />
      <Tab.Screen component={FavoritesStackNavigator} name="FavoritesTab" options={{ title: 'Favoritos' }} />
      <Tab.Screen component={CategoriesStackNavigator} name="CategoriesTab" options={{ title: 'Categorias' }} />
      {canManageNews(user?.role) ? (
        <Tab.Screen component={NewsAdminScreen} name="NewsAdminTab" options={{ title: 'Noticias' }} />
      ) : null}
      {canManageUsers(user?.role) ? (
        <Tab.Screen component={UsersAdminScreen} name="UsersAdminTab" options={{ title: 'Usuarios' }} />
      ) : null}
    </Tab.Navigator>
  );
}
